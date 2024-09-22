package sg.edu.ntu.garang_guni_backend.services.impls;

import jakarta.validation.ValidationException;
import java.util.List;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;
import sg.edu.ntu.garang_guni_backend.services.ContactService;

@Service
public class ContactServiceWithLoggingImpl implements ContactService {

    private final Logger logger = LoggerFactory.getLogger(ContactServiceWithLoggingImpl.class);
    private final ContactRepository contactRepository;

    public ContactServiceWithLoggingImpl(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    // Create
    @Override
    public Contact createContact(Contact contact) {
        logger.info("Creating contact form with email: {}", contact.getEmail());
        
        // Sanitize messageContent to remove dangerous HTML
        String sanitizedMessage = Jsoup.clean(contact.getMessageContent(), Safelist.none());
        
        logger.info("Sanitized message content: {}", sanitizedMessage); // Log sanitized message

        // If sanitized content becomes empty, throw a validation exception
        if (sanitizedMessage.isEmpty()) {
            logger.error("Message content is empty after sanitization for contact with email: {}", 
                    contact.getEmail());
            throw new ValidationException("Message content cannot be empty after sanitization");
        }

        contact.setMessageContent(sanitizedMessage);
        return contactRepository.save(contact);
    }

    @Override
    public List<Contact> getAllContacts() {
        logger.info("Retrieving all contact forms");
        return contactRepository.findAll();
    }
}
