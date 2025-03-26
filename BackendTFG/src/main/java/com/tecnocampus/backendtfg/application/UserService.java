package com.tecnocampus.backendtfg.application;


import com.tecnocampus.backendtfg.application.dto.DataProfileDTO;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }
    /*
    public void createUser(UserDTO userDTO) {
        User user = new User(userDTO);
        userRepository.save(user);
    }

    public void deleteUser(UserDTO userDTO) {
        String email = userDTO.getEmail();
        User user = userRepository.findByEmail(email);
        userRepository.delete(user);
    }

    public void updateUser(UserDTO userDTO) {
        String email = userDTO.getEmail();
        User user = userRepository.findByEmail(email);
        user.update(userDTO);
        userRepository.save(user);
    }
    */

    public void setDataProfile(String token, DataProfileDTO dataProfileDTO) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        user.setDataProfile(dataProfileDTO);
        userRepository.save(user);

    }


    private String getEmailFromToken(String token) {
        return jwtUtils.extractEmail(token);
    }
}
