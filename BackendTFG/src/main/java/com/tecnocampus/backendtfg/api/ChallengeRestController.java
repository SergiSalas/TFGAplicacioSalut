package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.ChallengeService;
import com.tecnocampus.backendtfg.application.dto.ChallengeDTO;
import com.tecnocampus.backendtfg.application.dto.LevelDTO;
import com.tecnocampus.backendtfg.domain.Challenge;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/challenges")
public class ChallengeRestController {

    private final ChallengeService challengeService;

    public ChallengeRestController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    private String getTokenAuthFromRequest(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }

    @GetMapping("/generate")
    public ResponseEntity<List<ChallengeDTO>> generateChallenges(HttpServletRequest request) {
        String token = getTokenAuthFromRequest(request);
        List<ChallengeDTO> challenges = challengeService.generateDailyChallenges(token);
        return ResponseEntity.ok(challenges);
    }

    @GetMapping
    public ResponseEntity<List<ChallengeDTO>> getUserChallenges(HttpServletRequest request) {
        String token = getTokenAuthFromRequest(request);
        List<ChallengeDTO> challenges = challengeService.getUserChallenges(token);
        return ResponseEntity.ok(challenges);
    }

    @GetMapping("/getLevel")
    public ResponseEntity<LevelDTO> getUserLevel(HttpServletRequest request) {
        String token = getTokenAuthFromRequest(request);
        LevelDTO levelDTO = challengeService.getUserLevel(token);
        return ResponseEntity.ok(levelDTO);
    }
}