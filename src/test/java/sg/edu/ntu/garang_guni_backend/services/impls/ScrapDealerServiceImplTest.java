package sg.edu.ntu.garang_guni_backend.services.impls;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import sg.edu.ntu.garang_guni_backend.exceptions.ScrapDealerNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.UnauthorizedAccessException;
import sg.edu.ntu.garang_guni_backend.repositories.ScrapDealerRepository;

class ScrapDealerServiceImplTest {

    @Mock
    private ScrapDealerRepository scrapDealerRepository;

    @InjectMocks
    private ScrapDealerServiceImpl scrapDealerService;

    private ScrapDealer sampleDealer;
    private UUID scrapDealerId;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        scrapDealerId = UUID.randomUUID();
        sampleDealer = new ScrapDealer();
        sampleDealer.setScrapDealerId(scrapDealerId);
        sampleDealer.setFirstName("Uncle");
        sampleDealer.setLastName("Roger");
        sampleDealer.setEmail("uncle@gmail.com");
        sampleDealer.setPhoneNumber("+6591234567");
    }

    @Test
    void createDealerTest() {
        when(scrapDealerRepository.save(any(ScrapDealer.class))).thenReturn(sampleDealer);

        ScrapDealer createdDealer = scrapDealerService.createDealer(sampleDealer);

        assertNotNull(createdDealer);
        assertEquals("Uncle", createdDealer.getFirstName());
        assertEquals("Roger", createdDealer.getLastName());
        assertEquals("uncle@gmail.com", createdDealer.getEmail());
        assertEquals("+6591234567", createdDealer.getPhoneNumber());

        verify(scrapDealerRepository, times(1)).save(any(ScrapDealer.class));
    }

    @Test
    void createInvalidDealerTest() {
        sampleDealer.setFirstName(null);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            scrapDealerService.createDealer(sampleDealer);
        });

        assertEquals("First name is required.", exception.getMessage());
        verify(scrapDealerRepository, never()).save(any(ScrapDealer.class));
    }

    @Test
    void getAllDealersTest() {
        when(scrapDealerRepository.findAll()).thenReturn(List.of(sampleDealer));

        List<ScrapDealer> dealers = scrapDealerService.getAllDealers();

        assertEquals(1, dealers.size());
        assertEquals("Uncle", dealers.get(0).getFirstName());
        verify(scrapDealerRepository, times(1)).findAll();
    }

    @Test
    void getEmptyDealersTest() {
        when(scrapDealerRepository.findAll()).thenReturn(Collections.emptyList());

        List<ScrapDealer> dealers = scrapDealerService.getAllDealers();

        assertEquals(0, dealers.size(), "The dealer list should be empty.");
        verify(scrapDealerRepository, times(1)).findAll();
    }

    @Test
    void getScrapDealerByIdTest() {
        when(scrapDealerRepository.findById(any(UUID.class))).thenReturn(Optional.of(sampleDealer));

        ScrapDealer foundDealer = scrapDealerService.getScrapDealerById(scrapDealerId);

        assertNotNull(foundDealer);
        assertEquals("Uncle", foundDealer.getFirstName());
        verify(scrapDealerRepository, times(1)).findById(any(UUID.class));
    }

    @Test
    void getScrapDealerByInvalidIdTest() {
        when(scrapDealerRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        ScrapDealerNotFoundException exception = 
            assertThrows(ScrapDealerNotFoundException.class, () -> {
                scrapDealerService.getScrapDealerById(scrapDealerId);
            });

        assertEquals("Scrap dealer not found with id: " + scrapDealerId, exception.getMessage());
        verify(scrapDealerRepository, times(1)).findById(any(UUID.class));
    }

    @Test
    void updateScrapDealerTest() {
        UUID loggedInUserId = scrapDealerId;
        when(scrapDealerRepository.findById(any(UUID.class))).thenReturn(Optional.of(sampleDealer));
        when(scrapDealerRepository.save(any(ScrapDealer.class))).thenReturn(sampleDealer);

        ScrapDealer updatedDealer = scrapDealerService.updateScrapDealer(
            scrapDealerId, sampleDealer, loggedInUserId);

        assertNotNull(updatedDealer);
        assertEquals("Uncle", updatedDealer.getFirstName());
        verify(scrapDealerRepository, times(1)).findById(any(UUID.class));
        verify(scrapDealerRepository, times(1)).save(any(ScrapDealer.class));
    }

    @Test
    void updateScrapDealerInvalidUserTest() {
        UUID loggedInUserId = UUID.randomUUID();
        when(scrapDealerRepository.findById(any(UUID.class))).thenReturn(Optional.of(sampleDealer));

        UnauthorizedAccessException exception = 
            assertThrows(UnauthorizedAccessException.class, () -> {
                scrapDealerService.updateScrapDealer(scrapDealerId, sampleDealer, loggedInUserId);
            });

        assertEquals("You are not allowed to modify this scrap dealer's details", 
            exception.getMessage());
        verify(scrapDealerRepository, times(1)).findById(any(UUID.class));
        verify(scrapDealerRepository, never()).save(any(ScrapDealer.class));
    }

    @Test
    void deleteDealerByIdTest() {
        UUID loggedInUserId = scrapDealerId;
        when(scrapDealerRepository.findById(any(UUID.class))).thenReturn(Optional.of(sampleDealer));

        scrapDealerService.deleteDealerById(scrapDealerId, loggedInUserId);

        verify(scrapDealerRepository, times(1)).findById(any(UUID.class));
        verify(scrapDealerRepository, times(1)).delete(any(ScrapDealer.class));
    }

    @Test
    void deleteDealerByIdInvalidUserTest() {
        UUID loggedInUserId = UUID.randomUUID();
        when(scrapDealerRepository.findById(any(UUID.class))).thenReturn(Optional.of(sampleDealer));

        UnauthorizedAccessException exception = assertThrows(
            UnauthorizedAccessException.class, () -> {
                scrapDealerService.deleteDealerById(scrapDealerId, loggedInUserId);
            });

        assertEquals("You are not allowed to delete this scrap dealer", exception.getMessage());
        verify(scrapDealerRepository, times(1)).findById(any(UUID.class));
        verify(scrapDealerRepository, never()).delete(any(ScrapDealer.class));
    }
}
