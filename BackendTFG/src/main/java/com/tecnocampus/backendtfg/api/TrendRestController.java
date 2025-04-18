package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.TrendService;
import com.tecnocampus.backendtfg.application.dto.TrendsDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/trend")
public class TrendRestController {

    private final TrendService trendService;

    public TrendRestController(TrendService trendService) {
        this.trendService = trendService;
    }

    private String getTokenAuthFromRequest(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }

    @GetMapping("/activity/{period}")
    public ResponseEntity<TrendsDTO> getActivityTrends(
            HttpServletRequest request,
            @PathVariable String period) {
        String token = getTokenAuthFromRequest(request);
        TrendsDTO trendsDTO = trendService.getActivityTrends(token, period);
        return ResponseEntity.ok(trendsDTO);
    }

    @GetMapping("/steps/{period}")
    public ResponseEntity<TrendsDTO> getStepsTrends(
            HttpServletRequest request,
            @PathVariable String period) {
        String token = getTokenAuthFromRequest(request);
        TrendsDTO trendsDTO = trendService.getStepsTrends(token, period);
        return ResponseEntity.ok(trendsDTO);
    }
}
