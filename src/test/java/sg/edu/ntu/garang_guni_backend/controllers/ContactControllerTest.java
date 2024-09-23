package sg.edu.ntu.garang_guni_backend.controllers;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;

@SpringBootTest
@AutoConfigureMockMvc
public class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // @MockBean
    // private ContactRepository contactRepository;

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
        Contact emptyNameContact = new Contact();
        emptyNameContact.setFirstName(""); // empty first name
        emptyNameContact.setLastName(""); // empty last name
        emptyNameContact.setEmail("wang@gmail.com");
        emptyNameContact.setPhoneNumber("+6598765432");
        emptyNameContact.setSubject("valid subject");
        emptyNameContact.setMessageContent("Message with valid content.");

        // Convert to JSON
        String emptyNameContactAsJson = objectMapper.writeValueAsString(emptyNameContact);

        // build post request
        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(emptyNameContactAsJson);

        // perform request and assert response
        mockMvc.perform(request)
            .andExpect(status().isBadRequest()) // expect 400 for invalid input
            // .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.message").value(
                "Either first name or last name must be provided."));
    }

    @DisplayName("Test creating valid contact with first name only")
    @Test
    public void validContactWithFirstNameOnlyTest() throws Exception {
        Contact newContact = new Contact();
        newContact.setFirstName("Wang");
        newContact.setLastName("");
        newContact.setEmail("wang@gmail.com");
        newContact.setPhoneNumber("+6592345678");
        newContact.setSubject("Inquiry");
        newContact.setMessageContent("This is a test message.");

        String newContactAsJson = objectMapper.writeValueAsString(newContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(newContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.firstName").value("Wang"))
            .andExpect(jsonPath("$.lastName").value(""));
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
        newContact.setPhoneNumber("+6592345678");
        newContact.setSubject("Inquiry");
        newContact.setMessageContent("This is a test message.");

        String newContactAsJson = objectMapper.writeValueAsString(newContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(newContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.lastName").value("Wong"))
            .andExpect(jsonPath("$.firstName").value(""));
    }

    @DisplayName("Test creating contact with too long lastName")
    @Test
    public void tooLongLastNameContactCreationTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("ThisLastNameIsWayTooLongToBeValid");
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("+6592345678");
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

    @DisplayName("Test creating contact with empty phoneNumber and email")
    @Test
    public void emptyPhoneAndEmailContactCreationTest() throws Exception {
        // create invalid contact object (both phoneNumber and email are empty)
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("Wong");
        invalidContact.setEmail(""); // empty email
        invalidContact.setPhoneNumber(""); // empty phone number
        invalidContact.setSubject("Inquiry");
        invalidContact.setMessageContent("Test message.");

        // convert to JSON
        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        // build post request
        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        // perform request and assert response
        mockMvc.perform(request)
            .andExpect(status().isBadRequest()) // expect 400 for missing phone/email
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.message").value(
            "Either email or phone number must be provided."));
    }

    @DisplayName("Test creating contact with invalid phone number")
    @Test
    public void invalidPhoneNumberContactCreationTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("Wong");
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("123456"); // invalid phone number
        invalidContact.setSubject("Inquiry");
        invalidContact.setMessageContent("Test message.");

        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest())  //expect 400 for invalid number input
            .andExpect(jsonPath("$.message").exists());
    }

    @DisplayName("Test creating contact with invalid email")
    @Test
    public void invalidEmailContactCreationTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("Wong");
        invalidContact.setEmail("gg.com"); // invalid email format
        invalidContact.setPhoneNumber("+6592345678");
        invalidContact.setSubject("Inquiry");
        invalidContact.setMessageContent("Test message.");

        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest())  //expect 400 for invalid email input
            .andExpect(jsonPath("$.message").exists());
    }

    @DisplayName("Test creating contact with empty subject")
    @Test
    public void emptySubjectContactCreationTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("Wong");
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("+6592345678");
        invalidContact.setSubject(""); // empty subject
        invalidContact.setMessageContent("This is a test message.");

        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest())  // expect 400 for missing subject
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.message").exists());
    }

    @DisplayName("Test creating contact with too long subject")
    @Test
    public void tooLongSubjectContactCreationTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("Wong");
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("+6592345678");
        invalidContact.setSubject("ThisSubjectIsWayTooLongToBeValid");
        invalidContact.setMessageContent("This is a test message.");

        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest()) //expect 400 for long subject input
            .andExpect(jsonPath("$.message").exists()); 
    }

    @DisplayName("Test creating contact with empty messageContent")
    @Test
    public void emptyMessageContentContactCreationTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("Wong");
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("+6592345678");
        invalidContact.setSubject("Inquiry");
        invalidContact.setMessageContent(""); // empty message content

        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest())  // expect 400 for missing message content
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.message").exists());
    }

    @DisplayName("Test creating contact with very long message content")
    @Test
    public void longMessageContentTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("Wong");
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("+6592345678");
        invalidContact.setSubject("Inquiry");
        invalidContact.setMessageContent("This is a very long test message "
            + "that exceeds the 200 character limit. I also dont know what else should write "
            + "to make it more then 200 character. Maybe i should just limit user to key in 100 "
            + "character and that it. i think by now should mbe more than enough. lets see the "
            + "test result.");

        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        mockMvc.perform(request)
            .andExpect(status().isBadRequest())   //expect 400 for long message input
            .andExpect(jsonPath("$.message").exists());
    }

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

    @DisplayName("Test creating contact with XSS attack in message content")
    @Test
    public void xssAttackOnlyMessageContentTest() throws Exception {
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wang");
        invalidContact.setLastName("Wong");
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("+6592345678");
        invalidContact.setSubject("Inquiry");
    
        // Message content with only a script tag (will be empty after sanitization)
        invalidContact.setMessageContent("<script>alert('XSS');</script>");
    
        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);
    
        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);
    
        mockMvc.perform(request)
            .andExpect(status().isBadRequest())  // Expect 400
            .andExpect(jsonPath("$.message").exists())  // Check if "message" field exists
            .andExpect(jsonPath("$.message").value("Message content cannot be empty after sanitization"));  // Check the exact error message
    }
}
