package sg.edu.ntu.garang_guni_backend.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;

import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.exceptions.ContactProcessingException;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;
import sg.edu.ntu.garang_guni_backend.service.Impl.ContactServiceImpl;

@SpringBootTest
public class ContactServiceImplTest {

    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    ContactServiceImpl contactService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void createContactTest() {
        // setup
        Contact contact = new Contact();
        contact.setFirstName("Wong");
        contact.setEmail("wong@gmail.com");
        contact.setSubject("feedback from wong");
        contact.setMessageContent("This is a wong test feedback.");

        UUID expectedCaseId = UUID.randomUUID(); // create UUID to mock return value
        when(contactRepository.save(contact)).thenReturn(contact); // mock repo to return contact
        when(contact.getCaseId()).thenReturn(expectedCaseId); // mock UUID to be returned when getCaseID called

        // execute
        UUID actualCaseId = contactService.createContact(contact);

        // assert
        assertEquals(expectedCaseId, actualCaseId, "This returned case ID should be match.");

        verify(contactRepository, times(1)).save(contact);
    }

    @Test
    public void getAllContactsTest() {
        // setup
        Contact contact = new Contact();
        contact.setFirstName("Wang");
        contact.setEmail("wang@gmail.com");
        contact.setSubject("feedback from wang");
        contact.setMessageContent("This is a wang test feedback.");

        when(contactRepository.findAll()).thenReturn(List.of(contact));

        // execute
        List<Contact> contacts = contactService.getAllContacts();

        // assert
        assertEquals(1, contacts.size(), "Should be 1 contact only in the list.");
        assertEquals(contact, contacts.get(0), "This contact should match the expected contact.");
    }

    @Test
    public void createContactProcessingFailureTest() {
        // setup
        Contact contact = new Contact();
        contact.setFirstName("Wang");
        contact.setEmail("wang@gmail.com");
        contact.setSubject("Inquiry");
        contact.setMessageContent("This is a test Inquiry.");

        when(contactRepository.save(contact)).thenThrow(new RuntimeException());

        assertThrows(ContactProcessingException.class, () -> {
            contactService.createContact(contact);
        });
    }
}
