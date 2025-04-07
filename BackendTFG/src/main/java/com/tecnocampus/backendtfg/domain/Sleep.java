package com.tecnocampus.backendtfg.domain;


import com.tecnocampus.backendtfg.application.dto.SleepDTO;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "Sleeps")
@Getter
@Setter
@NoArgsConstructor
public class Sleep {

    @Id
    private String id = java.util.UUID.randomUUID().toString();
    private double hours;

    //Mirar si se puede hacer con Date
    private Date startTime;
    private Date endTime;

    private int quality;

    private int remSleep;
    private String comment;


    @ManyToOne
    private SleepProfile sleepProfile;

    public Sleep(double hours, Date startTime, Date endTime, int quality, int remSleep, String comment, SleepProfile sleepProfile) {
        this.hours = hours;
        this.startTime = startTime;
        this.endTime = endTime;
        this.quality = quality;
        this.remSleep = remSleep;
        this.comment = comment;
        this.sleepProfile = sleepProfile;
    }

    public Sleep (SleepDTO sleepDTO, SleepProfile sleepProfile){
        this.hours = sleepDTO.getHours();
        this.startTime = sleepDTO.getStartTime();
        this.endTime = sleepDTO.getEndTime();
        this.quality = sleepDTO.getQuality();
        this.remSleep = sleepDTO.getRemSleep();
        this.comment = sleepDTO.getComment();
        this.sleepProfile = sleepProfile;
    }

    public void update(SleepDTO sleepDTO) {
        this.hours = sleepDTO.getHours();
        this.startTime = sleepDTO.getStartTime();
        this.endTime = sleepDTO.getEndTime();
        this.quality = sleepDTO.getQuality();
        this.remSleep = sleepDTO.getRemSleep();
        this.comment = sleepDTO.getComment();
    }
}
