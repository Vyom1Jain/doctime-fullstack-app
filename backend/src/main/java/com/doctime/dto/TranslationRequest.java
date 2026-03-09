package com.doctime.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TranslationRequest {
    @NotNull(message = "Report ID is required")
    private Long reportId;
    
    @NotBlank(message = "Target language is required")
    private String targetLanguage;
}
