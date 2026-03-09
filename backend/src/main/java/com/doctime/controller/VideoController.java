package com.doctime.controller;

import com.doctime.dto.VideoNoteRequest;
import com.doctime.dto.VideoTokenRequest;
import com.doctime.dto.VideoTokenResponse;
import com.doctime.model.VideoNote;
import com.doctime.service.VideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/video")
@RequiredArgsConstructor
@Tag(name = "Video", description = "Video call token and notes APIs")
public class VideoController {

    @Value("${agora.app.id:YOUR_AGORA_APP_ID}")
    private String agoraAppId;

    private final VideoService videoService;

    @PostMapping("/token")
    @Operation(summary = "Get Agora video token for appointment")
    public ResponseEntity<VideoTokenResponse> getToken(@RequestBody VideoTokenRequest request) {
        // Real Agora token generation requires Agora SDK — stub token for now
        return ResponseEntity.ok(VideoTokenResponse.builder()
                .appId(agoraAppId)
                .channelName(request.getChannelName())
                .uid(request.getUid() != null ? request.getUid() : 0)
                .token("STUB_TOKEN_" + request.getChannelName())
                .build());
    }

    @GetMapping("/notes/{appointmentId}")
    @Operation(summary = "Get video note for appointment")
    public ResponseEntity<VideoNote> getNote(@PathVariable Long appointmentId) {
        return videoService.getNote(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/notes/{appointmentId}")
    @Operation(summary = "Save video note for appointment")
    public ResponseEntity<VideoNote> saveNote(
            @PathVariable Long appointmentId,
            @RequestBody VideoNoteRequest request) {
        return ResponseEntity.ok(videoService.saveNote(appointmentId, request.getContent()));
    }
}
