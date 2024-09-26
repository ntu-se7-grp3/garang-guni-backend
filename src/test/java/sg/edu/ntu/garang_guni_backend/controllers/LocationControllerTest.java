package sg.edu.ntu.garang_guni_backend.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
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
import org.springframework.test.web.servlet.MockMvc;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.services.LocationService;

@SpringBootTest
@AutoConfigureMockMvc
@EnableAutoConfiguration(exclude = {SecurityAutoConfiguration.class})
public class LocationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LocationService locationService;

    @Autowired
    private ObjectMapper objectMapper;

    private Location mockLocation;

    @BeforeEach
    void setUp() {
        mockLocation = new Location();
        mockLocation.setId(1L);
        mockLocation.setName("Test Location");
        mockLocation.setLatitude(1.3521);
        mockLocation.setLongitude(103.8198);
    }

    @Test
    @DisplayName("Test Creating Location")
    void testCreatingLocation() throws Exception {
        when(locationService.createLocation(any(Location.class))).thenReturn(mockLocation);

        mockMvc.perform(post("/locations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockLocation)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Location"));
    }

    @Test
    @DisplayName("Test Getting Location by ID")
    void testGettingLocationById() throws Exception {
        when(locationService.getLocationById(1L)).thenReturn(mockLocation);

        mockMvc.perform(get("/locations/{locationId}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Location"));
    }

    @Test
    @DisplayName("Test Getting All Locations")
    void testGettingAllLocations() throws Exception {
        List<Location> locations = List.of(mockLocation);

        when(locationService.getAllLocations()).thenReturn(locations);

        mockMvc.perform(get("/locations")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Location"));
    }
}