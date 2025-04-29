package com.tecnocampus.backendtfg.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class HydrationTrendDTO {
    private List<String> labels;
    private List<Integer> values;
    private int average;
    private int max;
    private int min;
    private int objective;
}