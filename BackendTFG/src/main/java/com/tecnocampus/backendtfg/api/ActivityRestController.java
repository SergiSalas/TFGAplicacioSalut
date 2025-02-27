package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.ActivityService;
import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
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
    public ResponseEntity<String> createActivity(@RequestBody ActivityDTO activityDTO,String email) {
        activityService.createActivity(activityDTO,email);
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
    public ResponseEntity<?> getActivities(String email) {
        return ResponseEntity.ok(activityService.getActivities(email));
    }

}
