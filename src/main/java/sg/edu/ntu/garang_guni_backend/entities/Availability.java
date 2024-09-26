package sg.edu.ntu.garang_guni_backend.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "availability")
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Available date is required")
    @FutureOrPresent(message = "Available date must be today or in the future")
    private LocalDate availableDate;

    // Many-to-One relationship with Location
    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    // Many-to-One relationship with ScrapDealer
    @ManyToOne
    @JoinColumn(name = "scrap_dealer_id")
    @JsonBackReference
    private ScrapDealer scrapDealer;

    // Constructor to initialize all fields
    public Availability(LocalDate availableDate, Location location, ScrapDealer scrapDealer) {
        this.availableDate = availableDate;
        this.location = location;
        this.scrapDealer = scrapDealer;
    }
}
