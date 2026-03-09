package com.doctime.service;

// Stub implementation - Agora SDK not yet integrated
// import io.agora.media.RtcTokenBuilder;
// import io.agora.media.RtcTokenBuilder.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AgoraService {

    @Value("${agora.app-id}")
    private String appId;

    @Value("${agora.app-certificate}")
    private String appCertificate;

    public String generateRtcToken(String channelName, int uid) {
        // TODO: Implement real Agora SDK integration
        log.warn("Using stub Agora token - real SDK not integrated yet");
        return "STUB_TOKEN_" + channelName + "_" + uid;
    }
}
