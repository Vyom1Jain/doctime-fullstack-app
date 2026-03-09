package com.doctime.controller;

import com.doctime.dto.AgoraTokenRequest;
import com.doctime.service.AgoraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/video")
@RequiredArgsConstructor
@Tag(name = "Video", description = "Video consultation APIs")
public class VideoController {
    
    private final AgoraService agoraService;
    
    @Value("${agora.app-id}")
    private String appId;
    
    @PostMapping("/token")
    @Operation(summary = "Generate Agora RTC token for video call")
    public ResponseEntity<Map<String, Object>> generateToken(@Valid @RequestBody AgoraTokenRequest request) {
        String token = agoraService.generateRtcToken(request.getChannelName(), request.getUid());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("appId", appId);
        response.put("channelName", request.getChannelName());
        response.put("uid", request.getUid());
        
        return ResponseEntity.ok(response);
    }
}
