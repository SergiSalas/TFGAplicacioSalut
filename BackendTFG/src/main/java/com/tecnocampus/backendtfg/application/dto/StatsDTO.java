package com.tecnocampus.backendtfg.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatsDTO {
    private int averageSteps;
    private String trend;
    private String bestDay;
    private int totalActivities;
    private int totalDuration;
    private int caloriesBurned;
}
