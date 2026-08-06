package com.ifpr.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

        return transacaoRepository.save(transacao);
    }

    public Transacao atualizar(Long carteiraId, Long id, Transacao transacaoAtualizada, Long categoriaId, Usuario usuario) {
        carteiraService.validarPermissaoEscrita(carteiraId, usuario.getId());

        Transacao dbTransacao = buscarPorId(carteiraId, id, usuario);

        dbTransacao.setTipo(transacaoAtualizada.getTipo());
        dbTransacao.setValor(transacaoAtualizada.getValor());
        dbTransacao.setDescricao(transacaoAtualizada.getDescricao());
        dbTransacao.setData(transacaoAtualizada.getData());

        if (categoriaId != null) {
            Categoria categoria = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
            dbTransacao.setCategoria(categoria);
        } else {
            dbTransacao.setCategoria(null);
        }

        return transacaoRepository.save(dbTransacao);
    }

    public void excluir(Long carteiraId, Long id, Usuario usuario) {
        carteiraService.validarPermissaoEscrita(carteiraId, usuario.getId());
        Transacao dbTransacao = buscarPorId(carteiraId, id, usuario);
        transacaoRepository.delete(dbTransacao);
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
}
