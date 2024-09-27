package sg.edu.ntu.garang_guni_backend.controllers;

import jakarta.validation.Valid;
import java.util.List;
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

    private ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping({ "", "/" })
    public ResponseEntity<Contact> createContact(@Valid @RequestBody Contact contact) {
        Contact createdContact = contactService.createContact(contact);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdContact);
    }
    
    @GetMapping({ "", "/" })
    public ResponseEntity<List<Contact>> getAllContacts() {
        List<Contact> allContacts = contactService.getAllContacts();
        return ResponseEntity.status(HttpStatus.OK).body(allContacts);
    }
}
