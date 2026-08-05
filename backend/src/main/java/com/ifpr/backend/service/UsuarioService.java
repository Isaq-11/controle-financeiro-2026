package com.ifpr.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.UsuarioRepository;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private EmailService emailService;

    public Usuario insert(Usuario usuario){
        Usuario usuarioBanco = repository.save(usuario);
        //emailService.enviarEmail(usuario.getEmail(), "Sucesso", "Cadastro realizado!!");

        Context context = new Context();
        context.setVariable("nome", usuario.getName());

        emailService.enviarEmailTemplate(usuario.getEmail(), "Sucesso!!", "novoCadastro", context);
        return usuarioBanco;
    }

    public List<Usuario> listAll(){
        return repository.findAll();
    }

    public Usuario findById(Long id){
        Usuario usuario = repository.findById(id).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return usuario;
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
