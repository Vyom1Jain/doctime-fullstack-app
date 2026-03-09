package com.doctime.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private String role; // PATIENT or DOCTOR
}
