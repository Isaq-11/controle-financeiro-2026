package com.ifpr.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Entity
@Data
@Table(name = "carteira_membro", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "carteira_id", "usuario_id" })
})
public class CarteiraMembro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "carteira_id", nullable = false)
    private Carteira carteira;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    private PapelCarteira papel;

    private LocalDateTime entradoEm;

    @PrePersist
    public void aoCriar() {
        this.entradoEm = LocalDateTime.now();
    }

    // caso o lombok, nao funcione, descomentar abaixo:
    // public Long getId() {
    // return id;
    // }

    // public void setId(Long id) {
    // this.id = id;
    // }

    // public Carteira getCarteira() {
    // return carteira;
    // }

    // public void setCarteira(Carteira carteira) {
    // this.carteira = carteira;
    // }

    // public Usuario getUsuario() {
    // return usuario;
    // }

    // public void setUsuario(Usuario usuario) {
    // this.usuario = usuario;
    // }

    // public PapelCarteira getPapel() {
    // return papel;
    // }

    // public void setPapel(PapelCarteira papel) {
    // this.papel = papel;
    // }

    // public LocalDateTime getEntradoEm() {
    // return entradoEm;
    // }

    // public void setEntradoEm(LocalDateTime entradoEm) {
    // this.entradoEm = entradoEm;
    // }
}
