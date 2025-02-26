package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.SleepService;
import com.tecnocampus.backendtfg.application.dto.SleepDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
