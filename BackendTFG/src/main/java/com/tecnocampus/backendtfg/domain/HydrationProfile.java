package com.tecnocampus.backendtfg.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "HidratationProfiles")
@Getter
@Setter
@NoArgsConstructor
public class HydrationProfile {

    @Id
    private String id = java.util.UUID.randomUUID().toString();
    private double dailyObjectiveWater;
    private double currentAmount;
    private Date lastUpdate;

    @OneToOne
    private User user;

    @OneToMany(mappedBy = "hydrationProfile", cascade = CascadeType.ALL)
    private List<Hydration> hydrations = new ArrayList<>();

    public HydrationProfile(User user) {
        this.user = user;
        this.lastUpdate = new Date();
        this.currentAmount = 0;
        this.calculateDailyObjectiveWater();

    }

    public void addHydration(Hydration hydration) {
        this.hydrations.add(hydration);
        hydration.setHydrationProfile(this);
        this.currentAmount += hydration.getQuantity();
        this.lastUpdate = new Date();
    }

    public void resetDailyAmount() {
        this.currentAmount = 0;
        this.lastUpdate = new Date();
    }

    private void calculateDailyObjectiveWater() {
        if (user.getWeight() != null) {
            double baseAmount = user.getWeight() * 0.033;
            if (user.getAge() > 30) baseAmount *= 1.1;
            if (user.getGender() == Gender.MALE) baseAmount *= 1.1;
            this.dailyObjectiveWater = Math.round(baseAmount * 100) / 100.0;
        } else {
            this.dailyObjectiveWater = 2.5;
        }
    }
}