package sg.edu.ntu.garang_guni_backend.controllers;

import jakarta.validation.Valid;
import jakarta.validation.ValidationException;
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
import sg.edu.ntu.garang_guni_backend.services.ContactService;

@RestController
@RequestMapping("/contacts")
public class ContactController {

    @Autowired
    private ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    //Create contact form
    // @PostMapping({ "", "/" })
    // public ResponseEntity<Contact> createContact(@Valid @RequestBody Contact contact) {
    //     Contact savedContact = contactService.createContact(contact);
    //     return new ResponseEntity<>(savedContact, HttpStatus.CREATED);
    // }

    @PostMapping({ "", "/" })
    public ResponseEntity<Contact> createContact(@Valid @RequestBody Contact contact) {
        try {
            Contact createdContact = contactService.createContact(contact);
            System.out.println("contact created");
            return new ResponseEntity<>(createdContact, HttpStatus.CREATED);
        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Read all contact forms
    @GetMapping({ "", "/" })
    public ResponseEntity<List<Contact>> getAllContacts() {
        List<Contact> allContacts = contactService.getAllContacts();
        return ResponseEntity.status(HttpStatus.OK).body(allContacts);
    }
}