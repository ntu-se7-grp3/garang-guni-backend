package sg.edu.ntu.garang_guni_backend.services;

import java.util.List;
import sg.edu.ntu.garang_guni_backend.entities.Contact;

public interface ContactService {
    Contact createContact(Contact contact);

    List<Contact> getAllContacts();
}
