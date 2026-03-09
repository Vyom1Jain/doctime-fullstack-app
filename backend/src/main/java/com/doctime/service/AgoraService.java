package com.doctime.service;

import io.agora.media.RtcTokenBuilder;
import io.agora.media.RtcTokenBuilder.Role;
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
        try {
            int timestamp = (int)(System.currentTimeMillis() / 1000);
            int privilegeExpiredTs = timestamp + 3600; // 1 hour
            
            RtcTokenBuilder token = new RtcTokenBuilder();
            String result = token.buildTokenWithUid(
                    appId,
                    appCertificate,
                    channelName,
                    uid,
                    Role.Role_Publisher,
                    privilegeExpiredTs
            );
            
            log.info("Generated Agora token for channel: {}", channelName);
            return result;
        } catch (Exception e) {
            log.error("Error generating Agora token", e);
            throw new RuntimeException("Failed to generate video token", e);
        }
    }
}
