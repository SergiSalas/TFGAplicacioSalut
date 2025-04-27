package com.tecnocampus.backendtfg.application.dto;

import com.tecnocampus.backendtfg.domain.Level;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LevelDTO {
    private int currentLevel;
    private int currentExp;
    private int expToNextLevel;
    private double progressPercentage;

    public LevelDTO(Level level) {
        this.currentLevel = level.getCurrentLevel();
        this.currentExp = level.getCurrentExp();
        this.expToNextLevel = level.getExpToNextLevel();
        this.progressPercentage = (double) currentExp / expToNextLevel * 100;
    }
}