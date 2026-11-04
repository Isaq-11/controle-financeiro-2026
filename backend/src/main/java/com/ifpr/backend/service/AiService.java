package com.ifpr.backend.service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ifpr.backend.dto.AiInsightDTO;
import com.ifpr.backend.dto.RelatorioFinanceiroDTO;
import com.ifpr.backend.model.Usuario;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);
    private static final Locale PT_BR = new Locale("pt", "BR");

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-flash-lite-latest}")
    private String model;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String apiUrl;

    @Autowired
    private TransacaoService transacaoService;

    @Autowired
    private CarteiraService carteiraService;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public AiService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(30000);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }

    public boolean isConfigurado() {
        if (apiKey == null)
            return false;
        String limpa = apiKey.trim();
        return !limpa.isEmpty() && !limpa.equalsIgnoreCase("sua_chave_aqui") && limpa.length() > 10;
    }

    public Map<String, Object> obterStatus(Long carteiraId, Usuario usuario) {
        carteiraService.validarMembro(carteiraId, usuario.getId());
        Map<String, Object> status = new HashMap<>();
        status.put("configurado", isConfigurado());
        status.put("modelo", model);
        status.put("provedor", "Google Gemini (Gratuito)");
        return status;
    }

    public AiInsightDTO gerarInsights(Long carteiraId, LocalDate startDate, LocalDate endDate, Usuario usuario) {
        carteiraService.validarMembro(carteiraId, usuario.getId());

        if (!isConfigurado()) {
            return AiInsightDTO.configuracaoPendente(
                    "A chave de API gratuita do Google Gemini ainda não foi informada. Configure a variável GEMINI_API_KEY ou edite application-secrets.properties com sua chave do Google AI Studio.");
        }

        // Obtém o relatório financeiro consolidado do período
        RelatorioFinanceiroDTO relatorio = transacaoService.gerarRelatorioFinanceiro(
                carteiraId, startDate, endDate, null, null, null, usuario);

        if (relatorio.getTotalTransacoes() <= 0) {
            String periodoStr = relatorio.getPeriodoDescricao() != null ? relatorio.getPeriodoDescricao()
                    : "selecionado";
            return AiInsightDTO.semDados(
                    "Esta carteira não possui transações no período " + periodoStr
                            + ". Registre receitas e despesas para gerar o diagnóstico inteligente.");
        }

        String prompt = montarPrompt(relatorio);

        // Lista de modelos suportados para tolerância a falhas caso haja alta demanda
        // temporária no Google
        List<String> modelosParaTentar = new ArrayList<>();
        if (model != null && !model.isBlank()) {
            modelosParaTentar.add(model.trim());
        }
        for (String m : List.of("gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest")) {
            if (!modelosParaTentar.contains(m)) {
                modelosParaTentar.add(m);
            }
        }

        HttpStatusCodeException ultimoErroHttp = null;
        for (String modeloTentativa : modelosParaTentar) {
            try {
                String url = String.format("%s/%s:generateContent?key=%s", apiUrl, modeloTentativa, apiKey.trim());

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                // Monta payload do Gemini
                Map<String, Object> part = Map.of("text", prompt);
                Map<String, Object> content = Map.of("parts", List.of(part));
                Map<String, Object> generationConfig = Map.of(
                        "temperature", 0.3,
                        "topK", 40,
                        "topP", 0.95,
                        "maxOutputTokens", 2048,
                        "responseMimeType", "application/json");
                Map<String, Object> body = Map.of(
                        "contents", List.of(content),
                        "generationConfig", generationConfig);

                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

                ResponseEntity<String> response = restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        requestEntity,
                        String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    AiInsightDTO dto = processarRespostaGemini(response.getBody());
                    dto.setModelo(modeloTentativa);
                    return dto;
                }

            } catch (HttpStatusCodeException ex) {
                ultimoErroHttp = ex;
                int code = ex.getStatusCode().value();
                logger.warn("Tentativa com modelo {} falhou: HTTP {}", modeloTentativa, code);
                if (code == 400 || code == 403) {
                    // Erro de chave inválida não adianta tentar outro modelo
                    return AiInsightDTO.erro(
                            "A chave de API do Gemini informada é inválida ou não possui permissão. Verifique sua chave no Google AI Studio.");
                }
                // Se for 404 (modelo depreciado) ou 503 (alta demanda), tenta o próximo modelo
                // da lista
            } catch (Exception ex) {
                logger.error("Erro inesperado com modelo {}", modeloTentativa, ex);
            }
        }

        if (ultimoErroHttp != null) {
            int code = ultimoErroHttp.getStatusCode().value();
            if (code == 429) {
                return AiInsightDTO.erro(
                        "Limite temporário de requisições gratuitas do Gemini excedido (15 requisições/min). Aguarde alguns segundos e tente novamente.");
            }
            return AiInsightDTO.erro("Erro ao consultar o Google Gemini: " + ultimoErroHttp.getStatusText());
        }

        return AiInsightDTO.erro(
                "Não foi possível conectar ao Google Gemini. Verifique sua conexão com a internet ou as configurações de rede.");
    }

    private String montarPrompt(RelatorioFinanceiroDTO r) {
        NumberFormat moeda = NumberFormat.getCurrencyInstance(PT_BR);

        String periodoStr = r.getPeriodoDescricao() != null ? r.getPeriodoDescricao() : "Período informado";

        StringBuilder sb = new StringBuilder();
        sb.append(
                "Você é um consultor financeiro pessoal e empresarial especialista em análise de fluxo de caixa, orçamento familiar e finanças comportamentais.\n");
        sb.append(
                "Analise minuciosamente os seguintes dados consolidados da carteira financeira e produza um diagnóstico executivo com recomendações práticas.\n\n");

        sb.append("DADOS CONSOLIDADOS DO PERÍODO (").append(periodoStr).append("):\n");
        sb.append("- Total de Receitas: ")
                .append(moeda.format(r.getTotalReceitas() != null ? r.getTotalReceitas() : BigDecimal.ZERO))
                .append("\n");
        sb.append("- Total de Despesas: ")
                .append(moeda.format(r.getTotalDespesas() != null ? r.getTotalDespesas() : BigDecimal.ZERO))
                .append("\n");
        sb.append("- Saldo Líquido do Período: ")
                .append(moeda.format(r.getSaldoLiquido() != null ? r.getSaldoLiquido() : BigDecimal.ZERO)).append("\n");
        sb.append("- Taxa de Poupança: ").append(r.getTaxaPoupanca() != null ? r.getTaxaPoupanca() : BigDecimal.ZERO)
                .append("%\n");
        sb.append("- Média de Gasto Diário: ")
                .append(moeda.format(r.getMediaGastoDiario() != null ? r.getMediaGastoDiario() : BigDecimal.ZERO))
                .append("\n");
        sb.append("- Quantidade de Transações: ").append(r.getTotalTransacoes()).append("\n\n");

        if (r.getPorCategoria() != null && !r.getPorCategoria().isEmpty()) {
            sb.append("DISTRIBUIÇÃO POR CATEGORIA:\n");
            for (RelatorioFinanceiroDTO.CategoriaRelatorioDTO cat : r.getPorCategoria()) {
                sb.append(String.format("  • [%s] %s: %s (%s%% de representatividade, %d lançamentos)\n",
                        cat.getTipo(),
                        cat.getNome(),
                        moeda.format(cat.getTotal()),
                        cat.getPercentual() != null ? cat.getPercentual() : BigDecimal.ZERO,
                        cat.getQuantidade()));
            }
            sb.append("\n");
        }

        if (r.getPorMembro() != null && r.getPorMembro().size() > 1) {
            sb.append("DIVISÃO DE GASTOS E RECEITAS ENTRE MEMBROS DA CARTEIRA:\n");
            for (RelatorioFinanceiroDTO.MembroRelatorioDTO m : r.getPorMembro()) {
                sb.append(String.format("  • Membro '%s': Receitas=%s, Despesas=%s, Total Movimentado=%s\n",
                        m.getNome(),
                        moeda.format(m.getTotalReceitas()),
                        moeda.format(m.getTotalDespesas()),
                        moeda.format(m.getTotalMovimentado())));
            }
            sb.append("\n");
        }

        sb.append("INSTRUÇÕES OBRIGATÓRIAS:\n");
        sb.append(
                "1. Calcule um 'scoreSaudeFinanceira' inteiro de 0 a 100 baseado na taxa de poupança, equilíbrio entre receitas e despesas e concentração de gastos.\n");
        sb.append(
                "2. O 'statusSaude' deve ser exatamente um destes: 'Excelente', 'Saudável', 'Atenção' ou 'Crítico'.\n");
        sb.append("3. Forneça um 'resumoExecutivo' de 2 a 3 frases sintetizando a situação financeira.\n");
        sb.append("4. Liste entre 2 e 3 'pontosPositivos' objetivos e encorajadores.\n");
        sb.append("5. Liste entre 2 e 3 'pontosAtencao' realistas com riscos potenciais.\n");
        sb.append("6. Liste exatamente 3 'recomendacoes' práticas, aplicáveis e concretas.\n");
        sb.append("7. Crie uma 'mensagemDestaque' curta de síntese ou motivação.\n");
        sb.append("8. Responda em Português do Brasil.\n");
        sb.append(
                "9. IMPORTANTE: Retorne ESTRITAMENTE um objeto JSON válido no formato abaixo, sem delimitadores markdown, sem tags HTML e sem texto fora do JSON:\n");
        sb.append("{\n");
        sb.append("  \"titulo\": \"Diagnóstico Financeiro - ...\",\n");
        sb.append("  \"scoreSaudeFinanceira\": 85,\n");
        sb.append("  \"statusSaude\": \"Saudável\",\n");
        sb.append("  \"resumoExecutivo\": \"...\",\n");
        sb.append("  \"pontosPositivos\": [\"...\", \"...\"],\n");
        sb.append("  \"pontosAtencao\": [\"...\", \"...\"],\n");
        sb.append("  \"recomendacoes\": [\"...\", \"...\", \"...\"],\n");
        sb.append("  \"mensagemDestaque\": \"...\"\n");
        sb.append("}\n");

        return sb.toString();
    }

    private AiInsightDTO processarRespostaGemini(String jsonResposta) {
        try {
            JsonNode root = objectMapper.readTree(jsonResposta);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                return AiInsightDTO.erro("O Gemini não retornou respostas candidatas.");
            }

            JsonNode firstCandidate = candidates.get(0);
            JsonNode parts = firstCandidate.path("content").path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                return AiInsightDTO.erro("O conteúdo da resposta do Gemini está vazio.");
            }

            String rawText = parts.get(0).path("text").asText();
            if (rawText == null || rawText.trim().isEmpty()) {
                return AiInsightDTO.erro("A resposta textual da IA veio em branco.");
            }

            // Limpa eventuais marcadores ```json ... ``` se o modelo retornar
            String jsonLimpo = limparDelimitadoresJson(rawText);

            JsonNode parsed = objectMapper.readTree(jsonLimpo);

            AiInsightDTO dto = new AiInsightDTO();
            dto.setConfigurado(true);
            dto.setStatus("SUCESSO");
            dto.setModelo(model);
            dto.setGeradoEm(LocalDateTime.now());

            dto.setTitulo(parsed.path("titulo").asText("Diagnóstico Financeiro Inteligente"));
            dto.setScoreSaudeFinanceira(parsed.path("scoreSaudeFinanceira").asInt(70));
            dto.setStatusSaude(parsed.path("statusSaude").asText("Saudável"));
            dto.setResumoExecutivo(parsed.path("resumoExecutivo").asText(""));
            dto.setMensagemDestaque(parsed.path("mensagemDestaque").asText(""));

            List<String> positivos = new ArrayList<>();
            JsonNode posNode = parsed.path("pontosPositivos");
            if (posNode.isArray()) {
                posNode.forEach(item -> positivos.add(item.asText()));
            }
            dto.setPontosPositivos(positivos);

            List<String> atencao = new ArrayList<>();
            JsonNode atNode = parsed.path("pontosAtencao");
            if (atNode.isArray()) {
                atNode.forEach(item -> atencao.add(item.asText()));
            }
            dto.setPontosAtencao(atencao);

            List<String> recomendacoes = new ArrayList<>();
            JsonNode recNode = parsed.path("recomendacoes");
            if (recNode.isArray()) {
                recNode.forEach(item -> recomendacoes.add(item.asText()));
            }
            dto.setRecomendacoes(recomendacoes);

            return dto;

        } catch (Exception ex) {
            logger.error("Falha ao deserializar resposta JSON do Gemini: {}", jsonResposta, ex);
            return AiInsightDTO.erro("Não foi possível processar a resposta gerada pela inteligência artificial.");
        }
    }

    private String limparDelimitadoresJson(String texto) {
        String limpo = texto.trim();
        if (limpo.startsWith("```json")) {
            limpo = limpo.substring(7);
        } else if (limpo.startsWith("```")) {
            limpo = limpo.substring(3);
        }
        if (limpo.endsWith("```")) {
            limpo = limpo.substring(0, limpo.length() - 3);
        }
        return limpo.trim();
    }
}
