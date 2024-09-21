package sg.edu.ntu.garang_guni_backend.controllers;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;

import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;

@SpringBootTest
@AutoConfigureMockMvc
public class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ContactRepository contactRepository;

    @DisplayName("Test for creating a valid contact form")
    @Test
    public void validContactCreationTest() throws Exception {
        // create a valid contact object
        Contact newContact = new Contact();
        newContact.setFirstName("Wang");
        newContact.setLastName("Wong");
        newContact.setEmail("wang@gmail.com");
        newContact.setPhoneNumber("1234567890");
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
            .andExpect(jsonPath("$.phoneNumber").value("1234567890"))
            .andExpect(jsonPath("$.subject").value("Inquiry"))
            .andExpect(jsonPath("$.messageContent").value("This is a test message."));
    }

    @DisplayName("Test creating empty FirstName contact form")
    @Test
    public void emptyFirstNameContactCreationTest() throws Exception {
        // create invalid contact object
        Contact invalidContact = new Contact();
        invalidContact.setFirstName(""); // empty first name
        invalidContact.setEmail("wang@gmail.com");
        invalidContact.setPhoneNumber("1234567890");
        invalidContact.setSubject("valid subject");
        invalidContact.setMessageContent("Message with valid content.");

        // convert to JSON
        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        // build post request
        RequestBuilder request = MockMvcRequestBuilders.post("/contacts")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidContactAsJson);

        // perform request and assert response
        mockMvc.perform(request)
            .andExpect(status().isBadRequest()) // expect 400 for invalid input
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.message").exists()); // Check if error message is present
    }

    // The rest of your test methods should follow the same indentation pattern...

    @AfterEach
    public void clearData() {
        contactRepository.deleteAll(); // clears all data created in repo
    }
}
