package sg.edu.ntu.garang_guni_backend.entities;

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
public class AvailabilityRequest {

    private UUID id;

    @NotNull(message = "Available date is required")
    @FutureOrPresent(message = "Available date must be today or in the future")
    private LocalDate availableDate;

    @NotNull(message = "Location is required")
    private Location location;

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
