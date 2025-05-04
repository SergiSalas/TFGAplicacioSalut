package com.tecnocampus.backendtfg.domain;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "userImage", cascade = CascadeType.ALL)
    private User user;

    @Lob
    private byte[] imageData;

    private String imageType;

    private String filename;
}
