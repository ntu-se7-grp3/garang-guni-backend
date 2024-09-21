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

        @DisplayName("Test creating long FirstName contact form")
        @Test
        public void longFirstNameContactCreationTest() throws Exception {
                // create invalid contact
                Contact invalidContact = new Contact();
                invalidContact.setFirstName(
                                "My name is super long and i also cannot remember my name so i also do not know how to type it out. so yeah this is my name.");
                // first name more than 20 char
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

        @DisplayName("Test creating long LastName contact form")
        @Test
        public void longLastNameContactCreationTest() throws Exception {
                // create invalid contact
                Contact invalidContact = new Contact();
                invalidContact.setFirstName("Wang");
                invalidContact.setLastName(
                                "My name is super long and i also cannot remember my name so i also do not know how to type it out. so yeah this is my name.");
                // last name more than 20 char
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

        @DisplayName("Test creating invalid PhoneNumber contact form")
        @Test
        public void invalidPhoneNumberContactCreationTest() throws Exception {
                // create invalid contact object
                Contact invalidContact = new Contact();
                invalidContact.setFirstName("Wang");
                invalidContact.setEmail("wang@gmail.com");
                invalidContact.setPhoneNumber("123"); // invalid phone number
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

        @DisplayName("Test creating invalid Email contact form")
        @Test
        public void invalidEmailContactCreationTest() throws Exception {
                // create invalid contact object
                Contact invalidContact = new Contact();
                invalidContact.setFirstName("Wang");
                invalidContact.setEmail("gg.com"); // invalid email
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

        @DisplayName("Test creating empty Email contact form")
        @Test
        public void EmptyEmailContactCreationTest() throws Exception {
                // create invalid contact object
                Contact invalidContact = new Contact();
                invalidContact.setFirstName("Wang");
                invalidContact.setEmail(""); // empty email
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

        @DisplayName("Test creating empty subject contact form")
        @Test
        public void EmptySubjectContactCreationTest() throws Exception {
                // create invalid contact object
                Contact invalidContact = new Contact();
                invalidContact.setFirstName("Wang");
                invalidContact.setEmail("wang@gmail.com");
                invalidContact.setPhoneNumber("1234567890");
                invalidContact.setSubject(""); // empty subject
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

        @DisplayName("Test creating long subject contact form")
        @Test
        public void LongSubjectContactCreationTest() throws Exception {
                // create invalid contact object
                Contact invalidContact = new Contact();
                invalidContact.setFirstName("Wang");
                invalidContact.setEmail("wang@gmail.com");
                invalidContact.setPhoneNumber("1234567890");
                invalidContact.setSubject(
                                "i dont know hwat to write just want to make sure it exceed 200 charactor. is it exceeded? i not sure. just keep typing anything."); // long
                                                                                                                                                                     // subject
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

        @DisplayName("Test creating empty message contact form")
        @Test
        public void EmptyMessageContactCreationTest() throws Exception {
                // create invalid contact object
                Contact invalidContact = new Contact();
                invalidContact.setFirstName("Wang");
                invalidContact.setEmail("wang@gmail.com");
                invalidContact.setPhoneNumber("1234567890");
                invalidContact.setSubject("hello");
                invalidContact.setMessageContent(""); // empty message

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

        @DisplayName("Test creating long message contact form")
        @Test
        public void LongMessageContactCreationTest() throws Exception {
                // create invalid contact object
                Contact invalidContact = new Contact();
                invalidContact.setFirstName("Wang");
                invalidContact.setEmail("wang@gmail.com");
                invalidContact.setPhoneNumber("1234567890");
                invalidContact.setSubject("");
                // long message
                invalidContact.setMessageContent(
                                "i dont know hwat to write just want to make sure it exceed 200 charactor. is it exceeded? i not sure. just keep typing anything. Wah biang need to write 200 charactor. i should just go and change to 50 character enough.");

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

        @DisplayName("Test for getting all contact form")
        @Test
        public void geAllContactsTest() throws Exception {
                // create contact object
                Contact newContact = new Contact();
                newContact.setFirstName("Wang");
                newContact.setLastName("Wong");
                newContact.setEmail("wang@gmail.com");
                newContact.setPhoneNumber("1234567890");
                newContact.setSubject("Inquiry");
                newContact.setMessageContent("This is a test message.");
                contactRepository.save(newContact);

                // build get request to correct URL
                RequestBuilder request = MockMvcRequestBuilders.get("/contacts")
                                .contentType(MediaType.APPLICATION_JSON);

                // perform request and assert response
                mockMvc.perform(request)
                                .andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].firstName").value("Wang"))
                                .andExpect(jsonPath("$[0].email").value("wang@gmail.com"));
        }

        @AfterEach
        public void clearData() {
                contactRepository.deleteAll(); // clears all data created in repo
        }
}
