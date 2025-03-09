// src/test/java/com/tecnocampus/backendtfg/AuthTests.java
package com.tecnocampus.backendtfg;

import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    public void setup() {
        userRepository.deleteAll();
    }

    @Test
    public void testRegisterUser_Success() throws Exception {
        String requestBody = "{" +
                "\"email\": \"test@example.com\"," +
                "\"password\": \"password123\"," +
                "\"name\": \"Test User\"" +
                "}";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    public void testRegisterUser_UserAlreadyExists() throws Exception {
        // Create a user in the repository
        User existingUser = new User();
        existingUser.setEmail("test@example.com");
        existingUser.setName("Test User");
        existingUser.setPassword("encodedpassword"); // The password content is not evaluated in this test
        userRepository.save(existingUser);

        String requestBody = "{" +
                "\"email\": \"test@example.com\"," +
                "\"password\": \"password123\"," +
                "\"name\": \"Test User\"" +
                "}";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("User already exists"));
    }
    @Test
    public void testLoginUser_Success() throws Exception {
        // Create a user with an encoded password
        User user = new User();
        user.setEmail("login@example.com");
        user.setName("Login User");
        user.setPassword(passwordEncoder.encode("password123"));
        userRepository.save(user);

        String requestBody = "{" +
                "\"email\": \"login@example.com\"," +
                "\"password\": \"password123\"," +
                "\"name\": \"Login User\"" +
                "}";

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    public void testLoginUser_UserNotExist() throws Exception {
        String requestBody = "{" +
                "\"email\": \"nonexistent@example.com\"," +
                "\"password\": \"password123\"," +
                "\"name\": \"Nonexistent User\"" +
                "}";

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("User does not exist"));
    }

    @Test
    public void testLoginUser_InvalidCredentials() throws Exception {
        // Create a user with the correct password encoded.
        User user = new User();
        user.setEmail("loginfail@example.com");
        user.setName("Login Fail");
        user.setPassword(passwordEncoder.encode("correctpassword"));
        userRepository.save(user);

        String requestBody = "{" +
                "\"email\": \"loginfail@example.com\"," +
                "\"password\": \"wrongpassword\"," +
                "\"name\": \"Login Fail\"" +
                "}";

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid credentials"));
    }
}