package sg.edu.ntu.garang_guni_backend.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;

@SpringBootTest
@AutoConfigureMockMvc
@EnableAutoConfiguration(exclude = {SecurityAutoConfiguration.class})
public class AvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AvailabilityService availabilityService;

    @Autowired
    private ObjectMapper objectMapper;

    private Availability availability = new Availability();
    private ScrapDealer mockScrapDealer;
    private UUID mockScrapDealerId;


    @BeforeEach
    void setUp() {
        // Initialize mock ScrapDealer
        mockScrapDealer = new ScrapDealer();
        mockScrapDealerId = UUID.randomUUID();
        mockScrapDealer.setScrapDealerId(mockScrapDealerId);
        mockScrapDealer.setFirstName("Uncle");
        mockScrapDealer.setLastName("Roger");
        mockScrapDealer.setEmail("uncle@gmail.com");
        mockScrapDealer.setPhoneNumber("+6591234567");
        mockScrapDealer.setAvailabilityList(new ArrayList<>());

        availability = new Availability();
        availability.setId(1L);
        availability.setAvailableDate(LocalDate.now().plusDays(10));
        availability.setLocation("Test Location");
        availability.setScrapDealer(mockScrapDealer);
        mockScrapDealer.getAvailabilityList().add(availability);
    }

    @Test
    @DisplayName("Test Creating Availability")
    @WithMockUser(username = "scrapdealer", roles = {"SCRAP_DEALER"})
    void testCreatingAvailability() throws Exception {
        when(availabilityService.createAvailability(any(UUID.class), any(Availability.class)))
            .thenReturn(availability);
    
        System.out.println(objectMapper.writeValueAsString(availability));
    
        mockMvc.perform(post("/availability/{scrapDealerId}", mockScrapDealerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.location").value("Test Location"));
    }

    @Test
    @DisplayName("Test Creating Availability with Empty Date")
    @WithMockUser(username = "scrapdealer", roles = {"SCRAP_DEALER"})
    void testCreatingEmptyDate() throws Exception {
        availability.setAvailableDate(null);

        mockMvc.perform(post("/availability/{scrapDealerId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Available date is required. "));
    }

    @Test
    @DisplayName("Test Creating Availability with Empty Location")
    @WithMockUser(username = "scrapdealer", roles = {"SCRAP_DEALER"})
    void testCreatingEmptyLocation() throws Exception {
        availability.setLocation("");

        mockMvc.perform(post("/availability/{scrapDealerId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Location is required. "));
    }

    @Test
    @DisplayName("Test Updating Availability Location")
    @WithMockUser(username = "scrapdealer", roles = {"SCRAP_DEALER"})
    void testUpdatingAvailabilityAndCheckScrapDealerLink() throws Exception {
        availability.setLocation("Updated Location");

        System.out.println(objectMapper.writeValueAsString(availability));

        when(availabilityService.updateAvailability(any(Long.class), any(Availability.class)))
                .thenReturn(availability);

        mockMvc.perform(put("/availability/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location").value("Updated Location"));
    }


    @Test
    @DisplayName("Test Updating Availability Date")
    @WithMockUser(username = "scrapdealer", roles = {"SCRAP_DEALER"})
    void testUpdatingAvailabilityDate() throws Exception {
        availability.setAvailableDate(LocalDate.now().plusDays(2));

        when(availabilityService.updateAvailability(any(Long.class), any(Availability.class)))
                .thenReturn(availability);

        mockMvc.perform(put("/availability/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                    "$.availableDate").value(LocalDate.now().plusDays(2).toString()));
    }

    @Test
    @DisplayName("Test Deleting Availability by Id")
    @WithMockUser(username = "fe5d9416-8c91-49ec-93c5-1e83d7c5d913", roles = {"SCRAP_DEALER"})
    void testDeleteAvailabilityById() throws Exception {
        Long availabilityId = 1L;
    
        mockMvc.perform(delete("/availability/{id}", availabilityId))
                .andExpect(status().isNoContent());
    
        verify(availabilityService).deleteAvailability(any(Long.class), any(UUID.class));
    }
    
    @Test
    @DisplayName("Test Location Exceeds 50 Characters")
    @WithMockUser(username = "scrapdealer", roles = {"SCRAP_DEALER"})
    void testLocationExceed50Characters() throws Exception {
        availability.setLocation(
            "This location name is way too long to be valid and exceeds the 50 characters limit");
    
        mockMvc.perform(post("/availability/{scrapDealerId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                    "Location should not exceed 50 characters. "));
    }
    
    @Test
    @DisplayName("Test ScrapDealer Authorization for Create")
    @WithMockUser(username = "scrapdealer", roles = {"SCRAP_DEALER"})
    void testScrapDealerAuthorizationForCreate() throws Exception {
        when(availabilityService.createAvailability(any(UUID.class), any(
            Availability.class))).thenReturn(availability);
    
        mockMvc.perform(post("/availability/{scrapDealerId}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isCreated());
    
        verify(availabilityService).createAvailability(any(UUID.class), any(Availability.class));
    }
}