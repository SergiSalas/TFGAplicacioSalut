package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.SleepService;
import com.tecnocampus.backendtfg.application.dto.SleepDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RequestMapping("/sleep")
@RestController
public class SleepRestController {

    private final SleepService sleepService;

    public SleepRestController(SleepService sleepService) {
        this.sleepService = sleepService;
    }

    @PostMapping("/createSleep")
    public ResponseEntity<SleepDTO> createSleep(HttpServletRequest request, @RequestBody SleepDTO sleepDTO) {
        String token = getTokenAuthFromRequest(request);
        sleepService.createSleep(sleepDTO,token);
        return ResponseEntity.ok(sleepDTO);
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
    public ResponseEntity<?> getSleeps(HttpServletRequest request,
                                       @RequestParam(required = false)
                                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date date) {
        String token = getTokenAuthFromRequest(request);
        System.out.println(sleepService.getSleeps(token, date).toString());
        return ResponseEntity.ok(sleepService.getSleeps(token,date));
    }

    @PostMapping("/addObjective")
    public ResponseEntity<String> addObjective(HttpServletRequest request, @RequestBody double dailyObjectiveSleep) {
        String token = getTokenAuthFromRequest(request);
        sleepService.addObjective(token,dailyObjectiveSleep);
        return ResponseEntity.ok("Objective added");
    }

    @GetMapping("/getObjective")
    public ResponseEntity<?> getObjective(HttpServletRequest request) {
        return ResponseEntity.ok(sleepService.getObjective(getTokenAuthFromRequest(request)));
    }
    private String getTokenAuthFromRequest(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }
}

