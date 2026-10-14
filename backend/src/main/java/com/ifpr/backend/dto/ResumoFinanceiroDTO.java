package com.ifpr.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ResumoFinanceiroDTO {

    private BigDecimal totalIncome = BigDecimal.ZERO;
    private BigDecimal totalExpense = BigDecimal.ZERO;
    private BigDecimal balance = BigDecimal.ZERO;
    private long transactionCount = 0;
    private List<CategoriaResumoDTO> byCategory;
    private List<MesResumoDTO> byMonth;

    public ResumoFinanceiroDTO(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal balance,
                               long transactionCount, List<CategoriaResumoDTO> byCategory, List<MesResumoDTO> byMonth) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.balance = balance;
        this.transactionCount = transactionCount;
        this.byCategory = byCategory;
        this.byMonth = byMonth;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }

    public List<CategoriaResumoDTO> getByCategory() {
        return byCategory;
    }

    public void setByCategory(List<CategoriaResumoDTO> byCategory) {
        this.byCategory = byCategory;
    }

    public List<MesResumoDTO> getByMonth() {
        return byMonth;
    }

    public void setByMonth(List<MesResumoDTO> byMonth) {
        this.byMonth = byMonth;
    }

    @Data
    @NoArgsConstructor
    public static class CategoriaResumoDTO {
        private Long categoryId;
        private String categoryName;
        private BigDecimal total;

        public CategoriaResumoDTO(Long categoryId, String categoryName, BigDecimal total) {
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.total = total;
        }

        public Long getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }

        public BigDecimal getTotal() {
            return total;
        }

        public void setTotal(BigDecimal total) {
            this.total = total;
        }
    }

    @Data
    @NoArgsConstructor
    public static class MesResumoDTO {
        private String month;
        private BigDecimal income;
        private BigDecimal expense;

        public MesResumoDTO(String month, BigDecimal income, BigDecimal expense) {
            this.month = month;
            this.income = income;
            this.expense = expense;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public BigDecimal getIncome() {
            return income;
        }

        public void setIncome(BigDecimal income) {
            this.income = income;
        }

        public BigDecimal getExpense() {
            return expense;
        }

        public void setExpense(BigDecimal expense) {
            this.expense = expense;
        }
    }
}
