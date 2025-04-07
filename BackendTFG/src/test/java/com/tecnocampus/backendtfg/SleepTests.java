package com.tecnocampus.backendtfg;

import com.tecnocampus.backendtfg.application.SleepService;
import com.tecnocampus.backendtfg.application.dto.SleepDTO;
import com.tecnocampus.backendtfg.domain.Sleep;
import com.tecnocampus.backendtfg.domain.SleepProfile;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.SleepProfileRepository;
import com.tecnocampus.backendtfg.persistence.SleepRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

public class SleepTests {

    @Mock
    private SleepRepository sleepRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SleepProfileRepository sleepProfileRepository;

    @InjectMocks
    private SleepService sleepService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreateSleep() {
        // Arrange
        String email = "test@example.com";
        Date startTime = new Date();
        Date endTime = new Date(startTime.getTime() + 28800000); // 8 hours later

        SleepDTO sleepDTO = new SleepDTO();
        sleepDTO.setHours(8);
        sleepDTO.setStartTime(startTime);
        sleepDTO.setEndTime(endTime);
        sleepDTO.setQuality(3); // GOOD quality value
        sleepDTO.setRemSleep(120);
        sleepDTO.setComment("Good sleep");

        User user = new User();
        SleepProfile sleepProfile = new SleepProfile();
        user.setSleepProfile(sleepProfile);
        sleepProfile.setSleeps(new ArrayList<>());

        when(userRepository.existsByEmail(email)).thenReturn(true);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(sleepRepository.findBySleepProfile(sleepProfile)).thenReturn(new ArrayList<>());

        // Act
        sleepService.createSleep(sleepDTO, email);

        // Assert
        verify(sleepRepository, times(1)).save(any(Sleep.class));
        verify(sleepProfileRepository, times(1)).save(sleepProfile);
    }

    @Test
    public void testDeleteSleep() {
        // Arrange
        String email = "test@example.com";
        Date startTime = new Date();
        Date endTime = new Date(startTime.getTime() + 28800000); // 8 hours later

        SleepDTO sleepDTO = new SleepDTO();
        sleepDTO.setStartTime(startTime);
        sleepDTO.setEndTime(endTime);

        User user = new User();
        SleepProfile sleepProfile = new SleepProfile();
        user.setSleepProfile(sleepProfile);

        Sleep sleep = new Sleep();
        sleep.setStartTime(startTime);
        sleep.setEndTime(endTime);
        sleep.setSleepProfile(sleepProfile);

        List<Sleep> sleeps = new ArrayList<>();
        sleeps.add(sleep);

        when(userRepository.findByEmail(email)).thenReturn(user);
        when(sleepRepository.findBySleepProfile(sleepProfile)).thenReturn(sleeps);

        // Act
        sleepService.deleteSleep(sleepDTO, email);

        // Assert
        verify(sleepRepository, times(1)).delete(sleep);
    }

    @Test
    public void testUpdateSleep() {
        // Arrange
        String email = "test@example.com";
        Date startTime = new Date();
        Date endTime = new Date(startTime.getTime() + 28800000); // 8 hours later

        SleepDTO sleepDTO = new SleepDTO();
        sleepDTO.setHours(7);
        sleepDTO.setStartTime(startTime);
        sleepDTO.setEndTime(endTime);
        sleepDTO.setQuality(2); // AVERAGE quality value
        sleepDTO.setRemSleep(90);
        sleepDTO.setComment("Average sleep");

        User user = new User();
        SleepProfile sleepProfile = new SleepProfile();
        user.setSleepProfile(sleepProfile);

        Sleep existingSleep = new Sleep();
        existingSleep.setStartTime(startTime);
        existingSleep.setEndTime(endTime);
        existingSleep.setSleepProfile(sleepProfile);

        List<Sleep> sleeps = new ArrayList<>();
        sleeps.add(existingSleep);

        when(userRepository.findByEmail(email)).thenReturn(user);
        when(sleepRepository.findBySleepProfile(sleepProfile)).thenReturn(sleeps);

        // Act
        sleepService.updateSleep(sleepDTO, email);

        // Assert
        verify(sleepRepository, times(1)).save(existingSleep);
        verify(sleepProfileRepository, times(1)).save(sleepProfile);
    }

    @Test
    public void testGetSleeps() {
        // Arrange
        String email = "test@example.com";
        User user = new User();
        SleepProfile sleepProfile = new SleepProfile();
        user.setSleepProfile(sleepProfile);

        Sleep sleep1 = new Sleep(8, new Date(), new Date(), 3, 120, "Good sleep", sleepProfile);
        Sleep sleep2 = new Sleep(6, new Date(), new Date(), 2, 90, "Average sleep", sleepProfile);
        List<Sleep> sleepList = List.of(sleep1, sleep2);

        when(userRepository.findByEmail(email)).thenReturn(user);
        when(sleepRepository.findBySleepProfile(sleepProfile)).thenReturn(sleepList);

        // Act
        List<SleepDTO> sleeps = sleepService.getSleeps(email);

        // Assert
        verify(userRepository, times(1)).findByEmail(email);
        verify(sleepRepository, times(1)).findBySleepProfile(sleepProfile);
        assertEquals(2, sleeps.size());
        assertEquals("Good sleep", sleeps.get(0).getComment());
        assertEquals("Average sleep", sleeps.get(1).getComment());
    }

    @Test
    public void testAddObjective() {
        // Arrange
        String email = "test@example.com";
        double dailyObjectiveSleep = 8.0;

        User user = new User();
        SleepProfile sleepProfile = new SleepProfile();
        user.setSleepProfile(sleepProfile);

        when(userRepository.findByEmail(email)).thenReturn(user);

        // Act
        sleepService.addObjective(dailyObjectiveSleep, email);

        // Assert
        verify(sleepProfileRepository, times(1)).save(sleepProfile);
        verify(userRepository, times(1)).save(user);
        assertEquals(dailyObjectiveSleep, sleepProfile.getDailyObjectiveSleep());
    }
}