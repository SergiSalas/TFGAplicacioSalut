package com.tecnocampus.backendtfg.domain;


import com.tecnocampus.backendtfg.application.dto.DailyStepsDTO;
import com.tecnocampus.backendtfg.component.CalorieCalculator;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "DailySteps")
@Getter
@Setter
@NoArgsConstructor
public class DailySteps {

    @Id
    private String id = java.util.UUID.randomUUID().toString();

    private int steps;

    private Date date;

    private int duration;

    private double caloriesBurned;

    @ManyToOne
    private ActivityProfile activityProfile;

    public DailySteps(int steps, Date date,int duration, ActivityProfile activityProfile) {
        this.steps = steps;
        this.date = date;
        this.duration = duration;
        this.activityProfile = activityProfile;
    }

    public DailySteps (DailyStepsDTO dailySteps) {
        this.steps = dailySteps.getSteps();
        this.date = dailySteps.getDate();
        this.duration = dailySteps.getDuration();
    }

    public void calculateCalories() {
        if (this.activityProfile != null && this.activityProfile.getUser() != null) {
            User user = this.activityProfile.getUser();
            this.caloriesBurned = CalorieCalculator.calculateCaloriesBurned(
                    user, TypeActivity.WALKING, this.duration);
        }
    }
}
