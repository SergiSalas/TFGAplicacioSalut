package com.tecnocampus.backendtfg;

import com.tecnocampus.backendtfg.application.ActivityService;
import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.*;
import com.tecnocampus.backendtfg.persistence.ActivityProfileRepository;
import com.tecnocampus.backendtfg.persistence.ActivityRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;


@SpringBootTest
public class ActivityTests {

    @InjectMocks
    private ActivityService activityService;

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityProfileRepository activityProfileRepository;
    
    @Mock
    private JwtUtils jwtUtils;

    @Test
    public void createActivityTest() {
        // Arrange
        ActivityProfile activityProfile = new ActivityProfile();
        User user = new User();
        String email = "example@email.com";
        String token = "test-token";
        user.setEmail(email);
        user.setActivityProfile(activityProfile);

        ActivityDTO activityDTO = new ActivityDTO();
        activityDTO.setDuration(1.5);
        activityDTO.setDate(new Date());
        activityDTO.setType(TypeActivity.RUNNING);
        activityDTO.setDescription("Test Description");
        activityDTO.setOrigin(ActivityOrigin.APP);

        Mockito.when(jwtUtils.extractEmail(token)).thenReturn(email);
        Mockito.when(userRepository.findByEmail(email)).thenReturn(user);
        Mockito.when(userRepository.existsByEmail(email)).thenReturn(true);

        // Act
        activityService.createActivity(activityDTO, token);

        // Assert
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(email);
        Mockito.verify(activityRepository, Mockito.times(1)).save(Mockito.any(AbstractActivity.class));
        Mockito.verify(activityProfileRepository, Mockito.times(1)).save(activityProfile);
    }

    @Test
    public void deleteActivityTest() {
        // Arrange
        ActivityProfile activityProfile = new ActivityProfile();
        User user = new User();
        String email = "example@email.com";
        user.setEmail(email);
        user.setActivityProfile(activityProfile);

        Date date = new Date();
        ActivityDTO activityDTO = new ActivityDTO();
        activityDTO.setDuration(1.5);
        activityDTO.setDate(date);
        activityDTO.setType(TypeActivity.RUNNING);
        activityDTO.setDescription("Test Description");

        AbstractActivity activity = new AppActivity(1.5, date, TypeActivity.RUNNING, "Test Description", activityProfile);

        Mockito.when(userRepository.findByEmail(email)).thenReturn(user);
        Mockito.when(activityRepository.findByDate(date)).thenReturn(activity);

        // Act
        activityService.deleteActivity(activityDTO, email);

        // Assert
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(email);
        Mockito.verify(activityRepository, Mockito.times(1)).delete(activity);
        Mockito.verify(activityProfileRepository, Mockito.times(1)).save(activityProfile);
    }

    @Test
    public void updateActivityTest() {
        ActivityProfile activityProfile = new ActivityProfile();
        User user = new User();
        String email = "example@email.com";
        user.setEmail(email);
        user.setActivityProfile(activityProfile);

        Date date = new Date();
        ActivityDTO activityDTO = new ActivityDTO();
        activityDTO.setDuration(1.5);
        activityDTO.setDate(date);
        activityDTO.setType(TypeActivity.RUNNING);
        activityDTO.setDescription("Updated Description");

        AbstractActivity activity = new AppActivity(1.0, date, TypeActivity.RUNNING, "Original Description", activityProfile);

        Mockito.when(userRepository.findByEmail(email)).thenReturn(user);
        Mockito.when(activityRepository.findByDate(date)).thenReturn(activity);

        activityService.updateActivity(activityDTO, email);

        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(email);
        Mockito.verify(activityRepository, Mockito.times(1)).findByDate(date);
        Mockito.verify(activityRepository, Mockito.times(1)).save(activity);
        Mockito.verify(activityProfileRepository, Mockito.times(1)).save(activityProfile);
    }

    @Test
    public void getActivitiesTest() {
        // Arrange
        ActivityProfile activityProfile = new ActivityProfile();
        User user = new User();
        String email = "example@email.com";
        String token = "test-token";
        user.setEmail(email);
        user.setActivityProfile(activityProfile);

        List<AbstractActivity> activities = new ArrayList<>();
        AppActivity activity1 = new AppActivity(1.5, new Date(), TypeActivity.RUNNING, "Test Description 1", activityProfile);
        AppActivity activity2 = new AppActivity(2.0, new Date(), TypeActivity.CYCLING, "Test Description 2", activityProfile);
        HealthConnectActivity activity3 = new HealthConnectActivity(3.0, new Date(), TypeActivity.WALKING, "Health Connect Activity", activityProfile);

        activities.add(activity1);
        activities.add(activity2);
        activities.add(activity3);
        activityProfile.setActivities(activities);

        Mockito.when(jwtUtils.extractEmail(token)).thenReturn(email);
        Mockito.when(userRepository.findByEmail(email)).thenReturn(user);

        // Act
        List<ActivityDTO> resultActivities = activityService.getActivities(token, null);

        // Assert
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(email);
        assertEquals(2, resultActivities.size()); // Solo se devuelven actividades APP
    }

    @Test
    public void addObjectiveServiceTest() {
        // Arrange
        int dailyActivityObjective = 5;
        String email = "test@example.com";
        String token = "test-token";
        
        User user = new User();
        user.setEmail(email);
        ActivityProfile activityProfile = new ActivityProfile(user);
        user.setActivityProfile(activityProfile);

        Mockito.when(userRepository.findByEmail(email)).thenReturn(user);
        Mockito.when(jwtUtils.extractEmail(token)).thenReturn(email);

        // Act
        activityService.addObjective(token, dailyActivityObjective);

        // Assert
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(email);
        Mockito.verify(activityProfileRepository, Mockito.times(1)).save(Mockito.any(ActivityProfile.class));
        Mockito.verify(userRepository, Mockito.times(1)).save(Mockito.any(User.class));
    }
}
