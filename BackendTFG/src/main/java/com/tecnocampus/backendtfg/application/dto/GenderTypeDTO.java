package com.tecnocampus.backendtfg.application.dto;

import com.tecnocampus.backendtfg.domain.Gender;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Setter
@Getter
@NoArgsConstructor
public class GenderTypeDTO {

    private String name;

    public GenderTypeDTO (Gender gender) {
        this.name = gender.name();
    }
}
