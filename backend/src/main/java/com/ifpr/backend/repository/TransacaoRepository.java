package com.ifpr.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ifpr.backend.model.TipoTransacao;
import com.ifpr.backend.model.Transacao;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    // Método para buscar transações de uma carteira com filtros opcionais
    @Query("SELECT t FROM Transacao t WHERE t.carteira.id = :carteiraId " +
           "AND (:tipo IS NULL OR t.tipo = :tipo) " +
           "AND (:categoriaId IS NULL OR t.categoria.id = :categoriaId) " +
           "AND (:startDate IS NULL OR t.data >= :startDate) " +
           "AND (:endDate IS NULL OR t.data <= :endDate)")
    Page<Transacao> findComFiltros(
            @Param("carteiraId") Long carteiraId,
            @Param("tipo") TipoTransacao tipo,
            @Param("categoriaId") Long categoriaId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    // Buscar todas as transações de uma carteira no período para o resumo financeiro
    @Query("SELECT t FROM Transacao t WHERE t.carteira.id = :carteiraId " +
           "AND (:startDate IS NULL OR t.data >= :startDate) " +
           "AND (:endDate IS NULL OR t.data <= :endDate)")
    List<Transacao> findByCarteiraIdEPeriodo(
            @Param("carteiraId") Long carteiraId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Verificar se existe alguma transação vinculada a uma determinada categoria
    boolean existsByCategoriaId(Long categoriaId);
}
