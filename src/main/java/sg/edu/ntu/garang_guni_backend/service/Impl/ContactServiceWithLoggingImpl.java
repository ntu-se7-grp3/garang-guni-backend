package sg.edu.ntu.garang_guni_backend.service.Impl;

import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.exceptions.ContactProcessingException;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;
import sg.edu.ntu.garang_guni_backend.service.ContactService;

@Primary
@Service
public class ContactServiceWithLoggingImpl implements ContactService {

    private final Logger logger = LoggerFactory.getLogger(ContactServiceWithLoggingImpl.class);
    private final ContactRepository contactRepository;

    public ContactServiceWithLoggingImpl(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    // @Override
    // public UUID createContact(Contact contact) {
    // logger.info("Creating contact form with email: {}", contact.getEmail());
    // try {
    // UUID caseId = contactService.createContact(contact);
    // logger.info("Contact created with Case ID: {}", caseId);
    // return caseId;
    // } catch (ContactProcessingException ex) {
    // logger.error("Error creating contact form: ", ex);
    // throw ex; // throw bacl to global exception handler
    // } catch (Exception ex) {
    // logger.error("Unexpected error creating contact form: ", ex);
    // throw new ContactProcessingException("Failed to process the request due to
    // unexpected error.");
    // }

    // }
    @Override
    public Contact createContact(Contact contact) {
        logger.info("Creating contact form with email: {}", contact.getEmail());
        return contactRepository.save(contact);
    }

    @Override
    public List<Contact> getAllContacts() {
        logger.info("Retrieving all contact form");
        try {
            List<Contact> contacts = contactRepository.findAll();
            logger.info("Retrieved all contact form {}", contacts.size());
            return contacts;
        } catch (ContactProcessingException ex) {
            logger.error("Error retrieving contact form: ", ex);
            throw ex; // throw bacl to global exception handler
        }
    }
}
