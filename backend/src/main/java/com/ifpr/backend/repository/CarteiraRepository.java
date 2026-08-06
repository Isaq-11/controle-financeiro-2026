package com.ifpr.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ifpr.backend.model.Carteira;

public interface CarteiraRepository extends JpaRepository<Carteira, Long> {

    // Buscar todas as carteiras onde o usuário é dono ou membro
    @Query("SELECT c FROM Carteira c WHERE c.dono.id = :usuarioId OR c.id IN (SELECT cm.carteira.id FROM CarteiraMembro cm WHERE cm.usuario.id = :usuarioId)")
    List<Carteira> findAllByUsuarioId(@Param("usuarioId") Long usuarioId);
}
