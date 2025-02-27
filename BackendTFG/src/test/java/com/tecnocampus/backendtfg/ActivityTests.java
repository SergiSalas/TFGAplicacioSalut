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
import org.springframework.http.MediaType;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

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

    @Test
    public void getActivitiesTest() {
        // Arrange
        ActivityProfile activityProfile = new ActivityProfile();
        User user = new User();
        String email = "example@email.com";
        user.setEmail(email);
        user.setActivityProfile(activityProfile);

        Activity activity1 = new Activity(1.5, new Date(), TypeActivity.RUNNING, "Test Description 1", activityProfile);
        Activity activity2 = new Activity(2.0, new Date(), TypeActivity.CYCLING, "Test Description 2", activityProfile);
        activityProfile.setActivities(List.of(activity1, activity2));

        Mockito.when(userRepository.findByEmail(email)).thenReturn(user);

        // Act
        List<ActivityDTO> activities = activityService.getActivities(email);

        // Assert
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(email);
        assertEquals(2, activities.size());
        assertEquals("Test Description 1", activities.get(0).getDescription());
        assertEquals("Test Description 2", activities.get(1).getDescription());
    }

    @Test
    public void addObjectiveServiceTest() {
        // Arrange
        double dailyActivityObjective = 5.0;
        String email = "test@example.com";
        User user = new User();
        user.setEmail(email);
        ActivityProfile activityProfile = new ActivityProfile(user);
        user.setActivityProfile(activityProfile);

        Mockito.when(userRepository.findByEmail(email)).thenReturn(user);

        // Act
        activityService.addObjective(dailyActivityObjective, email);

        // Assert
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail(email);
        Mockito.verify(activityProfileRepository, Mockito.times(1)).save(Mockito.any(ActivityProfile.class));
        Mockito.verify(userRepository, Mockito.times(1)).save(Mockito.any(User.class));
    }
}