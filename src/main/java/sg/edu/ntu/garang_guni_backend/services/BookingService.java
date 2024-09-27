package sg.edu.ntu.garang_guni_backend.services;

import java.util.List;
import java.util.UUID;
import sg.edu.ntu.garang_guni_backend.entities.Booking;
import sg.edu.ntu.garang_guni_backend.entities.BookingRequest;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.entities.Location;

public interface BookingService {
    Booking createBooking(BookingRequest newBookingRequest);

    Booking getBookingById(UUID bookingId);

    Booking updateBooking(UUID bookingId, Booking updatedBooking);

    Booking deleteBooking(UUID bookingId);

    Item addNewItemToBooking(UUID bookingId, Item newItem);
    
    Item addExistingItemToBooking(UUID bookingId, UUID itemId);

    List<Item> getAllItems(UUID bookingId);

    Booking assignLocationToNewBooking(Booking newBooking, Location location);

    Booking assignLocationToExistingBooking(UUID bookingId, Location location);
}
