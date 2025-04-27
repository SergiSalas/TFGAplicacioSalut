package com.tecnocampus.backendtfg.persistence;

import com.tecnocampus.backendtfg.domain.Hydration;
import com.tecnocampus.backendtfg.domain.HydrationProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface HydrationRepository extends JpaRepository<Hydration, String> {
    List<Hydration> findByHydrationProfile(HydrationProfile profile);
    List<Hydration> findByHydrationProfileAndDate(HydrationProfile profile, Date date);
}