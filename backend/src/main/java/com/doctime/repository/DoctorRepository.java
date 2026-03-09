package com.doctime.repository;

import com.doctime.model.Doctor;
import com.doctime.model.enums.Specialty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findBySpecialty(Specialty specialty);
    List<Doctor> findByAvailableForConsultationTrue();
    
    @Query("SELECT d FROM Doctor d WHERE d.availableForConsultation = true " +
           "AND (:specialty IS NULL OR d.specialty = :specialty) " +
           "AND (:minFee IS NULL OR d.consultationFee >= :minFee) " +
           "AND (:maxFee IS NULL OR d.consultationFee <= :maxFee)")
    Page<Doctor> searchDoctors(
        @Param("specialty") Specialty specialty,
        @Param("minFee") Double minFee,
        @Param("maxFee") Double maxFee,
        Pageable pageable
    );
}
