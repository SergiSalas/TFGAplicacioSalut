package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
import com.tecnocampus.backendtfg.application.dto.ActivityTypeDTO;
import com.tecnocampus.backendtfg.application.dto.DailyStepsDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.*;
import com.tecnocampus.backendtfg.persistence.ActivityProfileRepository;
import com.tecnocampus.backendtfg.persistence.ActivityRepository;
import com.tecnocampus.backendtfg.persistence.DailyStepsRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    private final UserRepository userRepository;

    private final ActivityProfileRepository activityProfileRepository;

    private final DailyStepsRepository dailyStepsRepository;

    private final JwtUtils jwtUtils;

    public ActivityService(ActivityRepository activityRepository, UserRepository userRepository,
                           ActivityProfileRepository activityProfileRepository, JwtUtils jwtUtils,
                           DailyStepsRepository dailyStepsRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.activityProfileRepository = activityProfileRepository;
        this.jwtUtils = jwtUtils;
        this.dailyStepsRepository = dailyStepsRepository;
    }

    public void createActivity(ActivityDTO activityDTO, String token) {
        System.out.println(activityDTO.toString());
        String email = getEmailFromToken(token);
        if (!userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User not found");
        }
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();

        // Check for duplicate, especially important for Health Connect activities
        if (activityDTO.getOrigin() == ActivityOrigin.HEALTH_CONNECT &&
                isDuplicateActivity(activityDTO, activityProfile)) {
            throw new IllegalArgumentException("Duplicate activity");
        }
        AbstractActivity activity;
        if (activityDTO.getOrigin() != null && activityDTO.getOrigin() == ActivityOrigin.HEALTH_CONNECT) {
            // Instantiate a HealthConnectActivity.
            activity = new HealthConnectActivity(activityDTO.getDuration(),
                    activityDTO.getDate(),
                    activityDTO.getType(),
                    activityDTO.getDescription(),
                    activityProfile);
            activity.setOrigin(ActivityOrigin.HEALTH_CONNECT);
        } else {
            // Default to AppActivity.
            activity = new AppActivity(activityDTO.getDuration(),
                    activityDTO.getDate(),
                    activityDTO.getType(),
                    activityDTO.getDescription(),
                    activityProfile);
            activity.setOrigin(ActivityOrigin.APP);
        }
        activity.calculateCalories();
        activityProfile.addActivity(activity);
        activityProfileRepository.save(activityProfile);
    }

    public void deleteActivity(ActivityDTO activityDTO,String email) {
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        Date date = activityDTO.getDate();
        AbstractActivity activity = activityRepository.findByDate(date);
        activityRepository.delete(activity);
        activityProfileRepository.save(activityProfile);
    }

    public void updateActivity(ActivityDTO activityDTO,String email) {
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        Date date = activityDTO.getDate();
        AbstractActivity activity = activityRepository.findByDate(date);
        if (activity instanceof HealthConnectActivity) {
            HealthConnectActivity healthConnectActivity = (HealthConnectActivity) activity;
            healthConnectActivity.update(activityDTO);
        } else {
            AppActivity appActivity = (AppActivity) activity;
            appActivity.update(activityDTO);
        }
        activityRepository.save(activity);
        activityProfileRepository.save(activityProfile);
    }

    public List<ActivityDTO> getActivities(String token, Date date) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();

        Stream<AbstractActivity> activityStream = activityProfile.getActivities().stream()
                .filter(activity -> activity.getType() != TypeActivity.WALKING);

        if (date != null) {
            activityStream = activityStream.filter(activity -> isSameDay(activity.getDate(), date));
        }

        return activityStream.map(ActivityDTO::new).collect(Collectors.toList());
    }

    private boolean isSameDay(Date date1, Date date2) {
        if (date1 == null || date2 == null) {
            return false;
        }
        Calendar cal1 = Calendar.getInstance();
        cal1.setTime(date1);
        Calendar cal2 = Calendar.getInstance();
        cal2.setTime(date2);
        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
                cal1.get(Calendar.MONTH) == cal2.get(Calendar.MONTH) &&
                cal1.get(Calendar.DAY_OF_MONTH) == cal2.get(Calendar.DAY_OF_MONTH);
    }

    public void addObjective(String token, int dailyObjectiveDistance) {
        String email = getEmailFromToken(token);
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

    public void addDailySteps(String token, DailyStepsDTO dailyStepsDTO) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        DailySteps existingDailySteps = dailyStepsRepository.findByDay(dailyStepsDTO.getDate());

        if (existingDailySteps != null) {
            // Actualizar solo si los nuevos pasos son mayores
            if (existingDailySteps.getSteps() < dailyStepsDTO.getSteps()) {
                existingDailySteps.setSteps(dailyStepsDTO.getSteps());
                existingDailySteps.setDuration(dailyStepsDTO.getDuration());
                dailyStepsRepository.save(existingDailySteps);
            }
        } else {
            DailySteps dailySteps = new DailySteps(dailyStepsDTO);
            activityProfile.addDailySteps(dailySteps);
            activityProfileRepository.save(activityProfile);
            dailyStepsRepository.save(dailySteps);
        }
    }

    public DailyStepsDTO getDailySteps(String token, Date date) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        DailyStepsDTO dailyStepsDTO = dailyStepsRepository.getDailyStepsDTOByDateAndActivityProfile(date, activityProfile);
        if (dailyStepsDTO == null ) {
            throw new IllegalArgumentException("No daily steps found for the given date");
        }
        return dailyStepsDTO;
    }


    public int getObjective(String token) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        return activityProfile.getDailyObjectiveDistance();
    }

    private boolean isDuplicateActivity(ActivityDTO activityDTO, ActivityProfile activityProfile) {
        if (activityDTO == null || activityProfile == null) {
            return false;
        }

        return activityProfile.getActivities().stream()
                .anyMatch(existingActivity ->
                        existingActivity.getType() == activityDTO.getType() &&
                                existingActivity.getDate() != null &&
                                activityDTO.getDate() != null &&
                                Math.abs(existingActivity.getDate().getTime() - activityDTO.getDate().getTime()) < 60000 && // Within 1 minute
                                Math.abs(existingActivity.getDuration() - activityDTO.getDuration()) < 0.1 && // Similar duration
                                existingActivity.getOrigin() == activityDTO.getOrigin());
    }

    private boolean isDuplicateDailySteps(DailyStepsDTO dailyStepsDTO, ActivityProfile activityProfile) {
        if (dailyStepsDTO == null || activityProfile == null || dailyStepsDTO.getDate() == null) {
            return false;
        }

        // Usar el repositorio para búsqueda por día
        DailySteps existingDailySteps = dailyStepsRepository.findByDay(dailyStepsDTO.getDate());
        return existingDailySteps != null;
    }

    public double getTotalCalories(String token, Date date) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        ActivityProfile activityProfile = user.getActivityProfile();
        double totalCalories = activityProfile.getActivities().stream()
                .filter(activity -> isSameDay(activity.getDate(), date)) // Using isSameDay for better date matching
                .mapToDouble(AbstractActivity::getCaloriesBurned)
                .sum();

        // Round to one decimal place
        return Math.round(totalCalories * 10.0) / 10.0;
    }
}
