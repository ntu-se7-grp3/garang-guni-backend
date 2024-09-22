package sg.edu.ntu.garang_guni_backend.controllers;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import sg.edu.ntu.garang_guni_backend.entities.Contact;

@SpringBootTest
@AutoConfigureMockMvc
public class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;


    @DisplayName("Test for creating a valid contact form")
    @Test
    public void validContactCreationTest() throws Exception {
        // create a valid contact object
        Contact newContact = new Contact();
        newContact.setFirstName("Wang");
        newContact.setLastName("Wong");
        newContact.setEmail("wang@gmail.com");
        newContact.setPhoneNumber("+6598765432");
        newContact.setSubject("Inquiry");
        newContact.setMessageContent("This is a test message.");

        // convert to JSON
        String newContactAsJson = objectMapper.writeValueAsString(newContact);

        // build post request
        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(newContactAsJson);

        // perform request and assert response
        mockMvc.perform(request)
            .andExpect(status().isCreated()) // expect 201
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.firstName").value("Wang"))
            .andExpect(jsonPath("$.lastName").value("Wong"))
            .andExpect(jsonPath("$.email").value("wang@gmail.com"))
            .andExpect(jsonPath("$.phoneNumber").value("+6598765432"))
            .andExpect(jsonPath("$.subject").value("Inquiry"))
            .andExpect(jsonPath("$.messageContent").value("This is a test message."));
    }

    @DisplayName("Test creating contact with empty First and Last Name")
    @Test
    public void emptyNameContactCreationTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName(""); // empty first name
        invalidContact.setLastName(""); // empty last name
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("+6598765432");
        invalidContact.setSubject("valid subject");
        invalidContact.setMessageContent("Message with valid content.");

        // convert to JSON
        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        // build post request
        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest()) // expect 400 for invalid input
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.message").exists()); // Check if error message is present
    }

    @DisplayName("Test creating valid contact with first name only")
    @Test
    public void validContactWithFirstNameOnlyTest() throws Exception {
        Contact newContact = new Contact();
        newContact.setFirstName("Wang");
        newContact.setLastName("");
        newContact.setEmail("wang@gmail.com");
        newContact.setPhoneNumber("+6512345678");
        newContact.setSubject("Inquiry");
        newContact.setMessageContent("This is a test message.");

        String newContactAsJson = objectMapper.writeValueAsString(newContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(newContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.firstName").value("Wang"))
            .andExpect(jsonPath("$.lastName").doesNotExist()); // Ensure last name is not present
    }

    @DisplayName("Test creating contact with long firstName")
    @Test
    public void tooLongFirstNameContactCreationTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("ThisNameIsDefinitelyWayTooLong");
        invalidContact.setLastName("Wong");
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("+6512345678");
        invalidContact.setSubject("Inquiry");
        invalidContact.setMessageContent("Test message.");

        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest()) //expect 400 for long firstname input
            .andExpect(jsonPath("$.message").exists());
    }

    @DisplayName("Test creating valid contact with last name only")
    @Test
    public void validContactWithLastNameOnlyTest() throws Exception {
        Contact newContact = new Contact();
        newContact.setFirstName("");
        newContact.setLastName("Wong");
        newContact.setEmail("wong@gmail.com");
        newContact.setPhoneNumber("+6512345678");
        newContact.setSubject("Inquiry");
        newContact.setMessageContent("This is a test message.");

        String newContactAsJson = objectMapper.writeValueAsString(newContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(newContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.lastName").value("Wong"))
            .andExpect(jsonPath("$.firstName").doesNotExist()); // Ensure first name is not present
    }

    @DisplayName("Test creating contact with too long lastName")
    @Test
    public void tooLongLastNameContactCreationTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("ThisLastNameIsWayTooLongToBeValid");
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("+6512345678");
        invalidContact.setSubject("Inquiry");
        invalidContact.setMessageContent("This is a test message.");

        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest()) //expect 400 for long lastname input
            .andExpect(jsonPath("$.message").exists());
    }

    // Continue similarly for other tests...

    @DisplayName("Test creating contact with empty request body")
    @Test
    public void emptyContactRequestTest() throws Exception {
        String emptyContactAsJson = "{}";

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(emptyContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").exists());
    }

    @DisplayName("Test creating contact with only XSS attack in message content")
    @Test
    public void xssAttackOnlyMessageContentTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("Wong");
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("+6512345678");
        invalidContact.setSubject("Inquiry");

        // Message content with only a script tag (will be empty after sanitization)
        invalidContact.setMessageContent("<script>alert('XSS');</script>");

        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest())  // Expect 400 as the message content becomes empty
            .andExpect(jsonPath("$.message").exists());
    }
}
