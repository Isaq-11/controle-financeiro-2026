package com.ifpr.backend.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AiInsightDTO {

    private boolean configurado;
    private String status; // "SUCESSO", "CONFIGURACAO_PENDENTE", "SEM_DADOS", "ERRO"
    private String mensagem;
    private String titulo;
    private Integer scoreSaudeFinanceira; // 0 a 100
    private String statusSaude; // "Excelente", "Saudável", "Atenção", "Crítico"
    private String resumoExecutivo;
    private List<String> pontosPositivos = new ArrayList<>();
    private List<String> pontosAtencao = new ArrayList<>();
    private List<String> recomendacoes = new ArrayList<>();
    private String mensagemDestaque;
    private LocalDateTime geradoEm;
    private String modelo;

    public AiInsightDTO() {
        this.geradoEm = LocalDateTime.now();
    }

    public static AiInsightDTO configuracaoPendente(String mensagem) {
        AiInsightDTO dto = new AiInsightDTO();
        dto.setConfigurado(false);
        dto.setStatus("CONFIGURACAO_PENDENTE");
        dto.setMensagem(mensagem != null ? mensagem : "Chave de API do Google Gemini não configurada.");
        return dto;
    }

    public static AiInsightDTO semDados(String mensagem) {
        AiInsightDTO dto = new AiInsightDTO();
        dto.setConfigurado(true);
        dto.setStatus("SEM_DADOS");
        dto.setMensagem(mensagem != null ? mensagem : "Não há dados suficientes no período selecionado para análise.");
        return dto;
    }

    public static AiInsightDTO erro(String mensagem) {
        AiInsightDTO dto = new AiInsightDTO();
        dto.setConfigurado(true);
        dto.setStatus("ERRO");
        dto.setMensagem(mensagem);
        return dto;
    }

    public boolean isConfigurado() {
        return configurado;
    }

    public void setConfigurado(boolean configurado) {
        this.configurado = configurado;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public Integer getScoreSaudeFinanceira() {
        return scoreSaudeFinanceira;
    }

    public void setScoreSaudeFinanceira(Integer scoreSaudeFinanceira) {
        this.scoreSaudeFinanceira = scoreSaudeFinanceira;
    }

    public String getStatusSaude() {
        return statusSaude;
    }

    public void setStatusSaude(String statusSaude) {
        this.statusSaude = statusSaude;
    }

    public String getResumoExecutivo() {
        return resumoExecutivo;
    }

    public void setResumoExecutivo(String resumoExecutivo) {
        this.resumoExecutivo = resumoExecutivo;
    }

    public List<String> getPontosPositivos() {
        return pontosPositivos;
    }

    public void setPontosPositivos(List<String> pontosPositivos) {
        this.pontosPositivos = pontosPositivos != null ? pontosPositivos : new ArrayList<>();
    }

    public List<String> getPontosAtencao() {
        return pontosAtencao;
    }

    public void setPontosAtencao(List<String> pontosAtencao) {
        this.pontosAtencao = pontosAtencao != null ? pontosAtencao : new ArrayList<>();
    }

    public List<String> getRecomendacoes() {
        return recomendacoes;
    }

    public void setRecomendacoes(List<String> recomendacoes) {
        this.recomendacoes = recomendacoes != null ? recomendacoes : new ArrayList<>();
    }

    public String getMensagemDestaque() {
        return mensagemDestaque;
    }

    public void setMensagemDestaque(String mensagemDestaque) {
        this.mensagemDestaque = mensagemDestaque;
    }

    public LocalDateTime getGeradoEm() {
        return geradoEm;
    }

    public void setGeradoEm(LocalDateTime geradoEm) {
        this.geradoEm = geradoEm;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }
}

