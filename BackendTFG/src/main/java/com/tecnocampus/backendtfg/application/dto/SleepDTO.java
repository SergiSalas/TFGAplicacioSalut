package com.tecnocampus.backendtfg.application.dto;

import com.tecnocampus.backendtfg.domain.Sleep;
import com.tecnocampus.backendtfg.domain.TypeQuality;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@NoArgsConstructor
@Getter
@Setter
public class SleepDTO {
    private Date startTime;
    private Date endTime;
    private double hours;
    private int quality;
    private int remSleep;
    private String comment;

    public SleepDTO(Sleep sleep) {
        this.startTime = sleep.getStartTime();
        this.endTime = sleep.getEndTime();
        this.hours = sleep.getHours();
        this.quality = sleep.getQuality();
        this.remSleep = sleep.getRemSleep();
        this.comment = sleep.getComment();
    }

    public SleepDTO(Date startTime, Date endTime, double hours, int quality, int remSleep) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.hours = hours;
        this.quality = quality;
        this.remSleep = remSleep;
    }

    public SleepDTO(Date startTime, Date endTime, double hours, int quality, int remSleep, String comment) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.hours = hours;
        this.quality = quality;
        this.remSleep = remSleep;
        this.comment = comment;
    }






}
