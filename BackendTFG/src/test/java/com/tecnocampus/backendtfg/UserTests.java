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
}
