package com.tecnocampus.backendtfg.persistence;

import com.tecnocampus.backendtfg.domain.HydrationProfile;
import com.tecnocampus.backendtfg.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface HydrationProfileRepository extends JpaRepository<HydrationProfile, String> {
    HydrationProfile findByUser(User user);
    List<HydrationProfile> findByDailyObjectiveWaterGreaterThan(double amount);
    List<HydrationProfile> findByCurrentAmountGreaterThan(double amount);
    List<HydrationProfile> findByLastUpdateAfter(Date date);
}
