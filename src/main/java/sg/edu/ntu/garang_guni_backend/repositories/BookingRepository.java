package sg.edu.ntu.garang_guni_backend.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sg.edu.ntu.garang_guni_backend.entities.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
}
