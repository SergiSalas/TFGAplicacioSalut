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
import java.util.List;
import java.util.stream.Collectors;

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

    public void updateActivity(ActivityDTO activityDTO,String email) {
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        Date date = activityDTO.getDate();
        Activity activity = activityRepository.findByDate(date);
        activity.update(activityDTO);
        activityRepository.save(activity);
        activityProfileRepository.save(activityProfile);
    }

    public List<ActivityDTO> getActivities(String email) {
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
}
