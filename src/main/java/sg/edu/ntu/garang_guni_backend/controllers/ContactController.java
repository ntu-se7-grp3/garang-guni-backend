package sg.edu.ntu.garang_guni_backend.controllers;

import jakarta.validation.Valid;
import jakarta.validation.ValidationException;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sg.edu.ntu.garang_guni_backend.entities.Contact;
import sg.edu.ntu.garang_guni_backend.exceptions.ContactNotProcessingException;
import sg.edu.ntu.garang_guni_backend.exceptions.ErrorResponse;
import sg.edu.ntu.garang_guni_backend.services.ContactService;

@RestController
@RequestMapping("/contacts")
public class ContactController {

    @Autowired
    private ContactService contactService;

    public ContactController(final ContactService contactService) {
        this.contactService = contactService;
    }

    //Create contact form
    // @PostMapping({ "", "/" })
    // public ResponseEntity<Contact> createContact(@Valid @RequestBody Contact contact) {
    //     Contact savedContact = contactService.createContact(contact);
    //     return new ResponseEntity<>(savedContact, HttpStatus.CREATED);
    // }

    @PostMapping({ "", "/" })
    public ResponseEntity<?> createContact(@Valid @RequestBody Contact contact) {
        try {
            Contact createdContact = contactService.createContact(contact);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdContact);
        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (ContactNotProcessingException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), LocalDateTime.now());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error occurred while creating contact", e);
        }
    }
    
    // Read all contact forms
    @GetMapping({ "", "/" })
    public ResponseEntity<List<Contact>> getAllContacts() {
        List<Contact> allContacts = contactService.getAllContacts();
        return ResponseEntity.status(HttpStatus.OK).body(allContacts);
    }
}
