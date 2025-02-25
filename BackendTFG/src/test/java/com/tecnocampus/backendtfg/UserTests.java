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
}
