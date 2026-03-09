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
            return translation.getTranslatedText();
        } catch (Exception e) {
            log.error("Translation failed", e);
            return text; // Return original text if translation fails
        }
    }
    
    public String detectLanguage(String text) {
        try {
            return translate.detect(text).getLanguage();
        } catch (Exception e) {
            log.error("Language detection failed", e);
            return "en";
        }
    }
}
