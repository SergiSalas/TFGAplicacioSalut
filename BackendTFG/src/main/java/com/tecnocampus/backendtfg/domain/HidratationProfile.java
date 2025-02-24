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
public class HidratationProfile {

    @Id
    private Long id;
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
