package com.ifpr.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.TipoTransacao;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    // Lista todas as categorias de um usuário específico
    List<Categoria> findByUsuarioId(Long usuarioId);

    // Lista categorias de um usuário filtradas por tipo (RECEITA ou DESPESA)
    List<Categoria> findByUsuarioIdAndTipo(Long usuarioId, TipoTransacao tipo);
}
