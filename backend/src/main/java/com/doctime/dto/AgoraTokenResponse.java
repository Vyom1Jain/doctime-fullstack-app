package com.doctime.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AgoraTokenResponse {
    private String token;
    private String channelName;
    private String appId;
    private Integer uid;
    private Long expirationTime;
}
