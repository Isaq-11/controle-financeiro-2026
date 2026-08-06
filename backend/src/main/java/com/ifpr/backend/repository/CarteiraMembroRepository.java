package com.ifpr.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ifpr.backend.model.CarteiraMembro;

public interface CarteiraMembroRepository extends JpaRepository<CarteiraMembro, Long> {

    List<CarteiraMembro> findByCarteiraId(Long carteiraId);

    Optional<CarteiraMembro> findByCarteiraIdAndUsuarioId(Long carteiraId, Long usuarioId);

    boolean existsByCarteiraIdAndUsuarioId(Long carteiraId, Long usuarioId);
}
