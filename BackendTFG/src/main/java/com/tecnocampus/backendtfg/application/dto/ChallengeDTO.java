package com.tecnocampus.backendtfg.application.dto;

import com.tecnocampus.backendtfg.domain.Challenge;
import com.tecnocampus.backendtfg.domain.ChallengeType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
public class ChallengeDTO {
    private String id;
    private String description;
    private int expReward;
    private boolean completed;
    private Date creationDate;
    private Date completionDate;
    private ChallengeType type;
    private int targetValue;
    private int currentValue;
    private double progress;

    public ChallengeDTO(Challenge challenge) {
        this.id = challenge.getId();
        this.description = challenge.getDescription();
        this.expReward = challenge.getExpReward();
        this.completed = challenge.isCompleted();
        this.creationDate = challenge.getCreationDate();
        this.completionDate = challenge.getCompletionDate();
        this.type = challenge.getType();
        this.targetValue = challenge.getTargetValue();
        this.currentValue = challenge.getCurrentValue();
        this.progress = calculateProgress();
    }

    private double calculateProgress() {
        if (targetValue == 0) return 0;
        return Math.min(100, (currentValue * 100.0) / targetValue);
    }
}