package com.doctime.controller;

import com.doctime.dto.AgoraTokenResponse;
import com.doctime.dto.ApiResponse;
import com.doctime.model.User;
import com.doctime.service.AgoraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/video")
@RequiredArgsConstructor
public class VideoController {
    
    private final AgoraService agoraService;
    
    @GetMapping("/token")
    public ResponseEntity<ApiResponse<AgoraTokenResponse>> generateToken(
            @RequestParam String channelName,
            @AuthenticationPrincipal User user) {
        AgoraTokenResponse token = agoraService.generateToken(channelName, user.getId());
        return ResponseEntity.ok(ApiResponse.success(token));
    }
}
