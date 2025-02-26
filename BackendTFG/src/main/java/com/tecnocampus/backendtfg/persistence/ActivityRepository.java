package com.tecnocampus.backendtfg.persistence;


import com.tecnocampus.backendtfg.domain.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    Activity findByDate(Date date);
}
