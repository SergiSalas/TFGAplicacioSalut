package com.tecnocampus.backendtfg.application.dto;


import com.tecnocampus.backendtfg.domain.TypeActivity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ActivityTypeDTO {

    private String name;

    public ActivityTypeDTO(TypeActivity typeActivity) {
        this.name = typeActivity.name();
    }
}
