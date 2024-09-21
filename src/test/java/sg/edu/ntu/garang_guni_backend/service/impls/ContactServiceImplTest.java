package sg.edu.ntu.garang_guni_backend.service.impls;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;
import sg.edu.ntu.garang_guni_backend.service.impl.ContactServiceImpl;

@SpringBootTest
public class ContactServiceImplTest {

    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    ContactServiceImpl contactService;

    // helper method to create a sample contact object
    private Contact createSampleContact() {
        Contact contact = new Contact();
        contact.setFirstName("Wong");
        contact.setLastName("wang");
        contact.setEmail("wong@gmail.com");
        contact.setPhoneNumber("1234567890");
        contact.setSubject("feedback from wong");
        contact.setMessageContent("This is a wong test feedback.");
        contact.setCaseId(UUID.randomUUID());
        return contact;
    }

    // test for successful create contact
    @Test
    public void createContactTest() {
        // setup
        Contact contact = createSampleContact();
        when(contactRepository.save(contact)).thenReturn(contact); // mock repo to return contact

        // execute
        Contact savedContact = contactService.createContact(contact);

        // assert
        assertEquals(contact, savedContact, "This returned contact should be match.");
        verify(contactRepository, times(1)).save(contact);
    }

    // test to retrieve all contact
    @Test
    public void getAllContactsTest() {
        // setup
        Contact contact = createSampleContact();
        when(contactRepository.findAll()).thenReturn(List.of(contact));

        // execute
        List<Contact> contacts = contactService.getAllContacts();

        // assert
        assertEquals(1, contacts.size(), "Should be 1 contact only in the list.");
        assertEquals(contact, contacts.get(0), "This contact should match the expected contact.");
    }

    // test empty contact list, verify empty list is returned
    @Test
    public void getEmptyContactsTest() {
        // setup - mock an empty list
        when(contactRepository.findAll()).thenReturn(Collections.emptyList());

        // execute
        List<Contact> contacts = contactService.getAllContacts();

        // assert
        assertEquals(0, contacts.size(), "This should be empty list.");
    }
}
