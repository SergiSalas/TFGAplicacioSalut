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
public class TrendsDTO {
    private List<String> labels;
    private List<Integer> values;
    private String unit;
}
