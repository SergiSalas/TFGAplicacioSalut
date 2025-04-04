package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.SleepService;
import com.tecnocampus.backendtfg.application.dto.SleepDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/sleep")
@RestController
public class SleepRestController {

    private final SleepService sleepService;

    public SleepRestController(SleepService sleepService) {
        this.sleepService = sleepService;
    }

    @PostMapping("/createSleep")
    public ResponseEntity<String> createSleep(@RequestBody SleepDTO sleepDTO, String email) {
        sleepService.createSleep(sleepDTO,email);
        return ResponseEntity.ok("Sleep created");
    }

    @DeleteMapping("/deleteSleep")
    public ResponseEntity<String> deleteSleep(@RequestBody SleepDTO sleepDTO, String email) {
        sleepService.deleteSleep(sleepDTO,email);
        return ResponseEntity.ok("Sleep deleted");
    }

    @PutMapping("/updateSleep")
    public ResponseEntity<String> updateSleep(@RequestBody SleepDTO sleepDTO, String email) {
        sleepService.updateSleep(sleepDTO,email);
        return ResponseEntity.ok("Sleep updated");
    }

    @GetMapping("/getSleeps")
    public ResponseEntity<?> getSleeps(String email) {
        return ResponseEntity.ok(sleepService.getSleeps(email));
    }

    @PostMapping("/addObjective")
    public ResponseEntity<String> addObjective(double dailyObjectiveSleep, String email) {
        sleepService.addObjective(dailyObjectiveSleep,email);
        return ResponseEntity.ok("Objective added");
    }

}
