package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.ActivityService;
import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.catalina.filters.ExpiresFilter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RequestMapping("/activity")
@RestController
public class ActivityRestController {

    private final ActivityService activityService;

    public ActivityRestController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping("/createActivity")
    public ResponseEntity<String> createActivity(HttpServletRequest request, @RequestBody ActivityDTO activityDTO) {
        String token = getTokenAuthFromRequest(request);
        activityService.createActivity(activityDTO,token);
        return ResponseEntity.ok("Activity created");
    }

    @DeleteMapping("/deleteActivity")
    public ResponseEntity<String> deleteActivity(@RequestBody ActivityDTO activityDTO,String email) {
        activityService.deleteActivity(activityDTO,email);
        return ResponseEntity.ok("Activity deleted");
    }
    @PutMapping("/updateActivity")
    public ResponseEntity<String> updateActivity(@RequestBody ActivityDTO activityDTO,String email) {
        activityService.updateActivity(activityDTO,email);
        return ResponseEntity.ok("Activity updated");
    }

    @GetMapping("/getActivities")
    public ResponseEntity<?> getActivities(HttpServletRequest request) {
        String token = getTokenAuthFromRequest(request);
        return ResponseEntity.ok(activityService.getActivities(token));
    }

    @PostMapping("/addObjective")
    public ResponseEntity<String> addObjective(HttpServletRequest request, @RequestBody int dailyActivityObjective) {
        activityService.addObjective(getTokenAuthFromRequest(request),dailyActivityObjective);
        return ResponseEntity.ok("Objective added");
    }

    @GetMapping("/getObjective")
    public ResponseEntity<?> getObjective(HttpServletRequest request) {
        return ResponseEntity.ok(activityService.getObjective(getTokenAuthFromRequest(request)));
    }

    @GetMapping("/getActivityTypes")
    public ResponseEntity<?> getActivityTypes() {
        return ResponseEntity.ok(activityService.getActivityTypes());
    }

    @PostMapping("/addDailySteps")
    public ResponseEntity<?> addDailySteps(HttpServletRequest request, int dailySteps) {
        activityService.addDailySteps(getTokenAuthFromRequest(request), dailySteps);
        return ResponseEntity.ok("Daily steps added");
    }

    private String getTokenAuthFromRequest(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }

}
