package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.UserService;
import com.tecnocampus.backendtfg.application.dto.DataProfileDTO;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.domain.UserImage;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RequestMapping("/user")
@RestController
public class UserRestController {

    private final UserService userService;

    public UserRestController(UserService userService) {
        this.userService = userService;
    }

    /*
    @PostMapping("/createUser")
    public ResponseEntity<String> createUser(@RequestBody UserDTO userDTO) {
        userService.createUser(userDTO);
        return ResponseEntity.ok("User created");
    }
    @DeleteMapping("/deleteUser")
    public ResponseEntity<String> deleteUser(@RequestBody UserDTO userDTO) {
        userService.deleteUser(userDTO);
        return ResponseEntity.ok("User deleted");
    }
    @PutMapping("/updateUser")
    public ResponseEntity<String> updateUser(@RequestBody UserDTO userDTO) {
        userService.updateUser(userDTO);
        return ResponseEntity.ok("User updated");
    }
    */

    @PostMapping("/setDataProfile")
    public ResponseEntity<String> setDataProfile(HttpServletRequest request, @RequestBody DataProfileDTO dataProfileDTO) {
        String token = getTokenAuthFromRequest(request);
        userService.setDataProfile(token,dataProfileDTO);
        return ResponseEntity.ok("Data profile updated");
    }

    @GetMapping("/getDataProfile")
    public ResponseEntity<UserDTO> getDataProfile(HttpServletRequest request) {
        String token = getTokenAuthFromRequest(request);
        UserDTO userDTO = userService.getDataProfile(token);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/getGenderData")
    public ResponseEntity<?> getGeneralData() {
        return ResponseEntity.ok(userService.getGenderTypes());
    }

    @PostMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfileImage(HttpServletRequest request,
                                                @RequestParam("image") MultipartFile file) {
        try {
            String token = getTokenAuthFromRequest(request);
            userService.saveUserProfileImage(token, file);
            return ResponseEntity.ok().body("Imagen de perfil guardada con éxito");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar la imagen: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar la imagen: " + e.getMessage());
        }
    }

    @GetMapping("/profile-image")
    public ResponseEntity<?> getProfileImage(HttpServletRequest request) {
        try {
            String token = getTokenAuthFromRequest(request);
            Map<String, String> imageData = userService.getUserProfileImageAsBase64(token);
            return ResponseEntity.ok(imageData);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener la imagen: " + e.getMessage());
        }
    }

    private String getTokenAuthFromRequest(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }

}
