package com.doctime.service;

import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TranslationService {
    
    private final Translate translate;
    
    public TranslationService() {
        this.translate = TranslateOptions.getDefaultInstance().getService();
    }
    
    public String translateText(String text, String targetLanguage) {
        try {
            Translation translation = translate.translate(
                    text,
                    Translate.TranslateOption.targetLanguage(targetLanguage)
            );
            
            log.info("Translated text to {}", targetLanguage);
            return translation.getTranslatedText();
        } catch (Exception e) {
            log.error("Error translating text", e);
            throw new RuntimeException("Translation failed", e);
        }
    }
}
