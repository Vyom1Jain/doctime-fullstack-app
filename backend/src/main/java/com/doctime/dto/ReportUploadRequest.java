package com.doctime.dto;

import com.doctime.model.enums.ReportType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReportUploadRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private ReportType type;
    private String description;
    private LocalDateTime reportDate;
}
