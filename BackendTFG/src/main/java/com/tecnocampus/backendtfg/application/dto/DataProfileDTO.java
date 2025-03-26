package com.tecnocampus.backendtfg.application.dto;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DataProfileDTO {

    private int height;

    private double weight;

    private int age;

    public DataProfileDTO(int height, double weight, int age) {
        this.height = height;
        this.weight = weight;
        this.age = age;
    }
}
