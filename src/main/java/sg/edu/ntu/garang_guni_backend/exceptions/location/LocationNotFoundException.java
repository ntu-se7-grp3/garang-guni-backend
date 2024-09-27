package sg.edu.ntu.garang_guni_backend.exceptions.location;

import java.util.UUID;

public class LocationNotFoundException extends RuntimeException {
    public LocationNotFoundException(UUID id) {
        super("Could not find location with UUID: " + id);
    }
}
