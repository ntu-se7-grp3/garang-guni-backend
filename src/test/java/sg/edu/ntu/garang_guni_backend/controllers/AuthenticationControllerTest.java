package sg.edu.ntu.garang_guni_backend.controllers;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import sg.edu.ntu.garang_guni_backend.entities.LoginRequest;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.repositories.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private static User user;
    private static User invalidUser;

    @BeforeAll
    static void setUp() {
        user = User.builder()
                .firstName("TestFirstName")
                .lastName("TestLastName")
                .email("test@example.com")
                .password("P@ssword123")
                .build();

        invalidUser = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("")
                .build();
    }

    @AfterEach
    void clearDatabase() {
        userRepository.deleteAll(); 
    }

    @DisplayName("Test successful user signup")
    @Test
    void registerSuccessTest() throws Exception {
        // Arrange
        String newUserAsJson = objectMapper.writeValueAsString(user);

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
    void registerInvalidTest() throws Exception {
        // Arrange
        String invalidUserAsJson = objectMapper.writeValueAsString(invalidUser);

        RequestBuilder request = MockMvcRequestBuilders.post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidUserAsJson);

        // Act & Assert
        mockMvc.perform(request)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @DisplayName("Test signup with existing email")
    @Test
    void registerExistingEmailTest() throws Exception {
        // Arrange
        String newUserAsJson = objectMapper.writeValueAsString(user);

        RequestBuilder request = MockMvcRequestBuilders.post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newUserAsJson);

        // Act & Assert
        mockMvc.perform(request)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value(notNullValue()));

        mockMvc.perform(request)
                .andExpect(status().isConflict()) 
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @DisplayName("Test successful login")
    @Test
    void authenticateSuccessTest() throws Exception {
        // Arrange
        String newUserAsJson = objectMapper.writeValueAsString(user);

        RequestBuilder registerRequest = MockMvcRequestBuilders.post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newUserAsJson);

        // Act & Assert
        mockMvc.perform(registerRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value(notNullValue()));
        
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("P@ssword123");

        String loginRequestAsJson = objectMapper.writeValueAsString(loginRequest);

        RequestBuilder request = MockMvcRequestBuilders.post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequestAsJson);

        // Act & Assert
        mockMvc.perform(request)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value(notNullValue()));
    }

    @DisplayName("Test login with invalid credentials")
    @Test
    void authenticateInvalidCredentialsTest() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("john.doe@example.com");
        loginRequest.setPassword("wrongPassword");

        String loginRequestAsJson = objectMapper.writeValueAsString(loginRequest);

        RequestBuilder request = MockMvcRequestBuilders.post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequestAsJson);

        // Act & Assert
        mockMvc.perform(request)
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @DisplayName("Test login with non-existent user")
    @Test
    void authenticateNonExistentUserTest() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("nonexistent@example.com");
        loginRequest.setPassword("P@ssword123");

        String loginRequestAsJson = objectMapper.writeValueAsString(loginRequest);

        RequestBuilder request = MockMvcRequestBuilders.post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequestAsJson);

        // Act & Assert
        mockMvc.perform(request)
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
