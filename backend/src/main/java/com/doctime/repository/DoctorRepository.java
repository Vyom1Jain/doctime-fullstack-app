package com.doctime.repository;

import com.doctime.model.Doctor;
import com.doctime.model.enums.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findBySpecialty(Specialty specialty);
    List<Doctor> findByAvailableForConsultation(Boolean available);
    
    @Query("SELECT d FROM Doctor d WHERE d.specialty = :specialty AND d.availableForConsultation = true")
    List<Doctor> findAvailableDoctorsBySpecialty(@Param("specialty") Specialty specialty);
    
    @Query("SELECT d FROM Doctor d WHERE d.consultationFee <= :maxFee")
    List<Doctor> findByMaxFee(@Param("maxFee") Double maxFee);
}
