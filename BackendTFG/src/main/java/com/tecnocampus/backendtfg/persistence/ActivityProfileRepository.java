package com.tecnocampus.backendtfg.persistence;


import com.tecnocampus.backendtfg.domain.ActivityProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityProfileRepository extends JpaRepository<ActivityProfile, Long> {

}
