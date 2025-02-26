package com.tecnocampus.backendtfg;

import com.tecnocampus.backendtfg.application.ActivityService;
import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
import com.tecnocampus.backendtfg.domain.Activity;
import com.tecnocampus.backendtfg.domain.ActivityProfile;
import com.tecnocampus.backendtfg.domain.TypeActivity;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.ActivityProfileRepository;
import com.tecnocampus.backendtfg.persistence.ActivityRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.Date;

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

    @Test
    public void createActivityTest() {
        // Arrange
        ActivityProfile activityProfile = new ActivityProfile();
        User user = new User();
        String email = "example@email.com";
        user.setEmail(email);
        user.setActivityProfile(activityProfile);

        ActivityDTO activityDTO = new ActivityDTO();
        activityDTO.setDuration(1.5);
        activityDTO.setDate(new Date());
        activityDTO.setType(TypeActivity.RUNNING);
        activityDTO.setDescription("Test Description");

        Activity activity = new Activity(activityDTO, activityProfile);

        Mockito.when(userRepository.findByEmail(email)).thenReturn(user);
        Mockito.when(activityRepository.save(Mockito.any(Activity.class))).thenReturn(activity);
        Mockito.when(activityProfileRepository.save(Mockito.any(ActivityProfile.class))).thenReturn(activityProfile);

        // Act
        activityService.createActivity(activityDTO, email);

        // Assert
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(email);
        Mockito.verify(activityRepository, Mockito.times(1)).save(Mockito.any(Activity.class));
        Mockito.verify(activityProfileRepository, Mockito.times(1)).save(Mockito.any(ActivityProfile.class));
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

        Activity activity = new Activity(activityDTO, activityProfile);

        Mockito.when(userRepository.findByEmail(email)).thenReturn(user);
        Mockito.when(activityRepository.findByDate(date)).thenReturn(activity);

        // Act
        activityService.deleteActivity(activityDTO, email);

        // Assert
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(email);
        Mockito.verify(activityRepository, Mockito.times(1)).delete(Mockito.any(Activity.class));
        Mockito.verify(activityProfileRepository, Mockito.times(1)).save(Mockito.any(ActivityProfile.class));
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

        Activity activity = new Activity(activityDTO, activityProfile);

            Mockito.when(userRepository.findByEmail(email)).thenReturn(user);
            Mockito.when(activityRepository.findByDate(date)).thenReturn(activity);

            activityService.updateActivity(activityDTO, email);

            Mockito.verify(userRepository, Mockito.times(1)).findByEmail(email);
            Mockito.verify(activityRepository, Mockito.times(1)).findByDate(date);
            Mockito.verify(activityRepository, Mockito.times(1)).save(Mockito.any(Activity.class));
            Mockito.verify(activityProfileRepository, Mockito.times(1)).save(Mockito.any(ActivityProfile.class));
    }
}