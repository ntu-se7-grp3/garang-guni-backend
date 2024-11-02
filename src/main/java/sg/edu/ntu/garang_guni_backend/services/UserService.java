package sg.edu.ntu.garang_guni_backend.services;

import java.util.UUID;
import sg.edu.ntu.garang_guni_backend.entities.User;

public interface UserService {
    User getUser(UUID id);

    User updateUser(UUID id, User user);
}
