package com.doctime.repository;

import com.doctime.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByAppointmentIdOrderBySentAtAsc(Long appointmentId);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.appointment.id = :appointmentId " +
           "AND m.sender.id != :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("appointmentId") Long appointmentId, @Param("userId") Long userId);
    
    Page<Message> findByAppointmentId(Long appointmentId, Pageable pageable);
}
