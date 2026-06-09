package com.company.employee_onboarding_system.controller;

import com.company.employee_onboarding_system.dto.UpdateProfileDto;
import com.company.employee_onboarding_system.dto.UserProfileDto;
import com.company.employee_onboarding_system.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public UserProfileDto getProfile(
        HttpServletRequest request
    ) {
        String email = getEmailFromToken(request);

        return profileService.getProfile(email);
    }

    @PutMapping
    public UserProfileDto updateProfile(
        HttpServletRequest request,
        @Valid @RequestBody UpdateProfileDto dto
    ) {
        String email = getEmailFromToken(request);

        return profileService.updateProfile(email, dto);
    }

    @PostMapping("/avatar")
    public UserProfileDto updateAvatar(
        HttpServletRequest request,
        @RequestParam("file") MultipartFile file
    ) throws IOException {

        String email = getEmailFromToken(request);

        String uploadDir = "uploads/";
        Files.createDirectories(Paths.get(uploadDir));

        String fileName =
                System.currentTimeMillis()
                    + "_"
                    + file.getOriginalFilename();

        Path filePath = Paths.get(uploadDir + fileName);

        Files.write(filePath, file.getBytes());

        return profileService.updateAvatarFile(email, fileName);
    }

    private String getEmailFromToken(HttpServletRequest request) {
        return (String) request.getAttribute("userEmail");
    }
}