package com.tecnocampus.backendtfg.application.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JwtDTO {

    private String token;

    private String name;

    private String email;

    public JwtDTO(String token, String name, String email) {
        this.token = token;
        this.name = name;
        this.email = email;
    }
}
