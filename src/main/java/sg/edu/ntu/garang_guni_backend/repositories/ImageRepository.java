package sg.edu.ntu.garang_guni_backend.repositories;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import sg.edu.ntu.garang_guni_backend.entities.Image;

public interface ImageRepository extends JpaRepository<Image, UUID> {
    Optional<Image> findByImageName(String fileName);
}
