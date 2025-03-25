package com.tecnocampus.backendtfg.application.dto;

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

    public DailyStepsDTO(int steps, Date date) {
        this.steps = steps;
        this.date = date;
    }
}
