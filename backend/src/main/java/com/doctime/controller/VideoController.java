package com.doctime.controller;

import com.doctime.dto.VideoNoteRequest;
import com.doctime.dto.VideoTokenRequest;
import com.doctime.dto.VideoTokenResponse;
import com.doctime.model.VideoNote;
import com.doctime.service.VideoService;
import io.agora.media.RtcTokenBuilder2;
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

    @Value("${agora.app-id:YOUR_AGORA_APP_ID}")
    private String agoraAppId;

    @Value("${agora.app-certificate:YOUR_AGORA_APP_CERTIFICATE}")
    private String agoraCertificate;

    private final VideoService videoService;

    private static final int TOKEN_EXPIRY_SECONDS = 3600; // 1 hour
    private static final int PRIVILEGE_EXPIRY_SECONDS = 3600;

    @PostMapping("/token")
    @Operation(summary = "Get Agora video token for appointment")
    public ResponseEntity<VideoTokenResponse> getToken(@RequestBody VideoTokenRequest request) {
        int uid = request.getUid() != null ? request.getUid() : 0;
        String channelName = request.getChannelName();

        if (channelName == null || channelName.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            RtcTokenBuilder2 tokenBuilder = new RtcTokenBuilder2();
            String token = tokenBuilder.buildTokenWithUid(
                    agoraAppId, agoraCertificate, channelName, uid,
                    RtcTokenBuilder2.Role.ROLE_PUBLISHER,
                    TOKEN_EXPIRY_SECONDS, PRIVILEGE_EXPIRY_SECONDS);

            return ResponseEntity.ok(VideoTokenResponse.builder()
                    .appId(agoraAppId)
                    .channelName(channelName)
                    .uid(uid)
                    .token(token)
                    .build());
        } catch (Throwable e) {
            // Return a token-less response so UI can still attempt with appId only
            return ResponseEntity.ok(VideoTokenResponse.builder()
                    .appId(agoraAppId)
                    .channelName(channelName)
                    .uid(uid)
                    .token(null)
                    .build());
        }
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
