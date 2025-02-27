package com.tecnocampus.backendtfg.application.dto;

import com.tecnocampus.backendtfg.domain.Activity;
import com.tecnocampus.backendtfg.domain.TypeActivity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@NoArgsConstructor
@Getter
@Setter
public class ActivityDTO {
    private double duration;
    private Date date;
    private TypeActivity type;
    private String description;

    public ActivityDTO(double duration, Date date, TypeActivity type, String description) {
        this.duration = duration;
        this.date = date;
        this.type = type;
        this.description = description;
    }

    public ActivityDTO(Activity activity) {
        this.duration = activity.getDuration();
        this.date = activity.getDate();
        this.type = activity.getType();
        this.description = activity.getDescription();
    }
}
