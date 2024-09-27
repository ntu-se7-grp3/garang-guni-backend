package sg.edu.ntu.garang_guni_backend.controllers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sg.edu.ntu.garang_guni_backend.entities.Booking;
import sg.edu.ntu.garang_guni_backend.entities.BookingRequest;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.services.BookingService;


@RestController
@RequestMapping("/bookings")
public class BookingController {

    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private final BookingService bookingService;

    public BookingController(
            @Qualifier("bookingServiceImpl") BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping(value = { "", "/" }, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Booking> createBookingJson(
            @Valid @RequestBody BookingRequest newBookingRequest) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(newBookingRequest));
    }

    @PostMapping(value = { "", "/" }, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Booking> createBookingModelAttr(
            @Valid @ModelAttribute BookingRequest newBookingRequest) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(newBookingRequest));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> getBookingById(@PathVariable UUID bookingId) {
        Booking selectedBooking = bookingService.getBookingById(bookingId);
        
        return ResponseEntity.status(HttpStatus.OK).body(selectedBooking);
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable UUID bookingId,
            @Valid @RequestBody Booking updatedBooking) {
        Booking selectedBooking = 
                bookingService.updateBooking(bookingId, updatedBooking);
        
        return ResponseEntity.status(HttpStatus.OK).body(selectedBooking);
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Booking> deleteBooking(@PathVariable UUID bookingId) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                            .body(bookingService.deleteBooking(bookingId));
    }

    @PostMapping({"/{bookingId}/items", "/{bookingId}/items/"})
    public ResponseEntity<Item> addNewItemToBooking(
            @PathVariable UUID bookingId,
            @Valid @RequestBody Item newItem) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.addNewItemToBooking(bookingId, newItem));
    }

    @PutMapping("/{bookingId}/items/{itemId}")
    public ResponseEntity<Item> addExistingItemToBooking(
            @PathVariable UUID bookingId,
            @PathVariable UUID itemId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(bookingService.addExistingItemToBooking(bookingId, itemId));
    }

    @GetMapping({"/{bookingId}/items", "/{bookingId}/items/"})
    public ResponseEntity<List<Item>> getAllItems(@PathVariable UUID bookingId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(bookingService.getAllItems(bookingId));
    }
}
