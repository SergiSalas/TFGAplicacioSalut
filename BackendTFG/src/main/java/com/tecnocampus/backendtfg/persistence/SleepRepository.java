package com.tecnocampus.backendtfg.persistence;

import com.tecnocampus.backendtfg.domain.Sleep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface SleepRepository extends JpaRepository<Sleep, Long> {

    Sleep findByDate (Date date);

}
