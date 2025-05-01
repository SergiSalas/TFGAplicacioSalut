package com.tecnocampus.backendtfg.application.dto;

import com.tecnocampus.backendtfg.domain.Sleep;
import com.tecnocampus.backendtfg.domain.SleepStage;
import com.tecnocampus.backendtfg.domain.TypeQuality;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@NoArgsConstructor
@Getter
@Setter
public class SleepDTO {
    private Date startTime;
    private Date endTime;
    private double hours;
    private int quality;
    private List<SleepStageDTO> sleepStagesDTO;
    private String comment;

    public SleepDTO(Sleep sleep) {
        this.startTime = sleep.getStartTime();
        this.endTime = sleep.getEndTime();
        this.hours = sleep.getHours();
        this.quality = sleep.getQuality();
        this.sleepStagesDTO = sleep.getSleepStages().stream()
                .map(SleepStageDTO::new)
                .toList();
        this.comment = sleep.getComment();
    }

    @Override
    public String toString() {
        return "SleepDTO{" +
                "startTime=" + startTime +
                ", endTime=" + endTime +
                ", hours=" + hours +
                ", quality=" + quality +
                ", sleepStages=" + (sleepStagesDTO != null ? sleepStagesDTO.size() : 0) + " etapas" +
                ", comment='" + comment + '\'' +
                '}';
    }
}
