package com.doctime.dto;

import lombok.Data;

@Data
public class MedicineRequest {
    private String name;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
}
