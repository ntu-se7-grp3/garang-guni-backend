package sg.edu.ntu.garang_guni_backend.services.impls;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.exceptions.location.LocationNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.LocationRepository;

@SpringBootTest
 class LocationServiceImplTest {
    @Mock
    private LocationRepository locationRepository;

    @InjectMocks
    private LocationServiceImpl locationService;
    private static Location sampleLocation;
    private static Location updatedLocation;
    private static final String SAMPLE_LOCATION_NAME = "Fitzroy";
    private static final String SAMPLE_LOCATION_ADDRESS = "104 Cecil Street";
    private static final String UPDATED_LOCATION_NAME = "My Home";
    private static final String UPDATED_LOCATION_ADDRESS = "100 Cecil Street";
    private static final BigDecimal SAMPLE_LOCATION_LAT =
            BigDecimal.valueOf(1.281285);
    private static final BigDecimal SAMPLE_LOCATION_LNG =
            BigDecimal.valueOf(103.848961);
    private static final UUID LOCATION_ID = UUID.randomUUID();

    @BeforeAll
    static void setUp() {
        sampleLocation = Location.builder()
                                .locationName(SAMPLE_LOCATION_NAME)
                                .locationAddress(SAMPLE_LOCATION_ADDRESS)
                                .latitude(SAMPLE_LOCATION_LAT)
                                .longitude(SAMPLE_LOCATION_LNG)
                                .build();

        updatedLocation = Location.builder()
                                .locationName(UPDATED_LOCATION_NAME)
                                .locationAddress(UPDATED_LOCATION_ADDRESS)
                                .latitude(SAMPLE_LOCATION_LAT)
                                .longitude(SAMPLE_LOCATION_LNG)
                                .build();
    }

    @DisplayName("Create Location - Successful")
    @Test
    void createLocationTest() {
        when(locationRepository.save(sampleLocation)).thenReturn(sampleLocation);
        Location createdLocation = locationService.createLocation(sampleLocation);
        assertEquals(sampleLocation.getLocationName(),
                createdLocation.getLocationName());
        assertEquals(sampleLocation.getLocationAddress(),
                createdLocation.getLocationAddress());
        assertEquals(sampleLocation.getLatitude(),
                createdLocation.getLatitude());
        assertEquals(sampleLocation.getLongitude(),
                createdLocation.getLongitude());
        verify(locationRepository, times(1))
                .save(any(Location.class));
    }

    @DisplayName("Get Location By Id - Successful")
    @Test
    void getLocationByIdTest() {
        when(locationRepository.findById(LOCATION_ID))
                .thenReturn(Optional.of(sampleLocation));

        Location retrievedLocation = locationService.getLocationById(LOCATION_ID);
        assertNotEquals(sampleLocation, retrievedLocation);
        assertEquals(sampleLocation.getLocationName(),
                retrievedLocation.getLocationName());
        assertEquals(sampleLocation.getLocationAddress(),
                retrievedLocation.getLocationAddress());
        assertEquals(sampleLocation.getLatitude(),
                retrievedLocation.getLatitude());
        assertEquals(sampleLocation.getLongitude(),
                retrievedLocation.getLongitude());
        verify(locationRepository, times(1))
                .findById(any(UUID.class));
    }

    @DisplayName("Get Location By Id - Invalid Id")
    @Test
    void getLocationByNonExistantIdTest() {
        when(locationRepository.findById(LOCATION_ID))
                .thenReturn(Optional.empty());

        assertThrows(LocationNotFoundException.class,
            () -> locationService.getLocationById(LOCATION_ID));
    }

    @DisplayName("Update Location - Successful")
    @Test
    void updateLocationTest() {
        when(locationRepository.findById(LOCATION_ID))
                .thenReturn(Optional.of(sampleLocation));
        when(locationRepository.save(any(Location.class)))
                .thenAnswer(invocation ->  {
                    return invocation.getArgument(0);
                });

        Location retrievedLocation = locationService
                .updateLocation(LOCATION_ID, updatedLocation);

        assertNotEquals(updatedLocation, retrievedLocation);
        assertEquals(updatedLocation.getLocationName(),
                retrievedLocation.getLocationName());
        assertEquals(updatedLocation.getLocationAddress(),
                retrievedLocation.getLocationAddress());
        assertEquals(updatedLocation.getLatitude(),
                retrievedLocation.getLatitude());
        assertEquals(updatedLocation.getLongitude(),
                retrievedLocation.getLongitude());
        verify(locationRepository, times(1))
                .findById(any(UUID.class));
        verify(locationRepository, times(1))
                .save(any(Location.class));
    }

    @DisplayName("Update Location - Invalid Id")
    @Test
    void updateLocationWithNonExistentIdTest() {
        assertThrows(LocationNotFoundException.class, 
                () -> locationService.updateLocation(LOCATION_ID, updatedLocation));
    }

    @DisplayName("Delete Location - Successful")
    @Test
    void deleteLocationTest() {
        when(locationRepository.findById(LOCATION_ID))
                .thenReturn(Optional.of(sampleLocation));
        
        Location popLocation = locationService.deleteLocation(LOCATION_ID);
        assertEquals(sampleLocation, popLocation);
        verify(locationRepository, times(1))
                .findById(LOCATION_ID);
        verify(locationRepository, times(1))
                .deleteById(LOCATION_ID);
    }

    @DisplayName("Delete Location - Invalid Id")
    @Test
    void deleteLocationWithNonExistentIdTest() {
        assertThrows(LocationNotFoundException.class, 
                () -> locationService.deleteLocation(LOCATION_ID));
    }
}
