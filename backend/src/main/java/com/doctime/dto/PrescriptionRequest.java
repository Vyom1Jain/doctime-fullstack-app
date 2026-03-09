package com.doctime.dto;

import lombok.Data;

import java.util.List;

@Data
public class PrescriptionRequest {
    private String diagnosis;
    private String generalAdvice;
    private String nextVisit;
    private List<MedicineRequest> medicines;
}
