package sg.edu.ntu.garang_guni_backend.services;

import java.util.List;
import java.util.UUID;
import sg.edu.ntu.garang_guni_backend.entities.Booking;
import sg.edu.ntu.garang_guni_backend.entities.Item;

public interface BookingService {
    Booking createBooking(Booking newBooking);

    Booking getBookingById(UUID bookingId);

    Booking updateBooking(UUID bookingId, Booking updatedBooking);

    Booking deleteBooking(UUID bookingId);

    Item addNewItemToBooking(UUID bookingId, Item newItem);
    
    Item addExistingItemToBooking(UUID bookingId, UUID itemId);

    List<Item> getAllItems(UUID bookingId);
}
