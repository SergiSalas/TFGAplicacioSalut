package com.tecnocampus.backendtfg.domain;

import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "activity_origin", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
public abstract class AbstractActivity {

    @Id
    private String id = java.util.UUID.randomUUID().toString();

    private double duration;
    private Date date;

    @Enumerated(EnumType.STRING)
    private TypeActivity type;
    private String description;

    @Enumerated(EnumType.STRING)
    private ActivityOrigin origin;

    @ManyToOne
    private ActivityProfile activityProfile;

    protected void update(ActivityDTO activityDTO) {
        this.duration = activityDTO.getDuration();
        this.date = activityDTO.getDate();
        this.type = activityDTO.getType();
        this.description = activityDTO.getDescription();
    }
}