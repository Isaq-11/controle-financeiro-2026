package com.ifpr.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ifpr.backend.dto.RelatorioFinanceiroDTO;
import com.ifpr.backend.dto.ResumoFinanceiroDTO;
import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.TipoTransacao;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.CategoriaRepository;
import com.ifpr.backend.repository.TransacaoRepository;

@Service
public class TransacaoService {

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private CarteiraService carteiraService;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private SseNotificacaoService sseNotificacaoService;

    public Page<Transacao> listarComFiltros(
            Long carteiraId,
            TipoTransacao tipo,
            Long categoriaId,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable,
            Usuario usuario) {

        carteiraService.validarMembro(carteiraId, usuario.getId());
        return transacaoRepository.findComFiltros(carteiraId, tipo, categoriaId, startDate, endDate, pageable);
    }

    public Transacao buscarPorId(Long carteiraId, Long id, Usuario usuario) {
        carteiraService.validarMembro(carteiraId, usuario.getId());
        Transacao transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada com id: " + id));

        if (!transacao.getCarteira().getId().equals(carteiraId)) {
            throw new ResourceNotFoundException("Transação não pertence a esta carteira.");
        }

        return transacao;
    }

    public Transacao criar(Long carteiraId, Transacao transacao, Long categoriaId, Usuario usuario) {
        carteiraService.validarPermissaoEscrita(carteiraId, usuario.getId());

        Carteira carteira = carteiraService.buscarPorId(carteiraId, usuario.getId());
        transacao.setCarteira(carteira);
        transacao.setCriadoPor(usuario);

        if (categoriaId != null) {
            Categoria categoria = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
            transacao.setCategoria(categoria);
        }

        Transacao salva = transacaoRepository.save(transacao);

        Map<String, Object> evento = new HashMap<>();
        evento.put("carteiraId", carteiraId);
        evento.put("acao", "CRIADA");
        evento.put("transacaoId", salva.getId());
        evento.put("descricao", salva.getDescricao());
        evento.put("valor", salva.getValor());
        evento.put("tipo", salva.getTipo() != null ? salva.getTipo().name() : null);
        evento.put("autorId", usuario.getId());
        evento.put("autorNome", usuario.getName());
        evento.put("timestamp", System.currentTimeMillis());

        sseNotificacaoService.notificarMembrosCarteira(carteiraId, "transacao-alterada", evento);

        return salva;
    }

    public Transacao atualizar(Long carteiraId, Long id, Transacao transacaoAtualizada, Long categoriaId, Usuario usuario) {
        carteiraService.validarPermissaoEscrita(carteiraId, usuario.getId());

        Transacao dbTransacao = buscarPorId(carteiraId, id, usuario);

        dbTransacao.setTipo(transacaoAtualizada.getTipo());
        dbTransacao.setValor(transacaoAtualizada.getValor());
        dbTransacao.setDescricao(transacaoAtualizada.getDescricao());
        dbTransacao.setData(transacaoAtualizada.getData());
        dbTransacao.setAtualizadoPor(usuario);

        if (categoriaId != null) {
            Categoria categoria = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
            dbTransacao.setCategoria(categoria);
        } else {
            dbTransacao.setCategoria(null);
        }

        Transacao salva = transacaoRepository.save(dbTransacao);

        Map<String, Object> evento = new HashMap<>();
        evento.put("carteiraId", carteiraId);
        evento.put("acao", "ATUALIZADA");
        evento.put("transacaoId", salva.getId());
        evento.put("descricao", salva.getDescricao());
        evento.put("valor", salva.getValor());
        evento.put("tipo", salva.getTipo() != null ? salva.getTipo().name() : null);
        evento.put("autorId", usuario.getId());
        evento.put("autorNome", usuario.getName());
        evento.put("timestamp", System.currentTimeMillis());

        sseNotificacaoService.notificarMembrosCarteira(carteiraId, "transacao-alterada", evento);

        return salva;
    }

    public void excluir(Long carteiraId, Long id, Usuario usuario) {
        carteiraService.validarPermissaoEscrita(carteiraId, usuario.getId());
        Transacao dbTransacao = buscarPorId(carteiraId, id, usuario);
        String desc = dbTransacao.getDescricao();
        BigDecimal val = dbTransacao.getValor();
        TipoTransacao tipo = dbTransacao.getTipo();

        transacaoRepository.delete(dbTransacao);

        Map<String, Object> evento = new HashMap<>();
        evento.put("carteiraId", carteiraId);
        evento.put("acao", "EXCLUIDA");
        evento.put("transacaoId", id);
        evento.put("descricao", desc);
        evento.put("valor", val);
        evento.put("tipo", tipo != null ? tipo.name() : null);
        evento.put("autorId", usuario.getId());
        evento.put("autorNome", usuario.getName());
        evento.put("timestamp", System.currentTimeMillis());

        sseNotificacaoService.notificarMembrosCarteira(carteiraId, "transacao-alterada", evento);
    }

    // Calcula o Resumo Financeiro (Dashboard) conforme especificado no PDF 2, seção 5.7
    public ResumoFinanceiroDTO calcularResumo(Long carteiraId, LocalDate startDate, LocalDate endDate, Usuario usuario) {
        carteiraService.validarMembro(carteiraId, usuario.getId());

        List<Transacao> transacoes = transacaoRepository.findByCarteiraIdEPeriodo(carteiraId, startDate, endDate);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        Map<String, ResumoFinanceiroDTO.CategoriaResumoDTO> catMap = new HashMap<>();
        Map<String, ResumoFinanceiroDTO.MesResumoDTO> mesMap = new HashMap<>();

        for (Transacao t : transacoes) {
            BigDecimal valor = t.getValor() != null ? t.getValor() : BigDecimal.ZERO;

            if (t.getTipo() == TipoTransacao.RECEITA) {
                totalIncome = totalIncome.add(valor);
            } else if (t.getTipo() == TipoTransacao.DESPESA) {
                totalExpense = totalExpense.add(valor);
            }

            // Agrupamento por Categoria
            if (t.getCategoria() != null) {
                String catKey = t.getCategoria().getId().toString();
                ResumoFinanceiroDTO.CategoriaResumoDTO catDTO = catMap.getOrDefault(catKey,
                        new ResumoFinanceiroDTO.CategoriaResumoDTO(t.getCategoria().getId(), t.getCategoria().getNome(), BigDecimal.ZERO));
                catDTO.setTotal(catDTO.getTotal().add(valor));
                catMap.put(catKey, catDTO);
            }

            // Agrupamento por Mês (YYYY-MM)
            if (t.getData() != null) {
                String mesKey = t.getData().getYear() + "-" + String.format("%02d", t.getData().getMonthValue());
                ResumoFinanceiroDTO.MesResumoDTO mesDTO = mesMap.getOrDefault(mesKey,
                        new ResumoFinanceiroDTO.MesResumoDTO(mesKey, BigDecimal.ZERO, BigDecimal.ZERO));

                if (t.getTipo() == TipoTransacao.RECEITA) {
                    mesDTO.setIncome(mesDTO.getIncome().add(valor));
                } else {
                    mesDTO.setExpense(mesDTO.getExpense().add(valor));
                }
                mesMap.put(mesKey, mesDTO);
            }
        }

        BigDecimal balance = totalIncome.subtract(totalExpense).setScale(2, RoundingMode.HALF_UP);

        ResumoFinanceiroDTO resumo = new ResumoFinanceiroDTO();
        resumo.setTotalIncome(totalIncome.setScale(2, RoundingMode.HALF_UP));
        resumo.setTotalExpense(totalExpense.setScale(2, RoundingMode.HALF_UP));
        resumo.setBalance(balance);
        resumo.setTransactionCount(transacoes.size());
        resumo.setByCategory(new ArrayList<>(catMap.values()));
        resumo.setByMonth(new ArrayList<>(mesMap.values()));

        return resumo;
    }

    // Gera relatório financeiro completo com extrato, indicadores e consolidações por categoria, mês e membro
    public RelatorioFinanceiroDTO gerarRelatorioFinanceiro(
            Long carteiraId,
            LocalDate startDate,
            LocalDate endDate,
            TipoTransacao tipo,
            Long categoryId,
            Long memberId,
            Usuario usuario) {

        carteiraService.validarMembro(carteiraId, usuario.getId());

        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        }

        List<Transacao> transacoes = transacaoRepository.findParaRelatorio(carteiraId, tipo, categoryId, memberId, startDate, endDate);

        BigDecimal totalReceitas = BigDecimal.ZERO;
        BigDecimal totalDespesas = BigDecimal.ZERO;

        Map<String, RelatorioFinanceiroDTO.CategoriaRelatorioDTO> catMap = new HashMap<>();
        Map<String, RelatorioFinanceiroDTO.MesRelatorioDTO> mesMap = new HashMap<>();
        Map<Long, RelatorioFinanceiroDTO.MembroRelatorioDTO> membroMap = new HashMap<>();

        for (Transacao t : transacoes) {
            BigDecimal valor = t.getValor() != null ? t.getValor() : BigDecimal.ZERO;

            if (t.getTipo() == TipoTransacao.RECEITA) {
                totalReceitas = totalReceitas.add(valor);
            } else if (t.getTipo() == TipoTransacao.DESPESA) {
                totalDespesas = totalDespesas.add(valor);
            }

            // Agrupamento por Categoria
            String catKey = t.getCategoria() != null ? t.getCategoria().getId().toString() : "SEM_CATEGORIA";
            String catNome = t.getCategoria() != null ? t.getCategoria().getNome() : "Geral / Outros";
            String catCor = t.getCategoria() != null && t.getCategoria().getCor() != null ? t.getCategoria().getCor() : (t.getTipo() == TipoTransacao.RECEITA ? "#10B981" : "#EF4444");
            String catIcone = t.getCategoria() != null && t.getCategoria().getIcone() != null ? t.getCategoria().getIcone() : "tag";
            Long catId = t.getCategoria() != null ? t.getCategoria().getId() : null;

            RelatorioFinanceiroDTO.CategoriaRelatorioDTO catDTO = catMap.getOrDefault(catKey,
                    new RelatorioFinanceiroDTO.CategoriaRelatorioDTO(catId, catNome, t.getTipo(), catCor, catIcone));
            catDTO.setTotal(catDTO.getTotal().add(valor));
            catDTO.setQuantidade(catDTO.getQuantidade() + 1);
            catMap.put(catKey, catDTO);

            // Agrupamento por Mês
            if (t.getData() != null) {
                String mesKey = t.getData().getYear() + "-" + String.format("%02d", t.getData().getMonthValue());
                RelatorioFinanceiroDTO.MesRelatorioDTO mesDTO = mesMap.getOrDefault(mesKey,
                        new RelatorioFinanceiroDTO.MesRelatorioDTO(mesKey, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));

                if (t.getTipo() == TipoTransacao.RECEITA) {
                    mesDTO.setReceitas(mesDTO.getReceitas().add(valor));
                } else {
                    mesDTO.setDespesas(mesDTO.getDespesas().add(valor));
                }
                mesDTO.setSaldo(mesDTO.getReceitas().subtract(mesDTO.getDespesas()));
                mesMap.put(mesKey, mesDTO);
            }

            // Agrupamento por Membro (Responsável)
            if (t.getCriadoPor() != null) {
                Long mId = t.getCriadoPor().getId();
                String mNome = t.getCriadoPor().getName() != null ? t.getCriadoPor().getName() : t.getCriadoPor().getEmail();
                String mEmail = t.getCriadoPor().getEmail();

                RelatorioFinanceiroDTO.MembroRelatorioDTO mDTO = membroMap.getOrDefault(mId,
                        new RelatorioFinanceiroDTO.MembroRelatorioDTO(mId, mNome, mEmail));

                if (t.getTipo() == TipoTransacao.RECEITA) {
                    mDTO.setTotalReceitas(mDTO.getTotalReceitas().add(valor));
                } else {
                    mDTO.setTotalDespesas(mDTO.getTotalDespesas().add(valor));
                }
                mDTO.setTotalMovimentado(mDTO.getTotalMovimentado().add(valor));
                mDTO.setQuantidadeTransacoes(mDTO.getQuantidadeTransacoes() + 1);
                membroMap.put(mId, mDTO);
            }
        }

        // Calcula percentuais das categorias
        for (RelatorioFinanceiroDTO.CategoriaRelatorioDTO cat : catMap.values()) {
            BigDecimal divisor = cat.getTipo() == TipoTransacao.RECEITA ? totalReceitas : totalDespesas;
            if (divisor.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal perc = cat.getTotal().multiply(BigDecimal.valueOf(100)).divide(divisor, 2, RoundingMode.HALF_UP);
                cat.setPercentual(perc);
            } else {
                cat.setPercentual(BigDecimal.ZERO);
            }
        }

        BigDecimal saldoLiquido = totalReceitas.subtract(totalDespesas).setScale(2, RoundingMode.HALF_UP);

        BigDecimal taxaPoupanca = BigDecimal.ZERO;
        if (totalReceitas.compareTo(BigDecimal.ZERO) > 0) {
            taxaPoupanca = saldoLiquido.multiply(BigDecimal.valueOf(100)).divide(totalReceitas, 2, RoundingMode.HALF_UP);
        }

        long diasPeriodo = Math.max(1, ChronoUnit.DAYS.between(startDate, endDate) + 1);
        BigDecimal mediaGastoDiario = totalDespesas.divide(BigDecimal.valueOf(diasPeriodo), 2, RoundingMode.HALF_UP);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String periodoDescricao = startDate.format(dtf) + " até " + endDate.format(dtf);

        List<RelatorioFinanceiroDTO.CategoriaRelatorioDTO> listaCategorias = new ArrayList<>(catMap.values());
        listaCategorias.sort(Comparator.comparing(RelatorioFinanceiroDTO.CategoriaRelatorioDTO::getTotal).reversed());

        List<RelatorioFinanceiroDTO.MesRelatorioDTO> listaMeses = new ArrayList<>(mesMap.values());
        listaMeses.sort(Comparator.comparing(RelatorioFinanceiroDTO.MesRelatorioDTO::getMes));

        List<RelatorioFinanceiroDTO.MembroRelatorioDTO> listaMembros = new ArrayList<>(membroMap.values());
        listaMembros.sort(Comparator.comparing(RelatorioFinanceiroDTO.MembroRelatorioDTO::getTotalMovimentado).reversed());

        RelatorioFinanceiroDTO dto = new RelatorioFinanceiroDTO();
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        dto.setPeriodoDescricao(periodoDescricao);
        dto.setTotalReceitas(totalReceitas.setScale(2, RoundingMode.HALF_UP));
        dto.setTotalDespesas(totalDespesas.setScale(2, RoundingMode.HALF_UP));
        dto.setSaldoLiquido(saldoLiquido);
        dto.setTaxaPoupanca(taxaPoupanca);
        dto.setMediaGastoDiario(mediaGastoDiario);
        dto.setTotalTransacoes(transacoes.size());
        dto.setPorCategoria(listaCategorias);
        dto.setPorMes(listaMeses);
        dto.setPorMembro(listaMembros);
        dto.setTransacoes(transacoes);

        return dto;
    }
}
