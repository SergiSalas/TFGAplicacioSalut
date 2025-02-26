package com.tecnocampus.backendtfg.domain;

import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
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

    @Enumerated(EnumType.STRING)
    private  TypeActivity type;
    private String description;

    //Frequencia cardiaca???

    @ManyToOne
    private ActivityProfile activityProfile;

    public Activity(double duration, Date date, TypeActivity type, String description, ActivityProfile activityProfile) {
        this.duration = duration;
        this.type = type;
        this.date = date;
        this.description = description;
        this.activityProfile = activityProfile;
    }

    public Activity (ActivityDTO activityDTO, ActivityProfile activityProfile) {
        this.duration = activityDTO.getDuration();
        this.date = activityDTO.getDate();
        this.type = activityDTO.getType();
        this.description = activityDTO.getDescription();
        this.activityProfile = activityProfile;
    }

    public void update (ActivityDTO activityDTO) {
        this.duration = activityDTO.getDuration();
        this.date = activityDTO.getDate();
        this.type = activityDTO.getType();
        this.description = activityDTO.getDescription();
    }
}
