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
    private double hours;
    private Date date;
    private Date startTime;
    private Date endTime;
    private TypeQuality quality;
    private String comment;

    public SleepDTO(double hours, Date date, Date startTime, Date endTime, TypeQuality quality, String comment) {
        this.hours = hours;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.quality = quality;
        this.comment = comment;
    }

    public SleepDTO (Sleep sleep) {
        this.hours = sleep.getHours();
        this.date = sleep.getDate();
        this.startTime = sleep.getStartTime();
        this.endTime = sleep.getEndTime();
        this.quality = sleep.getQuality();
        this.comment = sleep.getComment();
    }
}
