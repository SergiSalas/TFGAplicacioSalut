package com.tecnocampus.backendtfg.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SleepStageTrendDTO {
    private List<String> labels;
    private List<SleepStageDataSetDTO> datasets;
    private String unit;
}
