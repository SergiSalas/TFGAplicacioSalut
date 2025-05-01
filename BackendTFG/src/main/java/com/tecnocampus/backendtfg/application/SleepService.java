package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.SleepDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.ChallengeType;
import com.tecnocampus.backendtfg.domain.Sleep;
import com.tecnocampus.backendtfg.domain.SleepProfile;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.SleepProfileRepository;
import com.tecnocampus.backendtfg.persistence.SleepRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
public class SleepService {

    private final SleepProfileRepository sleepProfileRepository;

    private final SleepRepository sleepRepository;

    private final UserRepository userRepository;

    private final ChallengeService challengeService;

    private final JwtUtils jwtUtils;

    public SleepService(SleepProfileRepository sleepProfileRepository, SleepRepository sleepRepository,
                        UserRepository userRepository, JwtUtils jwtUtils,
                        ChallengeService challengeService) {
        this.sleepProfileRepository = sleepProfileRepository;
        this.sleepRepository = sleepRepository;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.challengeService = challengeService;
    }

    public void createSleep(SleepDTO sleepDTO, String token) {
        String email = getEmailFromToken(token);
        if (!userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User not found");
        }

        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();

        // Check for duplicate sleep
        if (isDuplicateSleep(sleepProfile, sleepDTO)) {
            throw new IllegalArgumentException("Duplicate sleep record with the same time range");
        }
        Sleep sleep = new Sleep(sleepDTO, sleepProfile);
        challengeService.updateChallengeProgress(token, ChallengeType.SLEEP_HOURS,
                (int)(sleepDTO.getHours() * 60));
        sleepProfile.addSleep(sleep);
        sleepProfileRepository.save(sleepProfile);
    }
    public void deleteSleep(SleepDTO sleepDTO, String email) {
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();
        // Use startTime instead of date
        Sleep sleep = findSleepByTimeRange(sleepProfile, sleepDTO.getStartTime(), sleepDTO.getEndTime());
        if (sleep != null) {
            sleepRepository.delete(sleep);
            sleepProfileRepository.save(sleepProfile);
        } else {
            throw new IllegalArgumentException("Sleep record not found");
        }
    }

    public void updateSleep(SleepDTO sleepDTO, String email) {
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();
        // Use startTime instead of date
        Sleep sleep = findSleepByTimeRange(sleepProfile, sleepDTO.getStartTime(), sleepDTO.getEndTime());
        if (sleep != null) {
            sleep.update(sleepDTO);
            sleepRepository.save(sleep);
            sleepProfileRepository.save(sleepProfile);
        } else {
            throw new IllegalArgumentException("Sleep record not found");
        }
    }

    public List<SleepDTO> getSleeps(String token, Date date) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();
        List<Sleep> sleeps = sleepRepository.findBySleepProfile(sleepProfile);

        if (date != null) {
            // Filtrar por fecha si se proporciona
            sleeps = sleeps.stream()
                    .filter(sleep -> isSameDay(sleep.getStartTime(), date))
                    .toList();
        }

        return sleeps.stream().map(SleepDTO::new).toList();
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

    public void addObjective(double dailyObjectiveSleep, String email) {
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();
        sleepProfile.addObjective(dailyObjectiveSleep);
        sleepProfileRepository.save(sleepProfile);
        userRepository.save(user);
    }

    private String getEmailFromToken(String token) {
        return jwtUtils.extractEmail(token);
    }

    private boolean isDuplicateSleep(SleepProfile sleepProfile, SleepDTO sleepDTO) {
        if (sleepProfile == null || sleepDTO == null || sleepDTO.getStartTime() == null || sleepDTO.getEndTime() == null) {
            return false;
        }
        Sleep existingSleep = sleepRepository.findByStartTimeAndEndTime(sleepDTO.getStartTime(), sleepDTO.getEndTime());
        return existingSleep != null;
    }

    private Sleep findSleepByTimeRange(SleepProfile sleepProfile, Date startTime, Date endTime) {
        return sleepRepository.findBySleepProfile(sleepProfile).stream()
                .filter(sleep ->
                        sleep.getStartTime().equals(startTime) &&
                                sleep.getEndTime().equals(endTime))
                .findFirst()
                .orElse(null);
    }
}
