package sg.edu.ntu.garang_guni_backend.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
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
    private UUID id;

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

    public Location getLocation() {
        return (location != null) ? new Location(location) : null;
    }

    public void setLocation(Location location) {
        this.location = (location != null) ? new Location(location) : null;
    }

    public ScrapDealer getScrapDealer() {
        return (scrapDealer != null) ? new ScrapDealer(scrapDealer) : null;
    }

    public void setScrapDealer(ScrapDealer scrapDealer) {
        this.scrapDealer = (scrapDealer != null) ? new ScrapDealer(scrapDealer) : null;
    }
}
