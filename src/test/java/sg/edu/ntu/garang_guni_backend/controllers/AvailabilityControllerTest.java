package sg.edu.ntu.garang_guni_backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;

import java.time.LocalDate;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class AvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AvailabilityService availabilityService;

    @Autowired
    private ObjectMapper objectMapper;

    private Availability availability;

    @BeforeEach
    void setUp() {
        availability = new Availability();
        availability.setAvailableDate(LocalDate.now().plusDays(1));
        availability.setLocation("Test Location");
    }

    @Test
    @DisplayName("Test Creating Availability with Empty Date")
    void testCreatingEmptyDate() throws Exception {
        availability.setAvailableDate(null);

        mockMvc.perform(post("/availability/{scrapDealerId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test Creating Availability with Empty Location")
    void testCreatingEmptyLocation() throws Exception {
        availability.setLocation("");

        mockMvc.perform(post("/availability/{scrapDealerId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test Updating Availability Date")
    void testUpdatingAvailabilityDate() throws Exception {
        availability.setAvailableDate(LocalDate.now().plusDays(2));

        mockMvc.perform(put("/availability/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableDate").value(LocalDate.now().plusDays(2).toString()));
    }

    @Test
    @DisplayName("Test Updating Availability Location")
    void testUpdatingAvailabilityLocation() throws Exception {
        availability.setLocation("Updated Location");

        mockMvc.perform(put("/availability/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location").value("Updated Location"));
    }

    @Test
    @DisplayName("Test Deleting Availability by Id")
    void testDeleteAvailabilityById() throws Exception {
        mockMvc.perform(delete("/availability/{id}", 1L))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Test Location Exceeds 50 Characters")
    void testLocationExceed50Characters() throws Exception {
        availability.setLocation("This location name is way too long to be valid and exceeds the 50 characters limit");

        mockMvc.perform(post("/availability/{scrapDealerId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test ScrapDealer Authorization for Create")
    void testScrapDealerAuthorizationForCreate() throws Exception {
        when(availabilityService.createAvailability(any(UUID.class), any(Availability.class))).thenReturn(availability);

        mockMvc.perform(post("/availability/{scrapDealerId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isCreated());

        verify(availabilityService).createAvailability(any(UUID.class), any(Availability.class));
    }
}