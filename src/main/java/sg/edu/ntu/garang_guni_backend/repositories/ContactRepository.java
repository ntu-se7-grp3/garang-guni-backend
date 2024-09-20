package sg.edu.ntu.garang_guni_backend.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import sg.edu.ntu.garang_guni_backend.entities.Contact;

public interface ContactRepository extends JpaRepository<Contact, UUID> {

}
