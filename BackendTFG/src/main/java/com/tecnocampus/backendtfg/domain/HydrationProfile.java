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
}