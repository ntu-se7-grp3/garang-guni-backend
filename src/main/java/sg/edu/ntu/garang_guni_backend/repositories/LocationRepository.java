package sg.edu.ntu.garang_guni_backend.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sg.edu.ntu.garang_guni_backend.entities.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {
}
