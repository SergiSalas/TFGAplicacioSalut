package com.tecnocampus.backendtfg;

import com.tecnocampus.backendtfg.application.UserService;
import com.tecnocampus.backendtfg.application.dto.DataProfileDTO;
import com.tecnocampus.backendtfg.application.dto.GenderTypeDTO;
import com.tecnocampus.backendtfg.application.dto.UserDTO;
import com.tecnocampus.backendtfg.component.JwtUtils;
import com.tecnocampus.backendtfg.domain.Gender;
import com.tecnocampus.backendtfg.domain.User;
import com.tecnocampus.backendtfg.domain.UserImage;
import com.tecnocampus.backendtfg.persistence.UserImageRepository;
import com.tecnocampus.backendtfg.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UserTests {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserImageRepository userImageRepository;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private MultipartFile mockFile;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testSetDataProfile() {
        // Arrange
        String token = "test-token";
        String email = "test@example.com";

        DataProfileDTO dataProfileDTO = new DataProfileDTO();
        dataProfileDTO.setWeight(75.5);
        dataProfileDTO.setHeight(180);
        dataProfileDTO.setGender(Gender.MALE);
        dataProfileDTO.setAge(30);

        User user = new User();

        when(jwtUtils.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(user);

        // Act
        userService.setDataProfile(token, dataProfileDTO);

        // Assert
        verify(userRepository).save(user);
        assertEquals(75.5, user.getWeight());
        assertEquals(180.0, user.getHeight());
        assertEquals(Gender.MALE, user.getGender());
        assertEquals(30, user.getAge());
    }

    @Test
    public void testGetGenderTypes() {
        // Act
        List<GenderTypeDTO> genderTypes = userService.getGenderTypes();

        // Assert
        assertEquals(Gender.values().length, genderTypes.size());

        // Verificamos que todos los tipos de género estén presentes
        Set<String> genderNames = new HashSet<>();
        for (GenderTypeDTO genderTypeDTO : genderTypes) {
            genderNames.add(genderTypeDTO.getName());
        }

        for (Gender gender : Gender.values()) {
            assertTrue(genderNames.contains(gender.name()));
        }
    }

    @Test
    public void testGetDataProfile() {
        // Arrange
        String token = "test-token";
        String email = "test@example.com";
        String name = "Test User";

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setWeight(75.5);
        user.setHeight(180);
        user.setGender(Gender.MALE);
        user.setAge(30);

        when(jwtUtils.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(user);

        // Act
        UserDTO result = userService.getDataProfile(token);

        // Assert
        assertEquals(name, result.getName());
        assertEquals(email, result.getEmail());
        assertEquals(75.5, result.getWeight());
        assertEquals(180.0, result.getHeight());
        assertEquals(Gender.MALE, result.getGender());
        assertEquals(30, result.getAge());
    }

    @Test
    public void testGetDataProfileUserNotFound() {
        // Arrange
        String token = "test-token";
        String email = "nonexistent@example.com";

        when(jwtUtils.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> userService.getDataProfile(token));
    }

    @Test
    public void testSaveUserProfileImage_NewImage() throws IOException {
        // Arrange
        String token = "test-token";
        String email = "test@example.com";
        User user = new User();
        byte[] imageData = "test image data".getBytes();

        when(jwtUtils.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(userImageRepository.findByUser(user)).thenReturn(Optional.empty());
        when(mockFile.getBytes()).thenReturn(imageData);
        when(mockFile.getContentType()).thenReturn("image/jpeg");
        when(mockFile.getOriginalFilename()).thenReturn("profile.jpg");

        // Act
        userService.saveUserProfileImage(token, mockFile);

        // Assert
        verify(userImageRepository, times(1)).save(any(UserImage.class));
        assertNotNull(user.getUserImage());
        assertEquals("profile.jpg", user.getUserImage().getFilename());
    }

    @Test
    public void testSaveUserProfileImage_UpdateExisting() throws IOException {
        // Arrange
        String token = "test-token";
        String email = "test@example.com";
        User user = new User();
        UserImage existingImage = new UserImage();
        existingImage.setImageData("old data".getBytes());
        existingImage.setImageType("image/png");
        existingImage.setFilename("old.png");
        existingImage.setUser(user);
        user.setUserImage(existingImage);

        byte[] newImageData = "new image data".getBytes();

        when(jwtUtils.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(userImageRepository.findByUser(user)).thenReturn(Optional.of(existingImage));
        when(mockFile.getBytes()).thenReturn(newImageData);
        when(mockFile.getContentType()).thenReturn("image/jpeg");
        when(mockFile.getOriginalFilename()).thenReturn("new.jpg");

        // Act
        userService.saveUserProfileImage(token, mockFile);

        // Assert
        verify(userImageRepository, times(2)).save(existingImage);
        assertEquals("new.jpg", existingImage.getFilename());
    }

    @Test
    public void testGetUserProfileImageAsBase64() {
        // Arrange
        String token = "test-token";
        String email = "test@example.com";
        User user = new User();
        UserImage userImage = new UserImage();
        byte[] imageData = "test image data".getBytes();
        userImage.setImageData(imageData);
        userImage.setImageType("image/jpeg");
        userImage.setFilename("profile.jpg");

        when(jwtUtils.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(userImageRepository.findByUser(user)).thenReturn(Optional.of(userImage));

        // Act
        Map<String, String> result = userService.getUserProfileImageAsBase64(token);

        // Assert
        assertEquals("image/jpeg", result.get("imageType"));
        assertEquals(Base64.getEncoder().encodeToString(imageData), result.get("imageData"));
        assertEquals("profile.jpg", result.get("filename"));
    }

    @Test
    public void testGetUserProfileImageAsBase64_NotFound() {
        // Arrange
        String token = "test-token";
        String email = "test@example.com";
        User user = new User();

        when(jwtUtils.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(userImageRepository.findByUser(user)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> userService.getUserProfileImageAsBase64(token));
    }
}