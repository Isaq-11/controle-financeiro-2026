package com.ifpr.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumoFinanceiroDTO {

    private BigDecimal totalIncome = BigDecimal.ZERO;
    private BigDecimal totalExpense = BigDecimal.ZERO;
    private BigDecimal balance = BigDecimal.ZERO;
    private long transactionCount = 0;
    private List<CategoriaResumoDTO> byCategory;
    private List<MesResumoDTO> byMonth;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoriaResumoDTO {
        private Long categoryId;
        private String categoryName;
        private BigDecimal total;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MesResumoDTO {
        private String month;
        private BigDecimal income;
        private BigDecimal expense;
    }
}
