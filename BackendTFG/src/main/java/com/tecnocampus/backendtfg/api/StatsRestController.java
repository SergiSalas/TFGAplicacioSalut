package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.StatsService;
import com.tecnocampus.backendtfg.application.dto.HydrationStatsDTO;
import com.tecnocampus.backendtfg.application.dto.SleepStatsDTO;
import com.tecnocampus.backendtfg.application.dto.StatsDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/stats")
public class StatsRestController {

    private final StatsService statsService;

    public StatsRestController(StatsService statsService) {
        this.statsService = statsService;
    }

    private String getTokenAuthFromRequest(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }

    @GetMapping("/activity")
    public ResponseEntity<StatsDTO> getActivityStats(HttpServletRequest request) {
        String token = getTokenAuthFromRequest(request);
        StatsDTO statsDTO = statsService.getActivityStats(token);
        return ResponseEntity.ok(statsDTO);
    }

    @GetMapping("/activity/{period}")
    public ResponseEntity<StatsDTO> getActivityStatsByPeriod(
            HttpServletRequest request,
            @PathVariable String period) {
        String token = getTokenAuthFromRequest(request);
        StatsDTO statsDTO = statsService.getActivityStats(token, period);
        return ResponseEntity.ok(statsDTO);
    }

    @GetMapping("/sleep")
    public ResponseEntity<SleepStatsDTO> getSleepStats(HttpServletRequest request) {
        String token = getTokenAuthFromRequest(request);
        SleepStatsDTO dto = statsService.getSleepStats(token);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/sleep/{period}")
    public ResponseEntity<SleepStatsDTO> getSleepStatsByPeriod(
            HttpServletRequest request,
            @PathVariable String period) {
        String token = getTokenAuthFromRequest(request);
        SleepStatsDTO dto = statsService.getSleepStats(token, period);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/water")
    public ResponseEntity<HydrationStatsDTO> getHydrationStats(HttpServletRequest request) {
        String token = getTokenAuthFromRequest(request);
        HydrationStatsDTO statsDTO = statsService.getHydrationStats(token);
        return ResponseEntity.ok(statsDTO);
    }

    @GetMapping("/water/{period}")
    public ResponseEntity<HydrationStatsDTO> getHydrationStatsByPeriod(
            HttpServletRequest request,
            @PathVariable String period) {
        String token = getTokenAuthFromRequest(request);
        HydrationStatsDTO statsDTO = statsService.getHydrationStats(token, period);
        return ResponseEntity.ok(statsDTO);
    }

}
