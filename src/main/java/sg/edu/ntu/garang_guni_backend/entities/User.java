package sg.edu.ntu.garang_guni_backend.entities;

import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity // Tells Hibernate to make a table out of this class
@Table(name = "my_user") // Tell Hibernate to name the table
public class User {

    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private UUID id;

    @Column(name = "first_name")
    @NotBlank(message = "First name cannot be blank")
    private String firstName;

    @Column(name = "last_name")
    @NotBlank(message = "Last name cannot be blank")
    private String lastName;

    @Column(name = "email")
    @Email(message = "Email format must be valid")
    private String email;

    @Column(name = "password")
    @NotBlank(message = "Password cannot be blank")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$", message = "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character.")
    private String password;

    @Column(name = "role")
    private UserRole role;

    @Column(name = "contact_no")
    @Digits(fraction = 0, integer = 8, message = "Contact Number must be 8 digits")
    private String contactNo;

    @Column(name = "dob")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dob;

    @Column(name = "gender")
    private Gender gender;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "address")
    private String address;

    @Column(name = "floor")
    @Min(value = 1, message = "Floor number must be at least 1")
    private Integer floor;

    @Column(name = "unit_number")
    private Integer unitNumber;
}
