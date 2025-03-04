package com.tecnocampus.backendtfg;

import com.tecnocampus.backendtfg.application.SleepService;
import com.tecnocampus.backendtfg.application.dto.SleepDTO;
import com.tecnocampus.backendtfg.domain.Sleep;
import com.tecnocampus.backendtfg.domain.SleepProfile;
import com.tecnocampus.backendtfg.domain.TypeQuality;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.SleepProfileRepository;
import com.tecnocampus.backendtfg.persistence.SleepRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

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
        SleepDTO sleepDTO = new SleepDTO();
        sleepDTO.setHours(8);
        sleepDTO.setDate(new Date());
        sleepDTO.setStartTime(new Date());
        sleepDTO.setEndTime(new Date());
        sleepDTO.setQuality(TypeQuality.GOOD);
        sleepDTO.setComment("Good sleep");

        User user = new User();
        SleepProfile sleepProfile = new SleepProfile();
        user.setSleepProfile(sleepProfile);

        when(userRepository.findByEmail(email)).thenReturn(user);

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
        SleepDTO sleepDTO = new SleepDTO();
        User user = new User();
        user.setSleepProfile(new SleepProfile());
        Date date = new Date();
        sleepDTO.setDate(date);
        Sleep sleep = new Sleep(sleepDTO, user.getSleepProfile());
        sleep.setDate(date);
        user.getSleepProfile().getSleeps().add(sleep);

        when(userRepository.findByEmail(email)).thenReturn(user);
        when(sleepRepository.findByDate(date)).thenReturn(sleep);

        // Act
        sleepService.deleteSleep(sleepDTO, email);

        // Assert
        verify(sleepRepository, times(1)).delete(sleep);
    }

    @Test
    public void testUpdateSleep() {
        // Arrange
        String email = "test@example.com";
        SleepDTO sleepDTO = new SleepDTO();
        sleepDTO.setHours(7);
        sleepDTO.setDate(new Date());
        sleepDTO.setStartTime(new Date());
        sleepDTO.setEndTime(new Date());
        sleepDTO.setQuality(TypeQuality.AVERAGE);
        sleepDTO.setComment("Average sleep");

        User user = new User();
        SleepProfile sleepProfile = new SleepProfile();
        user.setSleepProfile(sleepProfile);

        Sleep existingSleep = new Sleep();
        existingSleep.setDate(sleepDTO.getDate());

        when(userRepository.findByEmail(email)).thenReturn(user);
        when(sleepRepository.findByDate(sleepDTO.getDate())).thenReturn(existingSleep);

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

        Sleep sleep1 = new Sleep(8, new Date(), new Date(), new Date(), TypeQuality.GOOD, "Good sleep", sleepProfile);
        Sleep sleep2 = new Sleep(6, new Date(), new Date(), new Date(), TypeQuality.AVERAGE, "Average sleep", sleepProfile);
        sleepProfile.setSleeps(List.of(sleep1, sleep2));

        when(userRepository.findByEmail(email)).thenReturn(user);
        when(sleepRepository.findBySleepProfile(sleepProfile)).thenReturn(List.of(sleep1, sleep2));

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