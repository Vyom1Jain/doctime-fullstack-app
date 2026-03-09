package com.doctime.service;

import com.doctime.dto.AgoraTokenResponse;
import io.agora.media.RtcTokenBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@Slf4j
public class AgoraService {
    
    @Value("${agora.app-id}")
    private String appId;
    
    @Value("${agora.app-certificate}")
    private String appCertificate;
    
    private static final int TOKEN_EXPIRATION_SECONDS = 3600; // 1 hour
    
    public AgoraTokenResponse generateToken(String channelName, Long userId) {
        try {
            int uid = userId != null ? userId.intValue() : new Random().nextInt(100000);
            int timestamp = (int) (System.currentTimeMillis() / 1000);
            int privilegeExpireTs = timestamp + TOKEN_EXPIRATION_SECONDS;
            
            String token = RtcTokenBuilder.buildTokenWithUid(
                    appId,
                    appCertificate,
                    channelName,
                    uid,
                    RtcTokenBuilder.Role.Role_Publisher,
                    privilegeExpireTs
            );
            
            return new AgoraTokenResponse(
                    token,
                    channelName,
                    appId,
                    uid,
                    (long) privilegeExpireTs
            );
        } catch (Exception e) {
            log.error("Error generating Agora token", e);
            throw new RuntimeException("Failed to generate video call token");
        }
    }
}
