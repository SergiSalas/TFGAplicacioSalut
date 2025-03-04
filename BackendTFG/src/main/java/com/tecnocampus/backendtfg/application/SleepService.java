package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.SleepDTO;
import com.tecnocampus.backendtfg.domain.Sleep;
import com.tecnocampus.backendtfg.domain.SleepProfile;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.SleepProfileRepository;
import com.tecnocampus.backendtfg.persistence.SleepRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SleepService {

    private final SleepProfileRepository sleepProfileRepository;

    private final SleepRepository sleepRepository;

    private final UserRepository userRepository;

    public SleepService(SleepProfileRepository sleepProfileRepository, SleepRepository sleepRepository, UserRepository userRepository) {
        this.sleepProfileRepository = sleepProfileRepository;
        this.sleepRepository = sleepRepository;
        this.userRepository = userRepository;
    }

    public void createSleep(SleepDTO sleepDTO, String email) {
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();
        Sleep sleep = new Sleep(sleepDTO, sleepProfile);
        sleepRepository.save(sleep);
        sleepProfileRepository.save(sleepProfile);
    }

    public void deleteSleep(SleepDTO sleepDTO, String email) {
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();
        Sleep sleep = sleepRepository.findByDate(sleepDTO.getDate());
        sleepRepository.delete(sleep);
        sleepProfileRepository.save(sleepProfile);
    }

    public void updateSleep(SleepDTO sleepDTO, String email) {
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();
        Sleep sleep = sleepRepository.findByDate(sleepDTO.getDate());
        sleep.update(sleepDTO);
        sleepRepository.save(sleep);
        sleepProfileRepository.save(sleepProfile);
    }

    public List<SleepDTO> getSleeps(String email) {
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();
        List<Sleep> sleeps = sleepRepository.findBySleepProfile(sleepProfile);
        return sleeps.stream().map(SleepDTO::new).toList();
    }

    public void addObjective(double dailyObjectiveSleep, String email) {
        User user = userRepository.findByEmail(email);
        SleepProfile sleepProfile = user.getSleepProfile();
        sleepProfile.addObjective(dailyObjectiveSleep);
        sleepProfileRepository.save(sleepProfile);
        userRepository.save(user);
    }
}
