package sg.edu.ntu.garang_guni_backend.exceptions;

import java.util.UUID;

public class DateNotFoundException extends RuntimeException {
    public DateNotFoundException(UUID locationId) {
        super("Date with location id  " + locationId + " is not found.");
    }
}
