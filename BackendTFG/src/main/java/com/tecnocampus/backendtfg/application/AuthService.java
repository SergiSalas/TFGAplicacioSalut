package com.tecnocampus.backendtfg.application;

import com.tecnocampus.backendtfg.application.dto.JwtDTO;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private UserRepository userRepository;

    private JwtUtils jwtUtils;

    private PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,JwtUtils jwtUtils, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    public JwtDTO registerUser (UserDTO userDTO) {
        if (checkUserExist(userDTO.getEmail())) {
            throw new RuntimeException("User already exists");
        }
        User user = new User(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        userRepository.save(user);
        return new JwtDTO(jwtUtils.generateToken(user.getEmail(), user.getName()), user.getName(), user.getEmail());
    }


    private boolean checkUserExist(String email) {
        return userRepository.existsByEmail(email);
    }




}
