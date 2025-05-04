package com.tecnocampus.backendtfg.persistence;

import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.domain.UserImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserImageRepository extends JpaRepository<UserImage, Long> {
    Optional<UserImage> findByUser(User user);
}
