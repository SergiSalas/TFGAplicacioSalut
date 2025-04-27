package com.tecnocampus.backendtfg.domain;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "Hidratations")
@Getter
@Setter
@NoArgsConstructor
public class Hydration {

    @Id
    private String id = java.util.UUID.randomUUID().toString();
    private double quantity;
    private Date date;

    @ManyToOne
    private HydrationProfile hydrationProfile;

    public Hydration(double quantity, Date date, HydrationProfile hydrationProfile) {
        this.quantity = quantity;
        this.date = date;
        this.hydrationProfile = hydrationProfile;
    }
}
