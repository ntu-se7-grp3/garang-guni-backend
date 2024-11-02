package sg.edu.ntu.garang_guni_backend.repositories;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sg.edu.ntu.garang_guni_backend.entities.Image;

@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {
    Optional<Image> findByImageName(String fileName);
}
