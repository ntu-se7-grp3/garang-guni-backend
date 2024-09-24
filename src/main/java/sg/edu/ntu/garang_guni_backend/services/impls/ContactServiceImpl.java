package sg.edu.ntu.garang_guni_backend.services.impls;

import jakarta.validation.ValidationException;
import java.util.List;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
// import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;
import sg.edu.ntu.garang_guni_backend.services.ContactService;

// @Primary
@Service
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    public ContactServiceImpl(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    // Create
    @Override
    public Contact createContact(Contact contact) {
        //check if any of first or last name exist and email or phone exist
        if ((contact.getFirstName() == null || contact.getFirstName().trim().isEmpty()) 
            && (contact.getLastName() == null || contact.getLastName().trim().isEmpty())) {
            throw new ValidationException("Either first name or last name must be provided.");
        }

        // Check if either email or phoneNumber is provided
        if ((contact.getEmail() == null || contact.getEmail().trim().isEmpty()) 
            && (contact.getPhoneNumber() == null || contact.getPhoneNumber().trim().isEmpty())) {
            throw new ValidationException("Either email or phone number must be provided.");
        }
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
