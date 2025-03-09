package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.AuthService;
import com.tecnocampus.backendtfg.application.dto.JwtDTO;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
public class AuthRestController {

    private final AuthService authService;

    public AuthRestController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserDTO userDTO) {
        try{
            JwtDTO jwtDTO = authService.registerUser(userDTO);
            return ResponseEntity.ok(jwtDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}
