package sg.edu.ntu.garang_guni_backend.exceptions;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.security.JwtTokenUtil;
import sg.edu.ntu.garang_guni_backend.services.ContactService;

@SpringBootTest
@AutoConfigureMockMvc
class GlobalExceptionHandlerTest {

    @Value("${jwt.secret.key}")
    private String secretKey;
    
    private String token;
    private static final long TEST_SESSION_PERIOD = 600;
    private static final String TOKEN_HEADER = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ContactService contactService;

    @BeforeEach
    void tokenSetup() {
        User testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setId(UUID.randomUUID());
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setPassword("F@k3P@ssw0rd");

        JwtTokenUtil tokenUtil = new JwtTokenUtil(secretKey, TEST_SESSION_PERIOD);
        token = tokenUtil.createToken(testUser);
    }

    @Test
    @DisplayName("Test for handling ContactNotProcessingException")
    void testHandleContactNotProcessingException() throws Exception {
        doThrow(new ContactNotProcessingException("Processing error"))
                .when(contactService).createContact(any(Contact.class));

        mockMvc.perform(MockMvcRequestBuilders.post("/contacts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"firstName\": \"Wang\", \"email\": \"wang@gmail.com\","
                + " \"phoneNumber\": \"+6598765432\", \"subject\": \"Test\","
                + " \"messageContent\": \"This is a test message.\" }")
                .header(TOKEN_HEADER, TOKEN_PREFIX + token))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Processing error"));
    }

    @Test
    @DisplayName("Test for handling generic exceptions")
    void testHandleGenericException() throws Exception {
        doThrow(new RuntimeException("Unexpected error"))
                .when(contactService).createContact(any(Contact.class));

        mockMvc.perform(MockMvcRequestBuilders.post("/contacts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"firstName\": \"Wang\", \"email\": \"wang@gmail.com\","
                + " \"phoneNumber\": \"+6598765432\", \"subject\": \"Test\","
                + " \"messageContent\": \"This is a test message.\" }")
                .header(TOKEN_HEADER, TOKEN_PREFIX + token))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value(
                        "An error occurred. Please contact support."));
    }
}
