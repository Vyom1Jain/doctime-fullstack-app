package com.doctime.repository;

import com.doctime.model.Donation;
import com.doctime.model.enums.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    @Query("SELECT d FROM Donation d LEFT JOIN FETCH d.verifiedBy vb LEFT JOIN FETCH vb.user " +
            "LEFT JOIN FETCH d.requestedDoctor rqd LEFT JOIN FETCH rqd.user " +
            "WHERE d.status = com.doctime.model.enums.DonationStatus.ACTIVE ORDER BY d.createdAt DESC")
    List<Donation> findActiveWithDoctors();

    @Query("SELECT d FROM Donation d LEFT JOIN FETCH d.requestedDoctor rd LEFT JOIN FETCH rd.user " +
            "WHERE d.status = com.doctime.model.enums.DonationStatus.PENDING_VERIFICATION " +
            "AND (rd.id = :doctorId OR (rd IS NULL AND d.patient.id IN " +
            "(SELECT DISTINCT a.patient.id FROM Appointment a WHERE a.doctor.id = :doctorId " +
            "AND a.status = com.doctime.model.enums.AppointmentStatus.COMPLETED))) ORDER BY d.createdAt DESC")
    List<Donation> findPendingForDoctor(@Param("doctorId") Long doctorId);
}
