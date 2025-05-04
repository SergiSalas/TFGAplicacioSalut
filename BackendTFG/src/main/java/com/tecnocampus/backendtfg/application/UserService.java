package com.tecnocampus.backendtfg.application;


import com.tecnocampus.backendtfg.application.dto.ActivityTypeDTO;
import com.tecnocampus.backendtfg.application.dto.DataProfileDTO;
import com.tecnocampus.backendtfg.application.dto.GenderTypeDTO;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.Gender;
import com.tecnocampus.backendtfg.domain.TypeActivity;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.domain.UserImage;
import com.tecnocampus.backendtfg.persistence.UserImageRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final UserImageRepository userImageRepository;

    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository,UserImageRepository userImageRepository
            ,JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.userImageRepository = userImageRepository;
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

    public UserDTO getDataProfile(String token) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        return new UserDTO(user);
    }


    public void saveUserProfileImage(String token, MultipartFile file) throws IOException {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        UserImage userImage = userImageRepository.findByUser(user).orElse(null);
        if (userImage == null) {
            userImage = new UserImage();
            userImage.setUser(user);
            user.setUserImage(userImage);
        } else {
            // Liberar explícitamente los datos de la imagen anterior
            userImage.setImageData(null);
            userImage.setImageType(null);
            userImage.setFilename(null);
            // Realizar un guardado intermedio para liberar memoria
            userImageRepository.save(userImage);
        }

        // Guardar la nueva imagen
        userImage.setImageData(file.getBytes());
        userImage.setImageType(file.getContentType());
        userImage.setFilename(file.getOriginalFilename());

        userImageRepository.save(userImage);
    }

    public Map<String, String> getUserProfileImageAsBase64(String token) {
        String email = getEmailFromToken(token);
        User user = userRepository.findByEmail(email);

        UserImage userImage = userImageRepository.findByUser(user).orElse(null);

        if (userImage == null || userImage.getImageData() == null) {
            throw new IllegalArgumentException("No se encontró la imagen del usuario");
        }

        // Convertir datos binarios a base64
        String base64Image = Base64.getEncoder().encodeToString(userImage.getImageData());

        // Crear mapa con la información de la imagen
        Map<String, String> imageData = new HashMap<>();
        imageData.put("imageType", userImage.getImageType());
        imageData.put("imageData", base64Image);
        imageData.put("filename", userImage.getFilename());

        return imageData;
    }

    private String getEmailFromToken(String token) {
        return jwtUtils.extractEmail(token);
    }

}
