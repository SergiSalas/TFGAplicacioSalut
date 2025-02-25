package com.tecnocampus.backendtfg.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class SleepProfile {
    @Id
    private Long id;

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
