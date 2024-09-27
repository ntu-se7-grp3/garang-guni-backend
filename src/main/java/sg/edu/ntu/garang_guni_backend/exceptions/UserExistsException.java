package sg.edu.ntu.garang_guni_backend.exceptions;

public class UserExistsException extends RuntimeException {
    public UserExistsException(String email) {
        super(email + " already exists");
    }
}
