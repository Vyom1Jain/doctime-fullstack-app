package com.doctime.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
}
