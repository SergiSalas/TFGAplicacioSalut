package com.tecnocampus.backendtfg.domain;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Hidratations")
@Getter
@Setter
@NoArgsConstructor
public class Hidratation {

    @Id
    private String id = java.util.UUID.randomUUID().toString();
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
