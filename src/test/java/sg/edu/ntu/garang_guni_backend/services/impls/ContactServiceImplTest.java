package sg.edu.ntu.garang_guni_backend.services.impls;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.validation.ValidationException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.repositories.ContactRepository;

@SpringBootTest
public class ContactServiceImplTest {

    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    private ContactServiceImpl contactService;

    // helper method to create a sample contact object
    private Contact createSampleContact() {
        Contact contact = new Contact();
        contact.setFirstName("Wong");
        contact.setLastName("Wang");
        contact.setEmail("wong@gmail.com");
        contact.setPhoneNumber("+6598765432");
        contact.setSubject("feedback from wong");
        contact.setMessageContent("This is a wong test feedback.");
        contact.setCaseId(UUID.randomUUID());
        return contact;
    }

    // Test for successful contact creation
    @Test
    public void createContactTest() {
        // Setup
        Contact contact = createSampleContact();
        // Mock repo to return the saved contact
        when(contactRepository.save(contact)).thenReturn(contact); 
        // Execute
        Contact savedContact = contactService.createContact(contact);

        // Assert
        assertEquals(contact.getFirstName(), savedContact.getFirstName());
        assertEquals(contact.getLastName(), savedContact.getLastName());
        assertEquals(contact.getEmail(), savedContact.getEmail());
        assertEquals(contact.getPhoneNumber(), savedContact.getPhoneNumber());
        assertEquals(contact.getSubject(), savedContact.getSubject());
        assertEquals(contact.getMessageContent(), savedContact.getMessageContent());
        verify(contactRepository, times(1)).save(contact);
    }

    // Test for sanitization (removing dangerous content)
    @Test
    public void createContactWithSanitizationTest() {

        Contact contact = createSampleContact();
        contact.setMessageContent("Hello <script>alert('XSS');</script> World!");

        // Mock the repository to return the saved contact after sanitization
        Contact sanitizedContact = createSampleContact();
        sanitizedContact.setMessageContent("Hello  World!");
        when(contactRepository.save(contact)).thenReturn(sanitizedContact);

        // Execute the service call
        Contact savedContact = contactService.createContact(contact);

        // Assert that the sanitized message content has no script tags
        assertEquals("Hello  World!", savedContact.getMessageContent());
        verify(contactRepository, times(1)).save(contact);
    }

    // Test for validation exception when message content is empty after sanitization
    @Test
    public void createContactWithEmptyMessageAfterSanitizationTest() {
        // Setup
        Contact contact = createSampleContact();
        // Content that will be sanitized to empty
        contact.setMessageContent("<script>alert('XSS');</script>"); 
        // Execute and expect ValidationException
        Exception exception = assertThrows(ValidationException.class, () -> {
            contactService.createContact(contact);
        });

        // Assert
        assertEquals("Message content cannot be empty after sanitization", exception.getMessage());
    }

    // Test to retrieve all contacts
    @Test
    public void getAllContactsTest() {
        // Setup
        Contact contact = createSampleContact();
        when(contactRepository.findAll()).thenReturn(List.of(contact));

        // Execute
        List<Contact> contacts = contactService.getAllContacts();

        // Assert
        assertEquals(1, contacts.size(), "Should be 1 contact only in the list.");
        assertEquals(contact.getFirstName(), contacts.get(0).getFirstName());
        assertEquals(contact.getLastName(), contacts.get(0).getLastName());
        assertEquals(contact.getEmail(), contacts.get(0).getEmail());
        assertEquals(contact.getPhoneNumber(), contacts.get(0).getPhoneNumber());
        assertEquals(contact.getSubject(), contacts.get(0).getSubject());
        assertEquals(contact.getMessageContent(), contacts.get(0).getMessageContent());
    }

    // Test for empty contact list, ensuring an empty list is returned
    @Test
    public void getEmptyContactsTest() {
        // Setup - mock an empty list
        when(contactRepository.findAll()).thenReturn(Collections.emptyList());

        // Execute
        List<Contact> contacts = contactService.getAllContacts();

        // Assert
        assertEquals(0, contacts.size(), "This should be an empty list.");
    }
}
