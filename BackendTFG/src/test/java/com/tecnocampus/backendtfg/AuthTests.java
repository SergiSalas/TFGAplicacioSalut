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
}