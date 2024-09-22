package sg.edu.ntu.garang_guni_backend.services.impls;

import jakarta.validation.ValidationException;
import java.util.List;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;
import sg.edu.ntu.garang_guni_backend.services.ContactService;

@Primary
@Service
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    public ContactServiceImpl(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    // Create
    @Override
    public Contact createContact(Contact contact) {
        // Sanitize messageContent to remove dangerous HTML
        String sanitizedMessage = Jsoup.clean(contact.getMessageContent(), Safelist.none());

        // If sanitized content becomes empty, throw a validation exception
        if (sanitizedMessage.isEmpty()) {
            throw new ValidationException("Message content cannot be empty after sanitization");
        }

        contact.setMessageContent(sanitizedMessage);
        return contactRepository.save(contact);
    }

    // Read all
    @Override
    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }
}
