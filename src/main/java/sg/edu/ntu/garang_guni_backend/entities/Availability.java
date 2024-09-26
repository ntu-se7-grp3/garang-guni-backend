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

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @ManyToOne
    @JoinColumn(name = "scrap_dealer_id")
    @JsonBackReference
    private ScrapDealer scrapDealer;

    public Availability(LocalDate availableDate, Location location, ScrapDealer scrapDealer) {
        this.availableDate = availableDate;
        this.location = new Location(location);
        this.scrapDealer = new ScrapDealer(scrapDealer);
    }

    public Location getLocation() {
        return new Location(location);
    }

    public void setLocation(Location location) {
        this.location = new Location(location);
    }

    public ScrapDealer getScrapDealer() {
        return new ScrapDealer(scrapDealer);
    }

    public void setScrapDealer(ScrapDealer scrapDealer) {
        this.scrapDealer = new ScrapDealer(scrapDealer);
    }
}
