package com.tecnocampus.backendtfg.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Challenge {
    @Id
    private String id = java.util.UUID.randomUUID().toString();
    private String description;
    private int expReward;
    private boolean completed = false;
    private Date creationDate;
    private Date completionDate;

    @Enumerated(EnumType.STRING)
    private ChallengeType type;

    private int targetValue;  // valor objetivo (pasos, minutos, etc.)
    private int currentValue; // valor actual

    @ManyToOne
    private User user;

    public Challenge(String description, int expReward, ChallengeType type, int targetValue, User user) {
        this.description = description;
        this.expReward = expReward;
        this.type = type;
        this.targetValue = targetValue;
        this.currentValue = 0;
        this.user = user;
        this.creationDate = new Date();
    }

    public boolean updateProgress(int value) {
        this.currentValue += value;
        if (this.currentValue >= this.targetValue && !this.completed) {
            this.completed = true;
            this.completionDate = new Date();
            return true; // Reto completado
        }
        return false; // Reto aún no completado
    }
}