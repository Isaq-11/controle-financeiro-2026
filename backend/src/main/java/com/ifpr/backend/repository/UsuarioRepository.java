package com.ifpr.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ifpr.backend.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Método Spring Data para buscar usuário por e-mail (usado no login e recuperação de senha)
    Optional<Usuario> findByEmail(String email);

    // Método Spring Data para verificar se já existe um cadastro com esse e-mail
    boolean existsByEmail(String email);
}
