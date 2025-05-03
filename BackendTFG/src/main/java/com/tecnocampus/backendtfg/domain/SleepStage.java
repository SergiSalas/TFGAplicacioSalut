package com.tecnocampus.backendtfg.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "sleep_stages")
@NoArgsConstructor
@Setter
@Getter
public class SleepStage {

    @Id
    private String id = java.util.UUID.randomUUID().toString();


    @ManyToOne
    @JoinColumn(name = "sleep_id")
    private Sleep sleep;

    private Date startTime;
    private Date endTime;
    private StageType stageType;

    public SleepStage(Date startTime, Date endTime, StageType stageType, Sleep sleep) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.stageType = stageType;
        this.sleep = sleep;
    }
}
