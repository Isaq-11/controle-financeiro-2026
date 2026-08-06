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

    @NotBlank(message = "O nome da categoria é obrigatório")
    private String nome;

    @NotNull(message = "O tipo da categoria (RECEITA ou DESPESA) é obrigatório")
    @Enumerated(EnumType.STRING)
    private TipoTransacao tipo;

    private String cor; // Código Hexadecimal (ex: #FF5733)

    private String icone; // Nome do ícone
}
