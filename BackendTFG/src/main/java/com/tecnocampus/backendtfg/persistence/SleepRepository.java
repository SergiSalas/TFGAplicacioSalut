package com.tecnocampus.backendtfg.persistence;

import com.tecnocampus.backendtfg.domain.Sleep;
import com.tecnocampus.backendtfg.domain.SleepProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface SleepRepository extends JpaRepository<Sleep, Long> {

    Sleep findByDate (Date date);

    List<Sleep> findBySleepProfile(SleepProfile sleepProfile);

}
