package com.tecnocampus.backendtfg;

import com.tecnocampus.backendtfg.application.UserService;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class UserTests {
    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;
/*
    @Test
    void testCreateUser() {
        UserDTO userDTO = new UserDTO();
        userDTO.setName("testuser");
        userDTO.setPassword("password");

        System.out.println("UserDTO created: " + userDTO);

        User user = new User(userDTO);

        System.out.println("User created from UserDTO: " + user);

        Mockito.when(userRepository.save(Mockito.any(User.class))).thenReturn(user);

        System.out.println("Mock setup for userRepository.save");

        userService.createUser(userDTO);

        System.out.println("UserService.createUser called with UserDTO");

        Mockito.verify(userRepository, Mockito.times(1)).save(Mockito.any(User.class));

        System.out.println("Verified userRepository.save was called once");
    }

    @Test
    void testDeleteUser() {
        UserDTO userDTO = new UserDTO();
        userDTO.setName("testuser2");
        userDTO.setPassword("password2");
        userDTO.setEmail("test@example.com");  // Add this line

        System.out.println("UserDTO created: " + userDTO);

        User user = new User(userDTO);

        System.out.println("User created from UserDTO: " + user);

        Mockito.when(userRepository.findByEmail("test@example.com")).thenReturn(user);

        System.out.println("Mock setup for userRepository.findByEmail");

        userService.deleteUser(userDTO);

        System.out.println("UserService.deleteUser called with UserDTO");

        Mockito.verify(userRepository, Mockito.times(1)).findByEmail("test@example.com");

        System.out.println("Verified userRepository.findByEmail was called once");

        Mockito.verify(userRepository, Mockito.times(1)).delete(user);

        System.out.println("Verified userRepository.delete was called once");
    }

    @Test
    void testUpdateUser() {
        // Create initial UserDTO
        UserDTO userDTO = new UserDTO();
        userDTO.setName("testuser3");
        userDTO.setPassword("password3");
        userDTO.setEmail("test3@example.com");
        userDTO.setWeight(70.0);
        userDTO.setHeight(175.0);

        // Create existing user
        User existingUser = new User(userDTO);
        System.out.println("Existing user created: " + existingUser);

        // Create updated UserDTO with new values
        UserDTO updatedDTO = new UserDTO();
        updatedDTO.setName("updatedUser");
        updatedDTO.setPassword("newPassword");
        updatedDTO.setEmail("test3@example.com"); // Same email to find the user
        updatedDTO.setWeight(75.0);
        updatedDTO.setHeight(180.0);

        System.out.println("Updated UserDTO created: " + updatedDTO);

        // Mock repository behavior
        Mockito.when(userRepository.findByEmail("test3@example.com")).thenReturn(existingUser);
        Mockito.when(userRepository.save(Mockito.any(User.class))).thenReturn(existingUser);

        System.out.println("Mock setup for userRepository methods");

        // Call the service method
        userService.updateUser(updatedDTO);

        System.out.println("UserService.updateUser called with updated UserDTO");

        // Verify that repository methods were called
        Mockito.verify(userRepository, Mockito.times(1)).findByEmail("test3@example.com");
        Mockito.verify(userRepository, Mockito.times(1)).save(Mockito.any(User.class));

        System.out.println("Verified userRepository methods were called");
    }

 */
}
