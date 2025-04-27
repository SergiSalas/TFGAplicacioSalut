package com.tecnocampus.backendtfg.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HydrationStatusDTO {
    private double dailyTarget;
    private double currentAmount;
    private Date lastUpdate;
}