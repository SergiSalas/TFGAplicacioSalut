package com.tecnocampus.backendtfg.domain;

import com.tecnocampus.backendtfg.application.dto.ActivityDTO;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.util.Date;

@Entity
@DiscriminatorValue("HEALTH_CONNECT")
public class HealthConnectActivity extends AbstractActivity {

    public HealthConnectActivity() {
        setOrigin(ActivityOrigin.HEALTH_CONNECT);
    }

    public HealthConnectActivity(double duration, Date date, TypeActivity type, String description, ActivityProfile activityProfile) {
        setDuration(duration);
        setDate(date);
        setType(type);
        setDescription(description);
        setActivityProfile(activityProfile);
        setOrigin(ActivityOrigin.HEALTH_CONNECT);
    }

    public void update (ActivityDTO activityDTO) {
        super.update(activityDTO);
    }
}
