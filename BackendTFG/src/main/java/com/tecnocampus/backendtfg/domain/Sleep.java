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
    private Date date;

    //Mirar si se puede hacer con Date
    private Date startTime;
    private Date endTime;

    @Enumerated(EnumType.STRING)
    private TypeQuality quality;

    private String comment;

    @ManyToOne
    private SleepProfile sleepProfile;

    public Sleep(double hours, Date date, Date startTime, Date endTime, TypeQuality quality, String comment, SleepProfile sleepProfile) {
        this.hours = hours;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.quality = quality;
        this.comment = comment;
        this.sleepProfile = sleepProfile;
    }

    public Sleep (SleepDTO sleepDTO, SleepProfile sleepProfile){
        this.hours = sleepDTO.getHours();
        this.date = sleepDTO.getDate();
        this.startTime = sleepDTO.getStartTime();
        this.endTime = sleepDTO.getEndTime();
        this.quality = sleepDTO.getQuality();
        this.comment = sleepDTO.getComment();
        this.sleepProfile = sleepProfile;
    }
}
