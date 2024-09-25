package sg.edu.ntu.garang_guni_backend.controllers;

import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.repositories.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc // This is needed to autowire the MockMvc object
public class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    private User user;

    @DisplayName("Test successful user signup")
    @Test
    public void registerSuccessTest() throws Exception {
        // Arrange
        user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("P@ssword123")
                .build();

        String newUserAsJson = objectMapper.writeValueAsString(user);

        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(user.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        RequestBuilder request = MockMvcRequestBuilders.post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newUserAsJson);

        // Act & Assert
        mockMvc.perform(request)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value(notNullValue()));
    }

    @DisplayName("Test signup with invalid data")
    @Test
    public void registerInvalidTest() throws Exception {
        // Arrange
        user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("")
                .build();

        String newUserAsJson = objectMapper.writeValueAsString(user);

        RequestBuilder request = MockMvcRequestBuilders.post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newUserAsJson);

        // Act & Assert
        mockMvc.perform(request)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @DisplayName("Test signup with existing email")
    @Test
    public void registerExistingEmailTest() throws Exception {
        // Arrange
        user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com") // Email that already exists
                .password("P@ssword123")
                .build();

        String newUserAsJson = objectMapper.writeValueAsString(user);

        when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        RequestBuilder request = MockMvcRequestBuilders.post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newUserAsJson);

        // Act & Assert
        mockMvc.perform(request)
                // Assuming the controller returns 409 Conflict for existing email
                .andExpect(status().isConflict()) 
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
