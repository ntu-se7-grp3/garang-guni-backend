package sg.edu.ntu.garang_guni_backend.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;
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
@Entity
@Table(name = "availability")
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID availabilityId;

    @NotNull(message = "Available date is required")
    @FutureOrPresent(message = "Available date must be today or in the future")
    private LocalDate availableDate;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    // @ManyToOne
    // @JoinColumn(name = "scrap_dealer_id")
    // @JsonBackReference
    // private ScrapDealer scrapDealer;
}
