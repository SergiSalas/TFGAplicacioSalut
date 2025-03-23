package com.tecnocampus.backendtfg.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "ActivityProfiles")
@Getter
@Setter
@NoArgsConstructor
public class ActivityProfile {

    @Id
    private String id = java.util.UUID.randomUUID().toString();

    private int dailyObjectiveDistance;

    //FrecuenciaCardiaca???

    @OneToOne
    private User user;

    @OneToMany(mappedBy = "activityProfile", cascade = CascadeType.ALL)
    private List<Activity> activities = new ArrayList<>();

    public ActivityProfile(User user) {
        this.user = user;
    }

    public ActivityProfile(User user, int dailyObjectiveDistance) {
        this.user = user;
        this.dailyObjectiveDistance = dailyObjectiveDistance;
    }

    public void addObjective(int dailyObjectiveDistance) {
        this.dailyObjectiveDistance = dailyObjectiveDistance;
    }
}
