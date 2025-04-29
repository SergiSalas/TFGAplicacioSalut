package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.AuthService;
import com.tecnocampus.backendtfg.application.dto.JwtDTO;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserDTO userDTO) {
        try{
            JwtDTO jwtDTO = authService.loginUser(userDTO);
            return ResponseEntity.ok(jwtDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verifyToken")
    public ResponseEntity<?> verifyToken(HttpServletRequest request) {
        try{
            System.out.println("Estoy en verifyToken");
            String token = request.getHeader("Authorization");
            System.out.println("Token en verifyToken: " + token);
            boolean result = authService.verifyToken(token);
            System.out.println("Token en verifyToken: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/user")
    public ResponseEntity<?> deleteUser(HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");
            boolean result = authService.deleteUser(token);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");
            boolean result = authService.logout(token);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
