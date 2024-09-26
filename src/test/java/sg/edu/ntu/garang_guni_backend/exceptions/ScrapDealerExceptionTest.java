package sg.edu.ntu.garang_guni_backend.exceptions;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import sg.edu.ntu.garang_guni_backend.services.ScrapDealerService;

public class ScrapDealerExceptionTest {

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    @Mock
    private ScrapDealerService scrapDealerService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Test Handling ScrapDealer Not Found Exception")
    void testHandleScrapDealerNotFoundException() {
        ScrapDealerNotFoundException exception = new ScrapDealerNotFoundException(
            "Scrap dealer not found");
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
            .handleScrapDealerNotFound(exception);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Scrap dealer not found", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Test Handling Unauthorized Access Exception for ScrapDealer")
    void testHandleUnauthorizedAccessException() {
        UnauthorizedAccessException exception = new UnauthorizedAccessException(
            "Unauthorized access");
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
            .handleUnauthorizedAccess(exception);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Unauthorized access", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Test Handling Generic Exception for ScrapDealer")
    void testHandleGenericException() {
        Exception exception = new Exception("Unexpected error occurred");
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
            .handleGenericException(exception);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Unexpected error occurred, please debug", response.getBody().getMessage());
    }
}
