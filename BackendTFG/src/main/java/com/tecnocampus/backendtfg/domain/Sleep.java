package com.tecnocampus.backendtfg.domain;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Sleep {

    @Id
    private Long id;
    private double hours;
    private Date date;

    //Mirar si se puede hacer con Date
    private String startTime;
    private String endTime;

    //Enum?
    private String quality;

    private String comment;

    @ManyToOne
    private SleepProfile sleepProfile;

    public Sleep(double hours, Date date, String startTime, String endTime, String quality, String comment, SleepProfile sleepProfile) {
        this.hours = hours;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.quality = quality;
        this.comment = comment;
        this.sleepProfile = sleepProfile;
    }
}
