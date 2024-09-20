package sg.edu.ntu.garang_guni_backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Entity
@Table(name = "contact")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "caseId")
    private UUID caseId;

    @NotBlank(message = "First name is required")
    @Size(max = 20, message = "First name should not exceed 20 character")
    @Column(name = "first_name")
    private String firstName;

    @Size(max = 20, message = "Last name should not exceed 20 character")
    @Column(name = "last_name")
    private String lastName;

    @Pattern(regexp = "^\\+?[0-9. ()-]{7,12}$", message = "Phone number is invalid")
    @Column(name = "phone_numner")
    private String phoneNumber;

    @Email(message = "Email should be valid")
    @NotEmpty(message = "Email is required")
    @Column(name = "email")
    private String email;

    @NotBlank(message = "What you what to complain?")
    @Size(max = 20, message = "Tell me in 20 character")
    @Column(name = "subject")
    private String subject;

    @NotBlank(message = "Come come, tell me what you beh song")
    @Size(max = 200, message = "Agak agak ok liao hor, only 200 character")
    @Column(name = "message_content")
    private String messageContent;

    public UUID getCaseId() {
        return caseId;
    }

    public void setCaseId(UUID caseId) {
        this.caseId = caseId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessageContent() {
        return messageContent;
    }

    public void setMessageContent(String messageContent) {
        this.messageContent = messageContent;
    }

}
