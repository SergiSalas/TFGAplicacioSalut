package com.tecnocampus.backendtfg.persistence;

import com.tecnocampus.backendtfg.domain.Challenge;
import com.tecnocampus.backendtfg.domain.ChallengeType;
import com.tecnocampus.backendtfg.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, String> {
    List<Challenge> findByUserAndCompletedFalse(User user);
    List<Challenge> findByUserAndCreationDateAfter(User user, Date date);
    List<Challenge> findByUserAndTypeAndCompletedFalse(User user, ChallengeType type);
}