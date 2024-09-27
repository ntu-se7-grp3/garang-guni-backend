package sg.edu.ntu.garang_guni_backend.exceptions.location;

import java.time.LocalDate;
import java.util.UUID;

public class LocationNotFoundException extends RuntimeException {
    public LocationNotFoundException() {
        super("Could not find location info or data");
    }

    public LocationNotFoundException(String msg) {
        super(msg);
    }

    public LocationNotFoundException(UUID id) {
        super("Could not find location with UUID: " + id);
    }

    public LocationNotFoundException(LocalDate date) {
        super("Could not find location with date: " + date);
    }
}
