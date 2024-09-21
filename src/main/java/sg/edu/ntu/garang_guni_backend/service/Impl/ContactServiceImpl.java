package sg.edu.ntu.garang_guni_backend.service.impl;

import java.util.List;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;
import sg.edu.ntu.garang_guni_backend.service.ContactService;

@Primary
@Service
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    public ContactServiceImpl(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    // create
    @Override
    public Contact createContact(Contact contact) {
        return contactRepository.save(contact);
    }

    // read all
    @Override
    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }
}
