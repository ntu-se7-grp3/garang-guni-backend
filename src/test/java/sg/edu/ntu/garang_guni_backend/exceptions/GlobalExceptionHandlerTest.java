package sg.edu.ntu.garang_guni_backend.exceptions;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import sg.edu.ntu.garang_guni_backend.controllers.ContactController;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.service.ContactService;

@WebMvcTest(ContactController.class)
public class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ContactService contactService;

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    @Test
    @DisplayName("Test for handling ContactNotProcessingException")
    public void testHandleContactNotProcessingException() throws Exception {
        // Mock service to throw ContactNotProcessingException
        doThrow(new ContactNotProcessingException("Processing error")).when(contactService)
                .createContact(any(Contact.class));

        // Perform a POST request and expect 500 Internal Server Error
        mockMvc.perform(MockMvcRequestBuilders.post("/contacts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{ \"firstName\": \"Wang\", \"email\": \"wang@gmail.com\", \"phoneNumber\": \"1234567890\", \"subject\": \"Test\", \"messageContent\": \"This is a test message.\" }"))
                .andExpect(status().isInternalServerError()) // Expect 500 error
                .andExpect(jsonPath("$.message").value("Processing error"));
    }

    @Test
    @DisplayName("Test for handling generic exceptions")
    public void testHandleGenericException() throws Exception {
        // Force a RuntimeException to trigger the generic exception handler
        doThrow(new RuntimeException("Unexpected error")).when(contactService).createContact(any(Contact.class));

        // Perform a POST request and expect 500 Internal Server Error
        mockMvc.perform(MockMvcRequestBuilders.post("/contacts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{ \"firstName\": \"Wang\", \"email\": \"wang@gmail.com\", \"phoneNumber\": \"1234567890\", \"subject\": \"Test\", \"messageContent\": \"This is a test message.\" }"))
                .andExpect(status().isInternalServerError()) // Expect 500 error
                .andExpect(jsonPath("$.message").value("Unexpected error occurred, please debug"));
    }
}

// contactnotfound is only valid if want to search by id. so far we didnt
// implement this yet
