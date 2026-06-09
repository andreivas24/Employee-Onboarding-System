package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/onboarding/export")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportExcel() throws IOException {
        byte[] fileContent = exportService.exportOnboardingRequestsToExcel();

        return ResponseEntity.ok()
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=onboarding_requests.xlsx"
            )
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(fileContent);
    }
}