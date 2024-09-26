package sg.edu.ntu.garang_guni_backend.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "scrap_dealer")
public class ScrapDealer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "scrap_dealer_id")
    private UUID scrapDealerId;

    @Size(max = 20, message = "First name should not exceed 20 characters")
    @NotBlank(message = "First name is required")
    @Column(name = "first_name")
    private String firstName;

    @Size(max = 20, message = "Last name should not exceed 20 characters")
    @NotBlank(message = "Last name is required")
    @Column(name = "last_name")
    private String lastName;

    @Email(message = "Email format must be valid")
    @NotBlank(message = "Email is required")
    @Column(name = "email", unique = true)
    private String email;

    @Pattern(regexp = "^\\+65[689]\\d{7}$", message = "Phone number must be in the format +65 "
        + "followed by 8 digits starting with 6, 8, or 9")
    @NotBlank(message = "Phone number is required")
    @Column(name = "phone_number")
    private String phoneNumber;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "scrapDealer", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Availability> availabilityList = new ArrayList<>();

    public ScrapDealer(ScrapDealer scrapDealer) {
        this.scrapDealerId = scrapDealer.getScrapDealerId();
        this.firstName = scrapDealer.getFirstName();
        this.lastName = scrapDealer.getLastName();
        this.email = scrapDealer.getEmail();
        this.phoneNumber = scrapDealer.getPhoneNumber();
        this.availabilityList = new ArrayList<>(scrapDealer.getAvailabilityList());
    }

    public List<Availability> getAvailabilityList() {
        return new ArrayList<>(availabilityList);
    }

    public void setAvailabilityList(List<Availability> availabilityList) {
        this.availabilityList = new ArrayList<>(availabilityList);
    }
}
