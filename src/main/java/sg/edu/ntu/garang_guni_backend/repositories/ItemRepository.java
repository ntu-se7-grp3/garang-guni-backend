package sg.edu.ntu.garang_guni_backend.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sg.edu.ntu.garang_guni_backend.entities.Item;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID> {
}
