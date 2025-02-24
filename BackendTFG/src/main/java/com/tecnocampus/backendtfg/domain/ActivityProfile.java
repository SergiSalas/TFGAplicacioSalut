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
public class ActivityProfile {

    @Id
    private Long id;

    private double dailyObjectiveDistance;

    //FrecuenciaCardiaca???

    @OneToOne
    private User user;

    @OneToMany
    private List<Activity> activities = new ArrayList<>();

    public ActivityProfile(User user) {
        this.user = user;
    }

    public ActivityProfile(User user, double dailyObjectiveDistance) {
        this.user = user;
        this.dailyObjectiveDistance = dailyObjectiveDistance;
    }
}
