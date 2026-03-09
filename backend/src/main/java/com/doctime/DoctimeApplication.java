package com.doctime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DoctimeApplication {
    public static void main(String[] args) {
        SpringApplication.run(DoctimeApplication.class, args);
    }
}
