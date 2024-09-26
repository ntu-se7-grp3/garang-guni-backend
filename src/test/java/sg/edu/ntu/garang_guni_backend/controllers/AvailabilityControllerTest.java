package sg.edu.ntu.garang_guni_backend.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;
import sg.edu.ntu.garang_guni_backend.services.LocationService;

@SpringBootTest
@AutoConfigureMockMvc
public class AvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AvailabilityService availabilityService;

    @MockBean
    private LocationService locationService;

    @Autowired
    private ObjectMapper objectMapper;

    private Availability availability;
    private ScrapDealer scrapDealer;
    private Location location;
    private UUID scrapDealerId;

    @BeforeEach
    void setUp() {
        scrapDealerId = UUID.randomUUID();

        scrapDealer = new ScrapDealer();
        scrapDealer.setScrapDealerId(scrapDealerId);
        scrapDealer.setFirstName("John");
        scrapDealer.setLastName("Doe");
        scrapDealer.setEmail("john.doe@example.com");

        location = new Location();
        location.setId(1L);
        location.setName("Test Location");
        location.setLatitude(1.3521);
        location.setLongitude(103.8198);

        availability = new Availability();
        availability.setId(1L);
        availability.setAvailableDate(LocalDate.now().plusDays(10));
        availability.setLocation(location);
        availability.setScrapDealer(scrapDealer);

        when(locationService.getLocationById(1L)).thenReturn(location);
    }

    @Test
    @DisplayName("Test Creating Availability")
    @WithMockUser(username = "scrapdealer", roles = {"SCRAP_DEALER"})
    void testCreatingAvailability() throws Exception {
        when(availabilityService.createAvailability(any(UUID.class), any(Availability.class)))
            .thenReturn(availability);

        mockMvc.perform(post("/availability/{scrapDealerId}", scrapDealerId)
                .param("locationId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.location.name").value("Test Location"));
    }

    @Test
    @DisplayName("Test Updating Availability Location")
    @WithMockUser(username = "scrapdealer", roles = {"SCRAP_DEALER"})
    void testUpdatingAvailabilityAndCheckScrapDealerLink() throws Exception {
        location.setName("Updated Location");

        when(availabilityService.updateAvailability(anyLong(), any(Availability.class)))
            .thenReturn(availability);

        mockMvc.perform(put("/availability/{id}", 1L)
                .param("locationId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location.name").value("Updated Location"));
    }

    @Test
    @DisplayName("Test Finding All Dates by Location")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testFindingAllDatesByLocation() throws Exception {
        Long locationId = 1L;
        List<LocalDate> dates = List.of(LocalDate.now().plusDays(10));

        when(availabilityService.findDistinctDatesByLocation(locationId)).thenReturn(dates);

        mockMvc.perform(get("/availability/dates-by-location")
                .param("locationId", locationId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value(LocalDate.now().plusDays(10).toString()));

        verify(availabilityService).findDistinctDatesByLocation(locationId);
    }

    @Test
    @DisplayName("Test Finding All Locations by Date")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testFindingAllLocationsByDate() throws Exception {
        LocalDate date = LocalDate.now().plusDays(10);
        List<Location> locations = List.of(location);

        when(availabilityService.findDistinctLocationsByDate(date)).thenReturn(locations);

        mockMvc.perform(get("/availability/locations-by-date")
                .param("date", date.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Location"));

        verify(availabilityService).findDistinctLocationsByDate(date);
    }
}
