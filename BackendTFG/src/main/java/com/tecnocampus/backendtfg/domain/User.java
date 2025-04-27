package com.tecnocampus.backendtfg.domain;

import com.tecnocampus.backendtfg.application.dto.DataProfileDTO;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User implements UserDetails {

    @Id
    private String id = java.util.UUID.randomUUID().toString();
    private String name;
    private String email;
    private String password;
    private Double weight;
    private int height;
    private int age;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @OneToOne(cascade = CascadeType.ALL)
    private ActivityProfile activityProfile;

    @OneToOne(cascade = CascadeType.ALL)
    private SleepProfile sleepProfile;

    @OneToOne(cascade = CascadeType.ALL)
    private HydrationProfile hydrationProfile;

    //ConfigurationClass?
    //private Configuration configuration;

    @OneToOne(cascade = CascadeType.ALL)
    private Level level = new Level();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Challenge> challenges = new ArrayList<>();


    public User(String name, String email, String password, Double weight, int height, int age, Gender gender) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.weight = weight;
        this.height = height;
        this.age = age;
        this.gender = gender;
        this.activityProfile = new ActivityProfile(this);
        this.sleepProfile = new SleepProfile(this);
        this.hydrationProfile = new HydrationProfile(this);
    }

    public User(String name,String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.activityProfile = new ActivityProfile(this);
        this.sleepProfile = new SleepProfile(this);
        this.hydrationProfile = new HydrationProfile(this);
    }

    public User(UserDTO userDTO) {
        this.name = userDTO.getName();
        this.email = userDTO.getEmail();
        this.password = userDTO.getPassword();
        this.weight = userDTO.getWeight();
        this.height = userDTO.getHeight();
        this.age = userDTO.getAge();
        this.activityProfile = new ActivityProfile(this);
        this.sleepProfile = new SleepProfile(this);
        this.hydrationProfile = new HydrationProfile(this);
    }

    public void update(UserDTO userDTO) {
        this.name = userDTO.getName();
        this.email = userDTO.getEmail();
        this.password = userDTO.getPassword();
        this.weight = userDTO.getWeight();
        this.height = userDTO.getHeight();
    }

    public void setDataProfile(DataProfileDTO dataProfileDTO) {
        this.weight = dataProfileDTO.getWeight();
        this.height = dataProfileDTO.getHeight();
        this.age = dataProfileDTO.getAge();
    }

    public void addChallenge(Challenge challenge) {
        this.challenges.add(challenge);
        challenge.setUser(this);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Aquí puedes asignar roles dinámicamente.
        // Por defecto, asignamos el rol "ROLE_USER".
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getUsername() {
        // Usamos el email como nombre de usuario
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        // Puedes implementar la lógica de expiración de cuenta
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Aquí podrías validar si la cuenta está bloqueada
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // Valida si las credenciales (contraseña) están expiradas
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Aquí puedes indicar si el usuario está activo
        return true;
    }
}