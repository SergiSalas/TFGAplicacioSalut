package com.tecnocampus.backendtfg.domain;

import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.util.Date;

@Entity
@DiscriminatorValue("APP")
public class AppActivity extends AbstractActivity {

    public AppActivity() {
        setOrigin(ActivityOrigin.APP);
    }

    public AppActivity(double duration, Date date, TypeActivity type, String description, ActivityProfile activityProfile) {
        setDuration(duration);
        setDate(date);
        setType(type);
        setDescription(description);
        setActivityProfile(activityProfile);
        setOrigin(ActivityOrigin.APP);
    }

    public void update (ActivityDTO activityDTO) {
        super.update(activityDTO);
    }
}
