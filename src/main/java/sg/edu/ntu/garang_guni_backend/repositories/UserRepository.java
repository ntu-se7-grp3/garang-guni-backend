package sg.edu.ntu.garang_guni_backend.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import sg.edu.ntu.garang_guni_backend.entities.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByEmail(String email);

    boolean existsByEmail(String email);
}
