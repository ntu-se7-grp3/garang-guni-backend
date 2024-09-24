package sg.edu.ntu.garang_guni_backend.entities;

import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    @OneToMany(mappedBy = "scrapDealer", cascade = CascadeType.ALL)
    private List<Availability> availabilityList;
}

//i use this scrapdealer id and name to deperate them if got many teams