package com.tecnocampus.backendtfg.persistence;

import com.tecnocampus.backendtfg.domain.SleepProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SleepProfileRepository extends JpaRepository<SleepProfile, Long> {

}
