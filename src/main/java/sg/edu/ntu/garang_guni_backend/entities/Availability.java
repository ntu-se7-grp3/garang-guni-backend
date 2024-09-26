package sg.edu.ntu.garang_guni_backend.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "scrap_dealer_Availability")
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Location is required")
    @Size(max = 50, message = "Location should not exceed 50 characters")
    private String location;

    @NotNull(message = "Available date is required")
    @FutureOrPresent(message = "Available date must be today or in the future")
    private LocalDate availableDate;

    @ManyToOne
    @JoinColumn(name = "scrap_dealer_id")
    @JsonBackReference
    private ScrapDealer scrapDealer;
}
