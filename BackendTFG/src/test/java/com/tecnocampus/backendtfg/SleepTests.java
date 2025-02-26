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
}