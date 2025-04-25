package com.tecnocampus.backendtfg.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Level {
    @Id
    private String id = java.util.UUID.randomUUID().toString();
    private int currentLevel = 1;
    private int currentExp = 0;
    private int expToNextLevel = 100;

    public void addExperience(int exp) {
        this.currentExp += exp;
        while (this.currentExp >= this.expToNextLevel) {
            this.currentExp -= this.expToNextLevel;
            this.currentLevel++;
            this.expToNextLevel = 100 + (currentLevel - 1) * 50;
        }
    }
}