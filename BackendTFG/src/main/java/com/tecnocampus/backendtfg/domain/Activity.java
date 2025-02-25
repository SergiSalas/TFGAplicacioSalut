package com.tecnocampus.backendtfg.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "Activities")
@Getter
@Setter
@NoArgsConstructor
public class Activity {

    @Id
    private String id = java.util.UUID.randomUUID().toString();
    private double duration;
    private Date date;
    private  TypeActivity type;
    private String description;

    //Frequencia cardiaca???

    @ManyToOne
    private ActivityProfile activityProfile;

    public Activity(double duration, Date date, String type, String description, ActivityProfile activityProfile) {
        this.duration = duration;
        this.date = date;
        this.description = description;
        this.activityProfile = activityProfile;
    }
}
