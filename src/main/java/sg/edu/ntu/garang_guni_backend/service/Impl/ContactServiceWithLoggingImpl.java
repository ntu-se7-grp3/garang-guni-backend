package sg.edu.ntu.garang_guni_backend.service.impl;

import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;
import sg.edu.ntu.garang_guni_backend.service.ContactService;

@Service
public class ContactServiceWithLoggingImpl implements ContactService {

    private final Logger logger = LoggerFactory.getLogger(ContactServiceWithLoggingImpl.class);
    private final ContactRepository contactRepository;

    public ContactServiceWithLoggingImpl(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @Override
    public Contact createContact(Contact contact) {
        if (contact.getCaseId() == null) {
            contact.setCaseId(UUID.randomUUID());
        }
        logger.info("Creating contact form with email: {}", contact.getEmail());
        return contactRepository.save(contact);
    }

    @Override
    public List<Contact> getAllContacts() {
        logger.info("Retrieving all contact form");
        return contactRepository.findAll();
    }
}
