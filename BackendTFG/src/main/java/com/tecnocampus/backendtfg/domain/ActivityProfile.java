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

    @OneToOne
    private User user;

    @OneToMany(mappedBy = "activityProfile", cascade = CascadeType.ALL)
    private List<DailySteps> dailySteps = new ArrayList<>();

    @OneToMany(mappedBy = "activityProfile", cascade = CascadeType.ALL)
    private List<AbstractActivity> activities = new ArrayList<>();

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

    public void addActivity(AbstractActivity activity) {
        activities.add(activity);
        activity.setActivityProfile(this);
    }

    public void addDailySteps(DailySteps dailySteps) {
        this.dailySteps.add(dailySteps);
        dailySteps.setActivityProfile(this);
    }
}
