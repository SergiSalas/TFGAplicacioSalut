package com.tecnocampus.backendtfg.domain;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Hidratation {

    @Id
    private Long id;
    private double quantity;
    private String date;

    //Enum?
    private String type;
    private String description;

    @ManyToOne
    private HidratationProfile hidratationProfile;

    public Hidratation(double quantity, String date, String type, String description, String user, HidratationProfile hidratationProfile) {
        this.quantity = quantity;
        this.date = date;
        this.type = type;
        this.description = description;
        this.hidratationProfile = hidratationProfile;
    }
}
