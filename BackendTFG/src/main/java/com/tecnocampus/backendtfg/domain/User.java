package com.tecnocampus.backendtfg.domain;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    private String id;
    private String name;
    private String surname;
    private String email;
    private String password;
    private Double weight;
    private Double height;

    @OneToOne
    private ActivityProfile activityProfile;

    @OneToOne
    private SleepProfile sleepProfile;

    @OneToOne
    private HidratationProfile hidratationProfile;

    //ConfigurationClass?
    //private Configuration configuration;

    //Rewards class?
    //private Rewards rewards;


    public User(String name, String surname, String email, String password, Double weight, Double height) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.password = password;
        this.weight = weight;
        this.height = height;
        this.activityProfile = new ActivityProfile();
        this.sleepProfile = new SleepProfile();
        this.hidratationProfile = new HidratationProfile();
    }

    public User(String name, String surname, String email, String password) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.password = password;
        this.activityProfile = new ActivityProfile();
        this.sleepProfile = new SleepProfile();
        this.hidratationProfile = new HidratationProfile();
    }


}
