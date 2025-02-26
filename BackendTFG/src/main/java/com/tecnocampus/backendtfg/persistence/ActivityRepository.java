package com.tecnocampus.backendtfg.persistence;


import com.tecnocampus.backendtfg.domain.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {


}
