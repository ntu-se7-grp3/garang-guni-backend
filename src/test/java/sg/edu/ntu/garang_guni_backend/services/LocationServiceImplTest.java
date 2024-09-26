package sg.edu.ntu.garang_guni_backend.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.exceptions.LocationNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.LocationRepository;
import sg.edu.ntu.garang_guni_backend.services.impls.LocationServiceImpl;

public class LocationServiceImplTest {

    @InjectMocks
    private LocationServiceImpl locationService;

    @Mock
    private LocationRepository locationRepository;

    private Location mockLocation;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        mockLocation = new Location();
        mockLocation.setId(1L);
        mockLocation.setName("Test Location");
        mockLocation.setLatitude(1.3521);
        mockLocation.setLongitude(103.8198);
    }

    @Test
    @DisplayName("Test Creating Location")
    void testCreateLocation() {
        when(locationRepository.save(any(Location.class))).thenReturn(mockLocation);

        Location createdLocation = locationService.createLocation(mockLocation);

        assertNotNull(createdLocation);
        assertEquals("Test Location", createdLocation.getName());
        verify(locationRepository, times(1)).save(mockLocation);
    }

    @Test
    @DisplayName("Test Updating Location")
    void testUpdateLocation() {
        when(locationRepository.findById(anyLong())).thenReturn(Optional.of(mockLocation));
        when(locationRepository.save(any(Location.class))).thenReturn(mockLocation);

        Location updatedLocation = locationService.updateLocation(1L, mockLocation);

        assertNotNull(updatedLocation);
        assertEquals("Test Location", updatedLocation.getName());
        verify(locationRepository, times(1)).save(mockLocation);
    }

    @Test
    @DisplayName("Test Getting Location by ID")
    void testGetLocationById() {
        when(locationRepository.findById(anyLong())).thenReturn(Optional.of(mockLocation));

        Location foundLocation = locationService.getLocationById(1L);

        assertNotNull(foundLocation);
        assertEquals("Test Location", foundLocation.getName());
    }

    @Test
    @DisplayName("Test Location Not Found Exception")
    void testLocationNotFoundException() {
        when(locationRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(LocationNotFoundException.class, () -> locationService.getLocationById(1L));
    }

    @Test
    @DisplayName("Test Deleting Location")
    void testDeleteLocation() {
        when(locationRepository.findById(anyLong())).thenReturn(Optional.of(mockLocation));

        locationService.deleteLocation(1L);

        verify(locationRepository, times(1)).delete(mockLocation);
    }

    @Test
    @DisplayName("Test Getting All Locations")
    void testGetAllLocations() {
        List<Location> locations = List.of(mockLocation);
        when(locationRepository.findAll()).thenReturn(locations);

        List<Location> foundLocations = locationService.getAllLocations();

        assertNotNull(foundLocations);
        assertEquals(1, foundLocations.size());
        assertEquals("Test Location", foundLocations.get(0).getName());
    }
}
