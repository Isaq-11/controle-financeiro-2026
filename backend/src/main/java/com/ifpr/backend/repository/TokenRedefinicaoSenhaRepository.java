package com.ifpr.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ifpr.backend.model.TokenRedefinicaoSenha;

public interface TokenRedefinicaoSenhaRepository extends JpaRepository<TokenRedefinicaoSenha, Long> {

    // Buscar token ativo pelo código alfanumérico/UUID
    Optional<TokenRedefinicaoSenha> findByToken(String token);
}
