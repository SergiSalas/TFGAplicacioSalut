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

    private final UserRepository userRepository;

    private final JwtUtils jwtUtils;

    private final PasswordEncoder passwordEncoder;

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
        JwtDTO jwtDTO = new JwtDTO(jwtUtils.generateToken(user.getEmail(), user.getName()), user.getName(), user.getEmail());
        System.out.println(jwtDTO);
        return jwtDTO;
    }

    public JwtDTO loginUser(UserDTO userDTO) {
        if (!checkUserExist(userDTO.getEmail())) {
            throw new RuntimeException("User does not exist");
        }
        User user = userRepository.findByEmail(userDTO.getEmail());
        if (user == null || !passwordEncoder.matches(userDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        JwtDTO jwtDTO = new JwtDTO(jwtUtils.generateToken(user.getEmail(), user.getName()), user.getName(), user.getEmail());
        System.out.println(jwtDTO);
        return jwtDTO;
    }

    public boolean verifyToken(String token) {
        try {
            String email = jwtUtils.extractEmail(token);
            System.out.println("Token en verifyToken: " + email);
            // Check if the user is registered
            if (!userRepository.existsByEmail(email)) {
                System.out.println("User does not exist");
                return false;
            }
            // validateToken should throw an exception if token has expired or is invalid
            jwtUtils.validateToken(token);
            return true;
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteUser(String token) {
        try {
            String email = jwtUtils.extractEmail(token);
            if (!userRepository.existsByEmail(email)) {
                throw new RuntimeException("Usuario no existe");
            }
            User user = userRepository.findByEmail(email);
            userRepository.delete(user);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar usuario: " + e.getMessage());
        }
    }

    public boolean logout(String token) {
        try {
            String email = jwtUtils.extractEmail(token);
            if (!userRepository.existsByEmail(email)) {
                throw new RuntimeException("Usuario no existe");
            }
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Error en logout: " + e.getMessage());
        }
    }


    private boolean checkUserExist(String email) {
        return userRepository.existsByEmail(email);
    }




}
