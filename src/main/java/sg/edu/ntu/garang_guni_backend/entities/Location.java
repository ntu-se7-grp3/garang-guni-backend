package sg.edu.ntu.garang_guni_backend.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Locations")
public class Location {

    public Location(Location locationToBeClone) {
        this(
            locationToBeClone.getLocationId(),
            locationToBeClone.getLocationName(),
            locationToBeClone.getLocationAddress(),
            locationToBeClone.getLatitude(),
            locationToBeClone.getLongitude(),
            locationToBeClone.getCreatedAt(),
            locationToBeClone.getUpdatedAt(),
            locationToBeClone.getBooking()
        );
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "locationId")
    private UUID locationId;

    @NotBlank(message = "Name field is mandatory!")
    @Column(name = "location_name")
    private String locationName;

    @Column(name = "location_address")
    private String locationAddress;

    @NotNull(message = "latitude of a place is mandatory!")
    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @NotNull(message = "longitude of a place is mandatory!")
    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @JsonBackReference
    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL)
    private List<Booking> booking;
}
