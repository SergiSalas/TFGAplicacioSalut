package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
import com.tecnocampus.backendtfg.domain.Activity;
import com.tecnocampus.backendtfg.domain.ActivityProfile;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.ActivityProfileRepository;
import com.tecnocampus.backendtfg.persistence.ActivityRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    private final UserRepository userRepository;

    private final ActivityProfileRepository activityProfileRepository;

    public ActivityService(ActivityRepository activityRepository, UserRepository userRepository,
                           ActivityProfileRepository activityProfileRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.activityProfileRepository = activityProfileRepository;
    }

    public void createActivity(ActivityDTO activityDTO,String email) {
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        Activity activity = new Activity(activityDTO,activityProfile);
        activityRepository.save(activity);
        activityProfileRepository.save(activityProfile);
    }

    public void deleteActivity(ActivityDTO activityDTO,String email) {
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        Date date = activityDTO.getDate();
        Activity activity = activityRepository.findByDate(date);
        activityRepository.delete(activity);
        activityProfileRepository.save(activityProfile);
    }
}
