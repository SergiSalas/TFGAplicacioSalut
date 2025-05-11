package com.tecnocampus.backendtfg.application.dto;


import com.tecnocampus.backendtfg.domain.Gender;
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

    private Gender gender;

    public DataProfileDTO(int height, double weight, int age, Gender gender) {
        this.height = height;
        this.weight = weight;
        this.age = age;
        this.gender = gender;
    }
}
