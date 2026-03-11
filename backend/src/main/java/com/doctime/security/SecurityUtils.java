package com.doctime.security;

import com.doctime.model.User;
import com.doctime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    /**
     * Get the currently authenticated user's email.
     */
    public String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            return null;
        return auth.getName();
    }

    /**
     * Get the currently authenticated User entity.
     */
    public User getCurrentUser() {
        String email = getCurrentUserEmail();
        if (email == null)
            return null;
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Get the currently authenticated user's ID.
     */
    public Long getCurrentUserId() {
        User current = getCurrentUser();
        return current != null ? current.getId() : null;
    }

    /**
     * Check if the currently authenticated user owns the given user-scoped
     * resource.
     * The resourceOwnerId should be a User.id.
     */
    public boolean isCurrentUser(Long userId) {
        User current = getCurrentUser();
        return current != null && current.getId().equals(userId);
    }

    /**
     * Check if current user is the patient with given patient ID (not user ID).
     */
    public boolean isCurrentPatient(Long patientId) {
        User current = getCurrentUser();
        return current != null && current.getPatient() != null
                && current.getPatient().getId().equals(patientId);
    }

    /**
     * Check if current user is the doctor with given doctor ID (not user ID).
     */
    public boolean isCurrentDoctor(Long doctorId) {
        User current = getCurrentUser();
        return current != null && current.getDoctor() != null
                && current.getDoctor().getId().equals(doctorId);
    }
}
