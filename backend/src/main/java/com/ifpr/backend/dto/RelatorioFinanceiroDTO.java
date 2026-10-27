package com.ifpr.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.ifpr.backend.model.TipoTransacao;
import com.ifpr.backend.model.Transacao;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RelatorioFinanceiroDTO {

    private LocalDate startDate;
    private LocalDate endDate;
    private String periodoDescricao;

    private BigDecimal totalReceitas = BigDecimal.ZERO;
    private BigDecimal totalDespesas = BigDecimal.ZERO;
    private BigDecimal saldoLiquido = BigDecimal.ZERO;
    private BigDecimal taxaPoupanca = BigDecimal.ZERO; // % de receitas poupadas
    private BigDecimal mediaGastoDiario = BigDecimal.ZERO;
    private int totalTransacoes = 0;

    private List<CategoriaRelatorioDTO> porCategoria = new ArrayList<>();
    private List<MesRelatorioDTO> porMes = new ArrayList<>();
    private List<MembroRelatorioDTO> porMembro = new ArrayList<>();
    private List<Transacao> transacoes = new ArrayList<>();

    // Sub-DTO: Agrupamento por Categoria
    @Data
    @NoArgsConstructor
    public static class CategoriaRelatorioDTO {
        private Long categoriaId;
        private String nome;
        private TipoTransacao tipo;
        private String cor;
        private String icone;
        private BigDecimal total = BigDecimal.ZERO;
        private BigDecimal percentual = BigDecimal.ZERO;
        private int quantidade = 0;

        public CategoriaRelatorioDTO(Long categoriaId, String nome, TipoTransacao tipo, String cor, String icone) {
            this.categoriaId = categoriaId;
            this.nome = nome;
            this.tipo = tipo;
            this.cor = cor;
            this.icone = icone;
        }

        public Long getCategoriaId() { return categoriaId; }
        public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public TipoTransacao getTipo() { return tipo; }
        public void setTipo(TipoTransacao tipo) { this.tipo = tipo; }
        public String getCor() { return cor; }
        public void setCor(String cor) { this.cor = cor; }
        public String getIcone() { return icone; }
        public void setIcone(String icone) { this.icone = icone; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
        public BigDecimal getPercentual() { return percentual; }
        public void setPercentual(BigDecimal percentual) { this.percentual = percentual; }
        public int getQuantidade() { return quantidade; }
        public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    }

    // Sub-DTO: Evolução Mensal
    @Data
    @NoArgsConstructor
    public static class MesRelatorioDTO {
        private String mes;
        private BigDecimal receitas = BigDecimal.ZERO;
        private BigDecimal despesas = BigDecimal.ZERO;
        private BigDecimal saldo = BigDecimal.ZERO;

        public MesRelatorioDTO(String mes, BigDecimal receitas, BigDecimal despesas, BigDecimal saldo) {
            this.mes = mes;
            this.receitas = receitas;
            this.despesas = despesas;
            this.saldo = saldo;
        }

        public String getMes() { return mes; }
        public void setMes(String mes) { this.mes = mes; }
        public BigDecimal getReceitas() { return receitas; }
        public void setReceitas(BigDecimal receitas) { this.receitas = receitas; }
        public BigDecimal getDespesas() { return despesas; }
        public void setDespesas(BigDecimal despesas) { this.despesas = despesas; }
        public BigDecimal getSaldo() { return saldo; }
        public void setSaldo(BigDecimal saldo) { this.saldo = saldo; }
    }

    // Sub-DTO: Gastos e Contribuições por Membro da Carteira
    @Data
    @NoArgsConstructor
    public static class MembroRelatorioDTO {
        private Long usuarioId;
        private String nome;
        private String email;
        private BigDecimal totalReceitas = BigDecimal.ZERO;
        private BigDecimal totalDespesas = BigDecimal.ZERO;
        private BigDecimal totalMovimentado = BigDecimal.ZERO;
        private int quantidadeTransacoes = 0;

        public MembroRelatorioDTO(Long usuarioId, String nome, String email) {
            this.usuarioId = usuarioId;
            this.nome = nome;
            this.email = email;
        }

        public Long getUsuarioId() { return usuarioId; }
        public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public BigDecimal getTotalReceitas() { return totalReceitas; }
        public void setTotalReceitas(BigDecimal totalReceitas) { this.totalReceitas = totalReceitas; }
        public BigDecimal getTotalDespesas() { return totalDespesas; }
        public void setTotalDespesas(BigDecimal totalDespesas) { this.totalDespesas = totalDespesas; }
        public BigDecimal getTotalMovimentado() { return totalMovimentado; }
        public void setTotalMovimentado(BigDecimal totalMovimentado) { this.totalMovimentado = totalMovimentado; }
        public int getQuantidadeTransacoes() { return quantidadeTransacoes; }
        public void setQuantidadeTransacoes(int quantidadeTransacoes) { this.quantidadeTransacoes = quantidadeTransacoes; }
    }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getPeriodoDescricao() { return periodoDescricao; }
    public void setPeriodoDescricao(String periodoDescricao) { this.periodoDescricao = periodoDescricao; }
    public BigDecimal getTotalReceitas() { return totalReceitas; }
    public void setTotalReceitas(BigDecimal totalReceitas) { this.totalReceitas = totalReceitas; }
    public BigDecimal getTotalDespesas() { return totalDespesas; }
    public void setTotalDespesas(BigDecimal totalDespesas) { this.totalDespesas = totalDespesas; }
    public BigDecimal getSaldoLiquido() { return saldoLiquido; }
    public void setSaldoLiquido(BigDecimal saldoLiquido) { this.saldoLiquido = saldoLiquido; }
    public BigDecimal getTaxaPoupanca() { return taxaPoupanca; }
    public void setTaxaPoupanca(BigDecimal taxaPoupanca) { this.taxaPoupanca = taxaPoupanca; }
    public BigDecimal getMediaGastoDiario() { return mediaGastoDiario; }
    public void setMediaGastoDiario(BigDecimal mediaGastoDiario) { this.mediaGastoDiario = mediaGastoDiario; }
    public int getTotalTransacoes() { return totalTransacoes; }
    public void setTotalTransacoes(int totalTransacoes) { this.totalTransacoes = totalTransacoes; }
    public List<CategoriaRelatorioDTO> getPorCategoria() { return porCategoria; }
    public void setPorCategoria(List<CategoriaRelatorioDTO> porCategoria) { this.porCategoria = porCategoria; }
    public List<MesRelatorioDTO> getPorMes() { return porMes; }
    public void setPorMes(List<MesRelatorioDTO> porMes) { this.porMes = porMes; }
    public List<MembroRelatorioDTO> getPorMembro() { return porMembro; }
    public void setPorMembro(List<MembroRelatorioDTO> porMembro) { this.porMembro = porMembro; }
    public List<Transacao> getTransacoes() { return transacoes; }
    public void setTransacoes(List<Transacao> transacoes) { this.transacoes = transacoes; }
}
