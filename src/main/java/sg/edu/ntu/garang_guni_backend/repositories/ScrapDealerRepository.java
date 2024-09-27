package sg.edu.ntu.garang_guni_backend.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;

public interface ScrapDealerRepository extends JpaRepository<ScrapDealer, UUID> {
}
