package com.tecnocampus.backendtfg;

import com.tecnocampus.backendtfg.application.ChallengeService;
import com.tecnocampus.backendtfg.application.SleepService;
import com.tecnocampus.backendtfg.application.dto.SleepDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
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

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private ChallengeService challengeService;

    @InjectMocks
    private SleepService sleepService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreateSleep() {
        // Arrange
        String token = "test-token";
        String email = "test@example.com";
        Date startTime = new Date();
        Date endTime = new Date(startTime.getTime() + 28800000); // 8 hours later

        SleepDTO sleepDTO = new SleepDTO();
        sleepDTO.setHours(8);
        sleepDTO.setStartTime(startTime);
        sleepDTO.setEndTime(endTime);
        sleepDTO.setQuality(3); // GOOD quality value
        sleepDTO.setComment("Good sleep");

        User user = new User();
        SleepProfile sleepProfile = new SleepProfile();
        user.setSleepProfile(sleepProfile);
        sleepProfile.setSleeps(new ArrayList<>());

        when(jwtUtils.extractEmail(token)).thenReturn(email);
        when(userRepository.existsByEmail(email)).thenReturn(true);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(sleepRepository.findBySleepProfile(sleepProfile)).thenReturn(new ArrayList<>());

        // Act
        sleepService.createSleep(sleepDTO, token);

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
        String token = "test-token";
        String email = "test@example.com";
        User user = new User();
        SleepProfile sleepProfile = new SleepProfile();
        user.setSleepProfile(sleepProfile);

        // Crear SleepDTOs y luego Sleep con ellos
        SleepDTO sleepDTO1 = new SleepDTO();
        sleepDTO1.setHours(8);
        sleepDTO1.setQuality(3);
        sleepDTO1.setComment("Good sleep");

        SleepDTO sleepDTO2 = new SleepDTO();
        sleepDTO2.setHours(6);
        sleepDTO2.setQuality(2);
        sleepDTO2.setComment("Average sleep");

        Sleep sleep1 = new Sleep();
        sleep1.setSleepProfile(sleepProfile);
        sleep1.setHours(8);
        sleep1.setQuality(3);
        sleep1.setComment("Good sleep");

        Sleep sleep2 = new Sleep();
        sleep2.setSleepProfile(sleepProfile);
        sleep2.setHours(6);
        sleep2.setQuality(2);
        sleep2.setComment("Average sleep");

        List<Sleep> sleepList = List.of(sleep1, sleep2);

        when(jwtUtils.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(sleepRepository.findBySleepProfile(sleepProfile)).thenReturn(sleepList);

        // Act - se necesitan dos parámetros: token y date (puede ser null)
        List<SleepDTO> sleeps = sleepService.getSleeps(token, null);

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
        String token = "test-token";
        String email = "test@example.com";
        double dailyObjectiveSleep = 8.0;

        User user = new User();
        SleepProfile sleepProfile = new SleepProfile();
        user.setSleepProfile(sleepProfile);

        when(jwtUtils.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(user);

        // Act - orden correcto: primero token, luego objetivo
        sleepService.addObjective(token, dailyObjectiveSleep);

        // Assert
        verify(sleepProfileRepository, times(1)).save(sleepProfile);
        verify(userRepository, times(1)).save(user);
        assertEquals(dailyObjectiveSleep, sleepProfile.getDailyObjectiveSleep());
    }
}