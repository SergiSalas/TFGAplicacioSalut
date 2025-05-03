package com.tecnocampus.backendtfg.application.dto;

import com.tecnocampus.backendtfg.domain.SleepStage;
import com.tecnocampus.backendtfg.domain.StageType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SleepStageDTO {
    private Date startTime;
    private Date endTime;
    private StageType stageType;

    public SleepStageDTO(SleepStage sleepStage) {
        this.startTime = sleepStage.getStartTime();
        this.endTime = sleepStage.getEndTime();
        this.stageType = sleepStage.getStageType();
    }
}
