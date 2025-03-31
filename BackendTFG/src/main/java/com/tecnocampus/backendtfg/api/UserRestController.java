package com.tecnocampus.backendtfg.api;

import com.tecnocampus.backendtfg.application.UserService;
import com.tecnocampus.backendtfg.application.dto.DataProfileDTO;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import com.tecnocampus.backendtfg.domain.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    private String getTokenAuthFromRequest(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }

}
