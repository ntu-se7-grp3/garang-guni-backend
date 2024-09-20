package sg.edu.ntu.garang_guni_backend.service;

import java.util.List;
import java.util.UUID;
import sg.edu.ntu.garang_guni_backend.entities.Contact;

public interface ContactService {
    Contact createContact(Contact contact);

    List<Contact> getAllContacts();
}
