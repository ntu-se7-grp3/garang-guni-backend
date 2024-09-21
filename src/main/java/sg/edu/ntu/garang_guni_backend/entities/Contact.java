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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "contact")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "case_id")
    private UUID caseId;

    @NotBlank(message = "First name is required")
    @Size(max = 20, message = "First name should not exceed 20 character")
    @Column(name = "first_name")
    private String firstName;

    @Size(max = 20, message = "Last name should not exceed 20 character")
    @Column(name = "last_name")
    private String lastName;

    @Pattern(regexp = "^\\+?[0-9. ()-]{7,12}$", message = "Phone number is invalid")
    @Column(name = "phone_number")
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
}
