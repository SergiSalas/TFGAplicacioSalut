package com.tecnocampus.backendtfg.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class HydrationStatsDTO {
    private int today;
    private int yesterday;
    private int weekAverage;
    private int monthAverage;
    private int objective;
    private int percentageToday;
    private int streak;
}
