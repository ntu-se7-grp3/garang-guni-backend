package sg.edu.ntu.garang_guni_backend.service.Impl;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.exceptions.ContactProcessingException;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;
import sg.edu.ntu.garang_guni_backend.service.ContactService;

@Service
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    @Autowired
    private ContactServiceImpl(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @Override
    public UUID createContact(Contact contact) {
        try {
            return contactRepository.save(contact).getCaseId();
        } catch (Exception ex) {
            throw new ContactProcessingException("Failed to process the contact request");
        }
    }

    @Override
    public List<Contact> getAllContacts() {
        try {
            return contactRepository.findAll();
        } catch (Exception ex) {
            throw new ContactProcessingException("Failed to retrieve contact records.");
        }

    }
}
