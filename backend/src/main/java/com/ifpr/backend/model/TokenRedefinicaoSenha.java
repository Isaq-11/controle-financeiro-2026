package com.ifpr.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.Data;

@Entity
@Data
public class TokenRedefinicaoSenha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiraEm;

    private boolean utilizado = false;

    // caso o lombok, nao funcione, descomentar abaixo:
    // public Long getId() {
    // return id;
    // }

    // public void setId(Long id) {
    // this.id = id;
    // }

    // public Usuario getUsuario() {
    // return usuario;
    // }

    // public void setUsuario(Usuario usuario) {
    // this.usuario = usuario;
    // }

    // public String getToken() {
    // return token;
    // }

    // public void setToken(String token) {
    // this.token = token;
    // }

    // public LocalDateTime getExpiraEm() {
    // return expiraEm;
    // }

    // public void setExpiraEm(LocalDateTime expiraEm) {
    // this.expiraEm = expiraEm;
    // }

    // public boolean isUtilizado() {
    // return utilizado;
    // }

    // public void setUtilizado(boolean utilizado) {
    // this.utilizado = utilizado;
    // }
}
