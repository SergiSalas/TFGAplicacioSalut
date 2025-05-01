package com.tecnocampus.backendtfg.domain;


import com.tecnocampus.backendtfg.application.dto.SleepDTO;
import com.tecnocampus.backendtfg.application.dto.SleepStageDTO;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "Sleeps")
@Getter
@Setter
@NoArgsConstructor
public class Sleep {

    @Id
    private String id = java.util.UUID.randomUUID().toString();
    private double hours;

    private Date startTime;
    private Date endTime;

    private int quality;

    @OneToMany(mappedBy = "sleep", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SleepStage> sleepStages = new ArrayList<>();

    private String comment;

    @ManyToOne
    private SleepProfile sleepProfile;

    public Sleep(double hours, Date startTime, Date endTime, int quality, String comment, List<SleepStage> sleepStages, SleepProfile sleepProfile) {
        this.hours = hours;
        this.startTime = startTime;
        this.endTime = endTime;
        this.quality = quality;
        this.sleepStages = sleepStages;
        this.comment = comment;
        this.sleepProfile = sleepProfile;
    }

    public Sleep(SleepDTO sleepDTO, SleepProfile sleepProfile){
        this.hours = sleepDTO.getHours();
        this.startTime = sleepDTO.getStartTime();
        this.endTime = sleepDTO.getEndTime();
        this.quality = sleepDTO.getQuality();
        getSleepStages(sleepDTO.getSleepStagesDTO());
        this.comment = sleepDTO.getComment();
        this.sleepProfile = sleepProfile;
    }

    public void update(SleepDTO sleepDTO) {
        this.hours = sleepDTO.getHours();
        this.startTime = sleepDTO.getStartTime();
        this.endTime = sleepDTO.getEndTime();
        this.quality = sleepDTO.getQuality();
        getSleepStages(sleepDTO.getSleepStagesDTO());
        this.comment = sleepDTO.getComment();
    }

    private void getSleepStages(List<SleepStageDTO> sleepStagesDTO) {
        for (SleepStageDTO sleepStageDTO : sleepStagesDTO) {
            SleepStage sleepStage = new SleepStage(sleepStageDTO.getStartTime(),
                    sleepStageDTO.getEndTime(), sleepStageDTO.getStageType(), this);
            this.sleepStages.add(sleepStage);
        }
    }

    public int getRemSleepMinutes() {
        return sleepStages.stream()
                .filter(stage -> stage.getStageType() == StageType.REM)
                .mapToInt(stage -> {
                    long durationMillis = stage.getEndTime().getTime() - stage.getStartTime().getTime();
                    return (int) (durationMillis / (60 * 1000)); // Convertir a minutos
                })
                .sum();
    }
}
