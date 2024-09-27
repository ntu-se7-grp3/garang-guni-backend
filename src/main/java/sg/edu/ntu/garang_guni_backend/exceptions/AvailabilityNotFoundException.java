package sg.edu.ntu.garang_guni_backend.exceptions;

import java.time.LocalDate;
import java.util.UUID;

public class AvailabilityNotFoundException extends RuntimeException {
    public AvailabilityNotFoundException(LocalDate date, UUID locationId) {
        super("Availability of date " + date 
            + " and location id " + locationId + " is not found.");
    }

    public AvailabilityNotFoundException(UUID id) {
        super("Availability ID not found : " + id);
    }
}
