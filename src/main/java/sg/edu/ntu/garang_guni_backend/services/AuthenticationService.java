package sg.edu.ntu.garang_guni_backend.services;

import sg.edu.ntu.garang_guni_backend.entities.LoginRequest;
import sg.edu.ntu.garang_guni_backend.entities.User;

public interface AuthenticationService {
    User signup(User user);

    User authenticate(LoginRequest login);
}
