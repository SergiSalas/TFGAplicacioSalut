package com.tecnocampus.backendtfg.application.dto;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private String name;
    private String surname;
    private String email;
    private String password;
    private Double weight;
    private Double height;

    public UserDTO() {
    }

    public UserDTO(String name, String surname, String email, String password, Double weight, Double height) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.password = password;
        this.weight = weight;
        this.height = height;
    }

    public UserDTO(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

}
