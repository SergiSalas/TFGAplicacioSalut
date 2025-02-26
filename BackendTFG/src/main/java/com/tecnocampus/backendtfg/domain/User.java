package com.tecnocampus.backendtfg.domain;

import com.tecnocampus.backendtfg.application.dto.UserDTO;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    private String id = java.util.UUID.randomUUID().toString();
    private String name;
    private String email;
    private String password;
    private Double weight;
    private Double height;

    @OneToOne(cascade = CascadeType.ALL)
    private ActivityProfile activityProfile;

    @OneToOne(cascade = CascadeType.ALL)
    private SleepProfile sleepProfile;

    @OneToOne(cascade = CascadeType.ALL)
    private HidratationProfile hidratationProfile;

    //ConfigurationClass?
    //private Configuration configuration;

    //Rewards class?
    //private Rewards rewards;

    public User(String name, String email, String password, Double weight, Double height) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.weight = weight;
        this.height = height;
        this.activityProfile = new ActivityProfile(this);
        this.sleepProfile = new SleepProfile(this);
        this.hidratationProfile = new HidratationProfile(this);
    }

    public User(String name,String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.activityProfile = new ActivityProfile(this);
        this.sleepProfile = new SleepProfile(this);
        this.hidratationProfile = new HidratationProfile(this);
    }

    public User(UserDTO userDTO) {
        this.name = userDTO.getName();
        this.email = userDTO.getEmail();
        this.password = userDTO.getPassword();
        this.weight = userDTO.getWeight();
        this.height = userDTO.getHeight();
        this.activityProfile = new ActivityProfile(this);
        this.sleepProfile = new SleepProfile(this);
        this.hidratationProfile = new HidratationProfile(this);
    }

    public void update(UserDTO userDTO) {
        this.name = userDTO.getName();
        this.email = userDTO.getEmail();
        this.password = userDTO.getPassword();
        this.weight = userDTO.getWeight();
        this.height = userDTO.getHeight();
    }
}