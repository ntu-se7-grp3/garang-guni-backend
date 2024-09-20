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
        // create contact object
        Contact newContact = new Contact();
        newContact.setFirstName("Wong");
        newContact.setEmail("wong@gmail.com");
        newContact.setSubject("feedback from wong");
        newContact.setMessageContent("This is a wong test feedback.");

        // convertobject to JSON
        String newContactAsJson = objectMapper.writeValueAsString(newContact);

        // build post request
        RequestBuilder request = MockMvcRequestBuilders.post("/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newContactAsJson);

        // perform request and assert response
        mockMvc.perform(request)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").exists());
    }

    @DisplayName("Test creating invalid contact form")
    @Test
    public void invalidContactCreationTest() throws Exception {
        // create contact object with invalid fields
        Contact invalidContact = new Contact();
        invalidContact.setFirstName("Wong");
        invalidContact.setEmail("anyhow.gg");
        invalidContact.setSubject("feedback from wong");
        invalidContact.setMessageContent("This is a wong test feedback.");

        // convertobject to JSON
        String invalidContactAsJson = objectMapper.writeValueAsString(invalidContact);

        // build postrequest
        RequestBuilder request = MockMvcRequestBuilders.post("/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidContactAsJson);

        // perform request and assert response
        mockMvc.perform(request)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").exists());
    }

    @DisplayName("Test for getting all contact form")
    @Test
    public void geAllContactsTest() throws Exception {
        // create contact object
        Contact newContact = new Contact();
        newContact.setFirstName("Wong");
        newContact.setEmail("wong@gmail.com");
        newContact.setSubject("feedback from wong");
        newContact.setMessageContent("This is a wong test feedback.");
        contactRepository.save(newContact);

        // build get request
        RequestBuilder request = MockMvcRequestBuilders.get("/contact");

        // perform request and assert response
        mockMvc.perform(request)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.size()").value(1));
    }

    @AfterEach
    public void clearData() {
        contactRepository.deleteAll(); // clears all data created in repo
    }
}
