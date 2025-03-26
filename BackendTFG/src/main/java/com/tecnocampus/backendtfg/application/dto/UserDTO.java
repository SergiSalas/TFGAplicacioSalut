package com.tecnocampus.backendtfg.application.dto;


import com.tecnocampus.backendtfg.domain.Gender;
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
    private int height;
    private int age;
    private Gender gender;



    public UserDTO() {
    }

    public UserDTO(String name, String surname, String email, String password, Double weight, int height,Gender gender) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.password = password;
        this.weight = weight;
        this.height = height;
        this.gender = gender;
    }

    public UserDTO(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public UserDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }

}
