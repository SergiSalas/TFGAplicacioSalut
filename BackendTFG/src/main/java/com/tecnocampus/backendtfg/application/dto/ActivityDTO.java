
package com.tecnocampus.backendtfg.application.dto;

import com.tecnocampus.backendtfg.domain.AbstractActivity;
import com.tecnocampus.backendtfg.domain.ActivityOrigin;
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
    private ActivityOrigin origin;

    public ActivityDTO(double duration, Date date, TypeActivity type, String description, ActivityOrigin origin) {
        this.duration = duration;
        this.date = date;
        this.type = type;
        this.description = description;
        this.origin = origin;
    }


    public ActivityDTO(AbstractActivity abstractActivity) {
        this.duration = abstractActivity.getDuration();
        this.date = abstractActivity.getDate();
        this.origin = abstractActivity.getOrigin();
        this.type = abstractActivity.getType();
        this.description = abstractActivity.getDescription();
    }
}
