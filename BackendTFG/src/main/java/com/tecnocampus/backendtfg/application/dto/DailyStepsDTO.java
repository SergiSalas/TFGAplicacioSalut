package com.tecnocampus.backendtfg.application.dto;

import com.tecnocampus.backendtfg.domain.ActivityOrigin;
import com.tecnocampus.backendtfg.domain.TypeActivity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;


@NoArgsConstructor
@Getter
@Setter
public class DailyStepsDTO {

    private int steps;
    private Date date;
    private int duration;

    public DailyStepsDTO(int steps, Date date, int duration) {
        this.steps = steps;
        this.date = date;
    }
}
