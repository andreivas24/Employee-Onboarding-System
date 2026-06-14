package com.company.employee_onboarding_system.service;

import com.company.employee_onboarding_system.entity.OnboardingRequest;
import com.company.employee_onboarding_system.repository.OnboardingRequestRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final OnboardingRequestRepository onboardingRequestRepository;
    private final MessageService messageService;

    public byte[] exportOnboardingRequestsToExcel() throws IOException {
        List<OnboardingRequest> requests = onboardingRequestRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet(
                messageService.get("export.sheet.onboarding-requests")
            );

            String[] headers = {
                messageService.get("export.header.id"),
                messageService.get("export.header.employee-name"),
                messageService.get("export.header.employee-role"),
                messageService.get("export.header.start-date"),
                messageService.get("export.header.hardware-tier"),
                messageService.get("export.header.status"),
                messageService.get("export.header.job-description"),
                messageService.get("export.header.rejection-reason"),
                messageService.get("export.header.company-email"),
                messageService.get("export.header.laptop-configuration"),
                messageService.get("export.header.approved-budget"),
                messageService.get("export.header.finance-notes"),
                messageService.get("export.header.created-at"),
                messageService.get("export.header.updated-at")
            };

            Row headerRow = sheet.createRow(0);

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;

            for (OnboardingRequest request : requests) {
                Row row = sheet.createRow(rowIndex++);

                row.createCell(0).setCellValue(request.getId());
                row.createCell(1).setCellValue(request.getEmployeeName());
                row.createCell(2).setCellValue(request.getEmployeeRole());
                row.createCell(3).setCellValue(String.valueOf(request.getStartDate()));
                row.createCell(4).setCellValue(String.valueOf(request.getHardwareTier()));
                row.createCell(5).setCellValue(String.valueOf(request.getStatus()));
                row.createCell(6).setCellValue(request.getJobDescription());
                row.createCell(7).setCellValue(request.getRejectionReason() != null ? request.getRejectionReason() : "");
                row.createCell(8).setCellValue(request.getCompanyEmail() != null ? request.getCompanyEmail() : "");
                row.createCell(9).setCellValue(request.getLaptopConfiguration() != null ? request.getLaptopConfiguration() : "");
                row.createCell(10).setCellValue(request.getApprovedBudget() != null ? request.getApprovedBudget() : 0);
                row.createCell(11).setCellValue(request.getFinanceNotes() != null ? request.getFinanceNotes() : "");
                row.createCell(12).setCellValue(String.valueOf(request.getCreatedAt()));
                row.createCell(13).setCellValue(String.valueOf(request.getUpdatedAt()));
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);

            return outputStream.toByteArray();
        }
    }
}