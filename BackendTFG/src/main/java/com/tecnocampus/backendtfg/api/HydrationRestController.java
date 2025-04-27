package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.HydrationService;
import com.tecnocampus.backendtfg.application.dto.HydrationStatusDTO;
import com.tecnocampus.backendtfg.application.dto.HydrationUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/hydration")
public class HydrationRestController {

    private final HydrationService hydrationService;

    public HydrationRestController(HydrationService hydrationService) {
        this.hydrationService = hydrationService;
    }

    @PostMapping("/update")
    public ResponseEntity<Void> updateHydration(HttpServletRequest request, @RequestBody HydrationUpdateRequest hydrationUpdate) {
        String token = getTokenAuthFromRequest(request);
        hydrationService.updateHydration(token, hydrationUpdate);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    public ResponseEntity<HydrationStatusDTO> getHydrationStatus(HttpServletRequest request) {
        String token = getTokenAuthFromRequest(request);
        HydrationStatusDTO status = hydrationService.getHydrationStatus(token);
        return ResponseEntity.ok(status);
    }

    private String getTokenAuthFromRequest(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }
}