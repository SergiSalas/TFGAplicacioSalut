package com.tecnocampus.backendtfg.persistence;

import com.tecnocampus.backendtfg.domain.DailySteps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DailyStepsRepository extends JpaRepository<DailySteps, Long> {
}
