package sg.edu.ntu.garang_guni_backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.ValidationException;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "contact")
public class Contact {

    @PrePersist
    @PreUpdate
    public void validate() {
        if ((firstName == null || firstName.trim().isEmpty())
            && (lastName == null || lastName.trim().isEmpty())) {
            System.out.println("Validation failed: Both first name and last name are empty");
            throw new ValidationException("Either first name or last name must be provided.");
        }

        if ((phoneNumber == null || phoneNumber.trim().isEmpty())
            && (email == null || email.trim().isEmpty())) {
            System.out.println("Validation failed: Both phone number and email are empty");
            throw new ValidationException("Either phone number or email must be provided.");
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "case_id")
    private UUID caseId;

    @Size(max = 20, message = "First name should not exceed 20 characters")
    @Column(name = "first_name")
    private String firstName;

    @Size(max = 20, message = "Last name should not exceed 20 characters")
    @Column(name = "last_name")
    private String lastName;

    @Pattern(
        regexp = "^\\+65(6\\d{7}|[89]\\d{7})$", 
        message = "Phone number must be in the format +65 followed by 8 digits" 
        + "starting with 6 (landline), 8, or 9 (mobile)")
    @Column(name = "phone_number")
    private String phoneNumber;

    @Email(message = "Email should be valid")
    @Column(name = "email")
    private String email;

    @NotBlank(message = "What you want to complain?")
    @Size(max = 20, message = "Tell me in 20 characters")
    @Column(name = "subject")
    private String subject;

    @NotBlank(message = "Come come, tell me what you beh song")
    @Size(max = 200, message = "Agak agak ok liao hor, only 200 characters")
    @Column(name = "message_content")
    private String messageContent;
}

