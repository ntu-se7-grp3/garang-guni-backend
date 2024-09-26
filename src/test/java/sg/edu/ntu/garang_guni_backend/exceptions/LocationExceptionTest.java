package sg.edu.ntu.garang_guni_backend.exceptions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class LocationExceptionTest {

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Test Handling Location Not Found Exception")
    void testHandleLocationNotFoundException() {
        LocationNotFoundException exception = new LocationNotFoundException("Location not found");
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
            .handleLocationNotFound(exception);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Location not found", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Test Handling Unauthorized Access Exception for Location")
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
    @DisplayName("Test Handling Generic Exception for Location")
    void testHandleGenericException() {
        Exception exception = new Exception("Unexpected error occurred");
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
            .handleGenericException(exception);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Unexpected error occurred, please debug", response.getBody().getMessage());
    }
}
