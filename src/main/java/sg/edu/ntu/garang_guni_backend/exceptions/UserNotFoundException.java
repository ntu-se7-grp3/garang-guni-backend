package sg.edu.ntu.garang_guni_backend.exceptions;

import java.util.UUID;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(UUID id) {
        super("Could not find user with id: " + id);
    }
}
