package com.tecnocampus.backendtfg.persistence;


import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
import com.tecnocampus.backendtfg.domain.AbstractActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<AbstractActivity, Long> {

    AbstractActivity findByDate(Date date);

    @Query("SELECT new com.tecnocampus.backendtfg.application.dto.ActivityDTO(a) " +
            "FROM AbstractActivity a " +
            "WHERE a.origin = com.tecnocampus.backendtfg.domain.ActivityOrigin.APP")
    List<ActivityDTO> findAppActivities();
}
