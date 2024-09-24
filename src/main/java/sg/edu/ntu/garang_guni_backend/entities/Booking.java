package sg.edu.ntu.garang_guni_backend.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "booking")
public class Booking {

    public Booking(Booking bookingToBeClone) {
        this(
            bookingToBeClone.getBookingId(),
            bookingToBeClone.getUserId(),
            bookingToBeClone.getBookingDate(),
            bookingToBeClone.getPickupDate(),
            bookingToBeClone.getLocation(),
            bookingToBeClone.getItem(),
            bookingToBeClone.isCollectionAddressSameAsRegistered(),
            bookingToBeClone.getCollectionType(),
            bookingToBeClone.getPaymentMethod(),
            bookingToBeClone.getRemarks()
        );
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "bookingId")
    private UUID bookingId;

    private String userId;

    private LocalDateTime bookingDate;

    private LocalDateTime pickupDate;

    @ManyToOne
    @JoinColumn(name = "locationId", referencedColumnName = "locationId")
    private Location location;

    @JsonBackReference
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    private List<Item> item;

    private boolean isCollectionAddressSameAsRegistered;

    @Enumerated(EnumType.STRING)
    @Column(name = "collection_type")
    private CollectionType collectionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    private String remarks;

}
