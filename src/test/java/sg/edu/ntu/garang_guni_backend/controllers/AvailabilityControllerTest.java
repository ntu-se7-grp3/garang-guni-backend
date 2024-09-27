package sg.edu.ntu.garang_guni_backend.controllers;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.AvailabilityRequest;
import sg.edu.ntu.garang_guni_backend.entities.Location;
// import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.security.JwtTokenUtil;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AvailabilityControllerTest {
    
    @Value("${jwt.secret.key}")
    private String secretKey;
    
    private String token;
    private static final long TEST_SESSION_PERIOD = 60000;
    private static final String TOKEN_HEADER = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Availability availability;
    private static AvailabilityRequest availabilityRequest;
    // private static AvailabilityRequest availabilityRequest2;
    // private static AvailabilityRequest availabilityRequest3;
    private static Location location;
    private static Location updatedLocation;
    // private static ScrapDealer scrapDealer;
    private static final String LOCATION_NAME = "Test Location";
    private static final String UPDATED_LOCATION_NAME = "Updated Location";
    private static final LocalDate AVAILABLE_DATE = LocalDate.now().plusDays(10);
    // private static final LocalDate AVAILABLE_DATE_2 = LocalDate.now().plusDays(20);

    @BeforeEach
    void tokenSetup() {
        User testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setId(UUID.randomUUID());
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setPassword("F@k3P@ssw0rd");

        JwtTokenUtil tokenUtil = new JwtTokenUtil(secretKey, TEST_SESSION_PERIOD);
        token = tokenUtil.createToken(testUser);
    }

    @BeforeAll
    static void setUp() {
        // scrapDealer = new ScrapDealer();
        // scrapDealer.setFirstName("John");
        // scrapDealer.setLastName("Doe");
        // scrapDealer.setEmail("john.doe@example.com");

        location = new Location();
        location.setLocationName(LOCATION_NAME);
        location.setLatitude(BigDecimal.valueOf(1.281285));
        location.setLongitude(BigDecimal.valueOf(1.281285));

        availability = new Availability();
        availability.setAvailableDate(AVAILABLE_DATE);
        availability.setLocation(location);
        // availability.setScrapDealer(scrapDealer);

        availabilityRequest = AvailabilityRequest.builder()
                .availableDate(AVAILABLE_DATE)
                .location(location)
                // .scrapDealer(scrapDealer)
                .build();

        // availabilityRequest2 = AvailabilityRequest.builder()
        //         .availableDate(AVAILABLE_DATE_2)
        //         .location(location)
        //         // .scrapDealer(scrapDealer)
        //         .build();

        // availabilityRequest3 = AvailabilityRequest.builder()
        //         .availableDate(AVAILABLE_DATE)
        //         .location(updatedLocation)
        //         // .scrapDealer(scrapDealer)
        //         .build();

        updatedLocation = new Location();
        updatedLocation.setLocationName(UPDATED_LOCATION_NAME);
        updatedLocation.setLatitude(BigDecimal.valueOf(1.3521));
        updatedLocation.setLongitude(BigDecimal.valueOf(103.8198));
    }

    @Test
    @DisplayName("Test Creating Availability")
    @WithMockUser(username = "scrapdealer", roles = {"SCRAP_DEALER"})
    void testCreatingAvailability() throws Exception {
        String sampleAvailabilityRequestAsJson = 
                objectMapper.writeValueAsString(availabilityRequest);

        RequestBuilder postRequest = MockMvcRequestBuilders
                .post("/availabilities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleAvailabilityRequestAsJson)
                .header(TOKEN_HEADER, TOKEN_PREFIX + token);
        
        mockMvc.perform(postRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.location.locationName")
                                .value(LOCATION_NAME));
    }

    // @Test
    // @DisplayName("Test Updating Availability Location")
    // void testUpdatingAvailabilityAndCheckScrapDealerLink() throws Exception {
    //     String sampleAvailabilityRequestAsJson = 
    //             objectMapper.writeValueAsString(availabilityRequest);

    //     RequestBuilder postAvailabilityRequest = MockMvcRequestBuilders
    //             .post("/availabilities")
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(sampleAvailabilityRequestAsJson)
    //             .header(TOKEN_HEADER, TOKEN_PREFIX + token);

    //     String createdAvailabilityAsJson = mockMvc.perform(postAvailabilityRequest)
    //             .andExpect(status().isCreated())
    //             .andExpect(jsonPath("$.location.locationName")
    //                             .value(LOCATION_NAME))
    //             .andReturn()
    //             .getResponse()
    //             .getContentAsString();
            
    //     String createdAvailabilityId =
    //             JsonPath.read(createdAvailabilityAsJson, "$.availabilityId");

    //     String updatedLocationAsJson = 
    //             objectMapper.writeValueAsString(updatedLocation);

    //     RequestBuilder postLocationRequest = MockMvcRequestBuilders
    //             .post("/locations")
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(updatedLocationAsJson)
    //             .header(TOKEN_HEADER, TOKEN_PREFIX + token);

    //     String createdLocationAsJson = mockMvc.perform(postLocationRequest)
    //             .andExpect(status().isCreated())
    //             .andExpect(jsonPath("$.locationName")
    //                             .value(UPDATED_LOCATION_NAME))
    //             .andReturn()
    //             .getResponse()
    //             .getContentAsString();
            
    //     String updatedLocationId =
    //             JsonPath.read(createdLocationAsJson, "$.locationId");
    
    //     RequestBuilder putRequest = MockMvcRequestBuilders
    //             .put("/availabilities/" 
    //                     + createdAvailabilityId 
    //                     + "/locations/" 
    //                     + updatedLocationId)
    //             .header(TOKEN_HEADER, TOKEN_PREFIX + token);
        
    //     mockMvc.perform(putRequest)
    //             .andExpect(status().isOk());
    // }

    // @Test
    // @DisplayName("Test Finding All Dates by Location")
    // void testFindingAllDatesByLocation() throws Exception {
    //     String sampleAvailabilityRequestAsJson = 
    //             objectMapper.writeValueAsString(availabilityRequest);

    //     RequestBuilder postAvailabilityRequest = MockMvcRequestBuilders
    //             .post("/availabilities")
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(sampleAvailabilityRequestAsJson)
    //             .header(TOKEN_HEADER, TOKEN_PREFIX + token);

    //     mockMvc.perform(postAvailabilityRequest)
    //             .andExpect(status().isCreated())
    //             .andExpect(jsonPath("$.location.locationName")
    //                             .value(LOCATION_NAME));
        
    //     String sampleAvailability2RequestAsJson = 
    //             objectMapper.writeValueAsString(availabilityRequest2);

    //     RequestBuilder postAvailability2Request = MockMvcRequestBuilders
    //             .post("/availabilities")
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(sampleAvailability2RequestAsJson)
    //             .header(TOKEN_HEADER, TOKEN_PREFIX + token);

    //     mockMvc.perform(postAvailability2Request)
    //             .andExpect(status().isCreated())
    //             .andExpect(jsonPath("$.location.locationName")
    //                             .value(LOCATION_NAME));

    //     RequestBuilder getRequest = MockMvcRequestBuilders
    //             .get("/availabilities/dates-by-location?"
    //                     + AVAILABLE_DATE)
    //             .header(TOKEN_HEADER, TOKEN_PREFIX + token);

    //     mockMvc.perform(getRequest)
    //             .andExpect(status().isOk())
    //             .andExpect(jsonPath("$[0]").value(AVAILABLE_DATE))
    //             .andExpect(jsonPath("$[1]").value(AVAILABLE_DATE_2));
    // }

    // @Test
    // @DisplayName("Test Finding All Locations by Date")
    // void testFindingAllLocationsByDate() throws Exception {

    //     String sampleAvailabilityRequestAsJson = 
    //             objectMapper.writeValueAsString(availabilityRequest);

    //     RequestBuilder postAvailabilityRequest = MockMvcRequestBuilders
    //             .post("/availabilities")
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(sampleAvailabilityRequestAsJson)
    //             .header(TOKEN_HEADER, TOKEN_PREFIX + token);

    //     mockMvc.perform(postAvailabilityRequest)
    //             .andExpect(status().isCreated())
    //             .andExpect(jsonPath("$.location.locationName")
    //                             .value(LOCATION_NAME));
                
    //     String sampleAvailability3RequestAsJson = 
    //             objectMapper.writeValueAsString(availabilityRequest3);

    //     RequestBuilder postAvailability3Request = MockMvcRequestBuilders
    //             .post("/availabilities")
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(sampleAvailability3RequestAsJson)
    //             .header(TOKEN_HEADER, TOKEN_PREFIX + token);

    //     mockMvc.perform(postAvailability3Request)
    //             .andExpect(status().isCreated())
    //             .andExpect(jsonPath("$.location.locationName")
    //                             .value(UPDATED_LOCATION_NAME));

    //     RequestBuilder getRequest = MockMvcRequestBuilders
    //             .get("/availability/locations-by-date?" 
    //                     + AVAILABLE_DATE.toString())
    //             .header(TOKEN_HEADER, TOKEN_PREFIX + token);

    //     mockMvc.perform(getRequest)
    //             .andExpect(status().isOk())
    //             .andExpect(jsonPath("$[0].name")
    //                     .value(LOCATION_NAME))
    //             .andExpect(jsonPath("$[0].name")
    //                     .value(UPDATED_LOCATION_NAME));
    // }
}
