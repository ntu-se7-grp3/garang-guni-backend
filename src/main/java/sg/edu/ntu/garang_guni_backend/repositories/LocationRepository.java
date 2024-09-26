package sg.edu.ntu.garang_guni_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sg.edu.ntu.garang_guni_backend.entities.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {
    
}
