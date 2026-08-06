package com.ifpr.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.UsuarioRepository;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private AuthService authService;

    public Usuario insert(Usuario usuario){
        return authService.cadastrar(usuario);
    }

    public List<Usuario> listAll(){
        return repository.findAll();
    }

    public Usuario findById(Long id){
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
    }

    public void delete(Long id){
        Usuario dbUser = findById(id);
        repository.delete(dbUser);
    }

    public Usuario update(Usuario usuario){
        Usuario dbUser = findById(usuario.getId());
        dbUser.setName(usuario.getName());
        dbUser.setEmail(usuario.getEmail());
        return repository.save(dbUser);
    }
}
