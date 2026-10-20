package com.ifpr.backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;
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
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "carteira_id", nullable = false)
    private Carteira carteira;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = true)
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "criado_por_id", nullable = false)
    private Usuario criadoPor;

    @ManyToOne
    @JoinColumn(name = "atualizado_por_id", nullable = true)
    private Usuario atualizadoPor;

    @NotNull(message = "O tipo da transação é obrigatório")
    @Enumerated(EnumType.STRING)
    private TipoTransacao tipo;

    @NotNull(message = "O valor é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
    private BigDecimal valor;

    private String descricao;

    @NotNull(message = "A data da transação é obrigatória")
    private LocalDate data;

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

    // public Carteira getCarteira() {
    // return carteira;
    // }

    // public void setCarteira(Carteira carteira) {
    // this.carteira = carteira;
    // }

    // public Categoria getCategoria() {
    // return categoria;
    // }

    // public void setCategoria(Categoria categoria) {
    // this.categoria = categoria;
    // }

    // public Usuario getCriadoPor() {
    // return criadoPor;
    // }

    // public void setCriadoPor(Usuario criadoPor) {
    // this.criadoPor = criadoPor;
    // }

    // public TipoTransacao getTipo() {
    // return tipo;
    // }

    // public void setTipo(TipoTransacao tipo) {
    // this.tipo = tipo;
    // }

    // public BigDecimal getValor() {
    // return valor;
    // }

    // public void setValor(BigDecimal valor) {
    // this.valor = valor;
    // }

    // public String getDescricao() {
    // return descricao;
    // }

    // public void setDescricao(String descricao) {
    // this.descricao = descricao;
    // }

    // public LocalDate getData() {
    // return data;
    // }

    // public void setData(LocalDate data) {
    // this.data = data;
    // }

    // public LocalDateTime getCriadoEm() {
    // return criadoEm;
    // }

    // public void setCriadoEm(LocalDateTime criadoEm) {
    // this.criadoEm = criadoEm;
    // }
}
