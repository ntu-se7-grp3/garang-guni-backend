package sg.edu.ntu.garang_guni_backend.services.impls;

import jakarta.validation.ValidationException;
import java.util.List;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;
import sg.edu.ntu.garang_guni_backend.services.ContactService;

@Service
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    public ContactServiceImpl(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @Override
    public Contact createContact(Contact contact) {
        if ((contact.getFirstName() == null || contact.getFirstName().trim().isEmpty()) 
            && (contact.getLastName() == null || contact.getLastName().trim().isEmpty())) {
            throw new ValidationException("Either first name or last name must be provided.");
        }

        if ((contact.getEmail() == null || contact.getEmail().trim().isEmpty()) 
            && (contact.getPhoneNumber() == null || contact.getPhoneNumber().trim().isEmpty())) {
            throw new ValidationException("Either email or phone number must be provided.");
        }
        String sanitizedMessage = Jsoup.clean(contact.getMessageContent(), Safelist.none());

        if (sanitizedMessage.isEmpty()) {
            throw new ValidationException("Message content cannot be empty after sanitization");
        }

        contact.setMessageContent(sanitizedMessage);
        return contactRepository.save(contact);
    }

    @Override
    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }
}
