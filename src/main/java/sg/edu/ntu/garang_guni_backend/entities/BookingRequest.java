package sg.edu.ntu.garang_guni_backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingRequest {
    @NotBlank(message = "User ID is mandatory!")
    private String userId;

    @NotNull(message = "Booking date and time are mandatory!")
    private LocalDateTime bookingDateTime;

    @NotNull(message = "Appointment date and time are mandatory!")
    private LocalDateTime appointmentDateTime;

    private UUID locationId;

    @Valid
    private List<ItemRequest> items;

    private boolean isLocationSameAsRegistered;

    @NotNull(message = "Collection type is mandatory!")
    @Enumerated(EnumType.STRING)
    @Column(name = "collection_type")
    private CollectionType collectionType;

    @NotNull(message = "Payment method is mandatory!")
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    private String remarks;
}
