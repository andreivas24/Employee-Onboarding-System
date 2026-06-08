package com.company.employee_onboarding_system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FinanceApprovalDto {

    @NotNull
    private Double approvedBudget;

    private String financeNotes;
}