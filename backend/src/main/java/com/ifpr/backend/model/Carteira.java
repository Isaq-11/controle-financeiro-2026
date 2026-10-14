package com.ifpr.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
public class Carteira {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "dono_id", nullable = false)
    private Usuario dono;

    @NotBlank(message = "O nome da carteira é obrigatório")
    private String nome;

    private String descricao;

    private LocalDateTime criadoEm;

    @PrePersist
    public void aoCriar() {
        this.criadoEm = LocalDateTime.now();
    }

    // caso o lombok, nao funcione, descomentar abaixo:
    // public Long getId() {
    // return id;
    // }

    // public void setId(Long id) {
    // this.id = id;
    // }

    // public Usuario getDono() {
    // return dono;
    // }

    // public void setDono(Usuario dono) {
    // this.dono = dono;
    // }

    // public String getNome() {
    // return nome;
    // }

    // public void setNome(String nome) {
    // this.nome = nome;
    // }

    // public String getDescricao() {
    // return descricao;
    // }

    // public void setDescricao(String descricao) {
    // this.descricao = descricao;
    // }

    // public LocalDateTime getCriadoEm() {
    // return criadoEm;
    // }

    // public void setCriadoEm(LocalDateTime criadoEm) {
    // this.criadoEm = criadoEm;
    // }
}
