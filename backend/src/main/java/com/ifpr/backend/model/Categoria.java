package com.ifpr.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "carteira_id", nullable = true)
    private Carteira carteira;

    @NotBlank(message = "O nome da categoria é obrigatório")
    private String nome;

    @NotNull(message = "O tipo da categoria (RECEITA ou DESPESA) é obrigatório")
    @Enumerated(EnumType.STRING)
    private TipoTransacao tipo;

    private String cor; // Código Hexadecimal (ex: #FF5733)

    private String icone; // Nome do ícone

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

    // public Carteira getCarteira() {
    // return carteira;
    // }

    // public void setCarteira(Carteira carteira) {
    // this.carteira = carteira;
    // }

    // public String getNome() {
    // return nome;
    // }

    // public void setNome(String nome) {
    // this.nome = nome;
    // }

    // public TipoTransacao getTipo() {
    // return tipo;
    // }

    // public void setTipo(TipoTransacao tipo) {
    // this.tipo = tipo;
    // }

    // public String getCor() {
    // return cor;
    // }

    // public void setCor(String cor) {
    // this.cor = cor;
    // }

    // public String getIcone() {
    // return icone;
    // }

    // public void setIcone(String icone) {
    // this.icone = icone;
    // }
}
