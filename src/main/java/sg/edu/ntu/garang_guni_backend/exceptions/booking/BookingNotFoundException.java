package sg.edu.ntu.garang_guni_backend.exceptions.booking;

import java.util.UUID;

public class BookingNotFoundException extends RuntimeException {
    public BookingNotFoundException(UUID id) {
        super("Could not find booking with UUID: " + id);
    }
}
