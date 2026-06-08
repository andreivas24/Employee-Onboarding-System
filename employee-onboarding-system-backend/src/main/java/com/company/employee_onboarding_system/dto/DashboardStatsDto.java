package com.company.employee_onboarding_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStatsDto {

    private long totalRequests;

    private long managerReviewCount;
    private long financeApprovalCount;
    private long itProvisioningCount;
    private long needsReworkCount;
    private long completedCount;

    private long standardHardwareCount;
    private long premiumHardwareCount;
}