package com.tecnocampus.backendtfg.application.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SleepStatsDTO {
    private double averageSleepDuration;
    private double averageQuality;
    private int averageREM;
    private int averageDEEP;
    private int averageLIGHT;
    private int averageAWAKE;
    private String bestSleepDay;
    private String worstSleepDay;
    private String averageBedtime;
    private String averageWakeTime;
}
