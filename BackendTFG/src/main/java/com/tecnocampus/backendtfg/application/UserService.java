package com.tecnocampus.backendtfg.application;


import com.tecnocampus.backendtfg.application.dto.ActivityTypeDTO;
import com.tecnocampus.backendtfg.application.dto.DataProfileDTO;
import com.tecnocampus.backendtfg.application.dto.GenderTypeDTO;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.Gender;
import com.tecnocampus.backendtfg.domain.TypeActivity;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

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

    public List<GenderTypeDTO> getGenderTypes (){
        return Arrays.stream(Gender.values())
                .map(GenderTypeDTO::new)
                .collect(Collectors.toList());
    }


    private String getEmailFromToken(String token) {
        return jwtUtils.extractEmail(token);
    }

    public UserDTO getDataProfile(String token) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        return new UserDTO(user);
    }
}
