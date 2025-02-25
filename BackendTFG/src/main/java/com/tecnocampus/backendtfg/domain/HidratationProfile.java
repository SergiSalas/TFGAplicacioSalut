package com.tecnocampus.backendtfg.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "HidratationProfiles")
@Getter
@Setter
@NoArgsConstructor
public class HidratationProfile {

    @Id
    private String id = java.util.UUID.randomUUID().toString();
    private double dailyObjectiveWater;

    @OneToOne
    private User user;

    @OneToMany
    private List<Hidratation> hidratations = new ArrayList<>();

    public HidratationProfile(User user) {
        this.user = user;
    }

    public HidratationProfile(User user, double dailyObjectiveWater) {
        this.user = user;
        this.dailyObjectiveWater = dailyObjectiveWater;
    }
}
