package com.tecnocampus.backendtfg.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "SleepProfiles")
@Getter
@Setter
@NoArgsConstructor
public class SleepProfile {
    @Id
    private String id = java.util.UUID.randomUUID().toString();

    private double dailyObjectiveSleep;

    @OneToOne
    private User user;

    @OneToMany
    private List<Sleep> sleeps = new ArrayList<>();

    public SleepProfile(User user) {
        this.user = user;
    }

    public SleepProfile(User user, double dailyObjectiveSleep) {
        this.user = user;
        this.dailyObjectiveSleep = dailyObjectiveSleep;
    }
}
