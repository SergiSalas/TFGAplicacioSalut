package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
import com.tecnocampus.backendtfg.application.dto.ActivityTypeDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.Activity;
import com.tecnocampus.backendtfg.domain.ActivityProfile;
import com.tecnocampus.backendtfg.domain.TypeActivity;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.ActivityProfileRepository;
import com.tecnocampus.backendtfg.persistence.ActivityRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    private final UserRepository userRepository;

    private final ActivityProfileRepository activityProfileRepository;

    private final JwtUtils jwtUtils;

    public ActivityService(ActivityRepository activityRepository, UserRepository userRepository,
                           ActivityProfileRepository activityProfileRepository, JwtUtils jwtUtils) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.activityProfileRepository = activityProfileRepository;
        this.jwtUtils = jwtUtils;
    }

    public void createActivity(ActivityDTO activityDTO,String token) {
        System.out.println("Token: "+token);
        String email = getEmailFromToken(token);
        if (!userRepository.existsByEmail(email)){
            throw new IllegalArgumentException("User not found");
        }
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

    public void updateActivity(ActivityDTO activityDTO,String email) {
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        Date date = activityDTO.getDate();
        Activity activity = activityRepository.findByDate(date);
        activity.update(activityDTO);
        activityRepository.save(activity);
        activityProfileRepository.save(activityProfile);
    }

    public List<ActivityDTO> getActivities(String token) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        return activityProfile.getActivities().stream()
                .map(ActivityDTO::new)
                .toList();
    }

    public void addObjective(double dailyObjectiveDistance,String email) {
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        activityProfile.addObjective(dailyObjectiveDistance);
        activityProfileRepository.save(activityProfile);
        userRepository.save(user);
    }

    public List<ActivityTypeDTO> getActivityTypes() {
        return Arrays.stream(TypeActivity.values())
                .map(ActivityTypeDTO::new)
                .collect(Collectors.toList());
    }

    private String getEmailFromToken(String token) {
        return jwtUtils.extractEmail(token);
    }

}
