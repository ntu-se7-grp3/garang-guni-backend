package sg.edu.ntu.garang_guni_backend.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import sg.edu.ntu.garang_guni_backend.exceptions.InvalidDateException;
import sg.edu.ntu.garang_guni_backend.exceptions.UnauthorizedAccessException;
import sg.edu.ntu.garang_guni_backend.repositories.AvailabilityRepository;
import sg.edu.ntu.garang_guni_backend.repositories.ScrapDealerRepository;
import sg.edu.ntu.garang_guni_backend.services.impls.AvailabilityServiceImpl;

public class AvailabilityServiceImplTest {

    @InjectMocks
    private AvailabilityServiceImpl availabilityService;

    @Mock
    private AvailabilityRepository availabilityRepository;

    @Mock
    private ScrapDealerRepository scrapDealerRepository;

    private Availability availability;
    private ScrapDealer scrapDealer;
    private Location mockLocation;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        scrapDealer = new ScrapDealer();
        scrapDealer.setScrapDealerId(UUID.randomUUID());

        mockLocation = new Location();
        mockLocation.setId(1L);
        mockLocation.setName("Test Location");
        mockLocation.setLatitude(1.3521);
        mockLocation.setLongitude(103.8198);

        availability = new Availability();
        availability.setAvailableDate(LocalDate.now().plusDays(1));
        availability.setLocation(mockLocation);
        availability.setScrapDealer(scrapDealer);
    }

    @Test
    @DisplayName("Test Creating Availability with Past Date")
    void testCreateAvailabilityInvalidDate() {
        availability.setAvailableDate(LocalDate.now().minusDays(1));

        when(scrapDealerRepository.findById(any(UUID.class))).thenReturn(Optional.of(scrapDealer));

        assertThrows(InvalidDateException.class, () -> availabilityService.createAvailability(
            scrapDealer.getScrapDealerId(), availability));
    }

    @Test
    @DisplayName("Test Updating Availability Date Successfully")
    void testUpdateAvailabilityDate() {
        when(availabilityRepository.findById(anyLong())).thenReturn(Optional.of(availability));
        when(availabilityRepository.save(any(Availability.class))).thenReturn(availability);

        Availability updatedAvailability = availabilityService.updateAvailability(1L, availability);

        assertEquals(LocalDate.now().plusDays(1), updatedAvailability.getAvailableDate());
    }

    @Test
    @DisplayName("Test Deleting Availability")
    void testDeleteAvailability() {
        when(availabilityRepository.findById(anyLong())).thenReturn(Optional.of(availability));

        availabilityService.deleteAvailability(1L, scrapDealer.getScrapDealerId());

        verify(availabilityRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Test Unauthorized Access when Deleting Availability")
    void testUnauthorizedAccessForDelete() {
        UUID unauthorizedUserId = UUID.randomUUID();
        when(availabilityRepository.findById(anyLong())).thenReturn(Optional.of(availability));

        assertThrows(UnauthorizedAccessException.class, () -> 
            availabilityService.deleteAvailability(1L, unauthorizedUserId));
    }
}
