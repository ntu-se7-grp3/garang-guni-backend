package sg.edu.ntu.garang_guni_backend.services.impls;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import sg.edu.ntu.garang_guni_backend.entities.Booking;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.exceptions.booking.BookingNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.BookingRepository;
import sg.edu.ntu.garang_guni_backend.services.BookingService;
import sg.edu.ntu.garang_guni_backend.services.ItemService;

@Service
public class BookingServiceImpl implements BookingService {

    private BookingRepository bookingRepository;
    
    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private ItemService itemService;

    public BookingServiceImpl(BookingRepository bookingRepository,
            ItemService itemService) {
        this.bookingRepository = bookingRepository;
        this.itemService = itemService;
    }

    @Override
    public Booking createBooking(Booking newBooking) {
        Booking cloneBooking = Booking.builder()
                .userId(newBooking.getUserId())
                .bookingDateTime(newBooking.getBookingDateTime())
                .appointmentDateTime(newBooking.getAppointmentDateTime())
                .isLocationSameAsRegistered(newBooking.isLocationSameAsRegistered())
                .collectionType(newBooking.getCollectionType())
                .paymentMethod(newBooking.getPaymentMethod())
                .remarks(newBooking.getRemarks())
                .build();
        return bookingRepository.save(cloneBooking);
    }

    @Override
    public Booking getBookingById(UUID bookingId) {
        Booking retrievedBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        
        return new Booking(retrievedBooking);
    }

    @Override
    public Booking updateBooking(UUID bookingId, Booking updatedBooking) {
        Booking bookingToUpdate = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        
        bookingToUpdate.setUserId(updatedBooking.getUserId());
        bookingToUpdate.setBookingDateTime(updatedBooking.getBookingDateTime());
        bookingToUpdate.setAppointmentDateTime(updatedBooking.getAppointmentDateTime());
        bookingToUpdate.setLocationSameAsRegistered(
                updatedBooking.isLocationSameAsRegistered());
        bookingToUpdate.setCollectionType(updatedBooking.getCollectionType());
        bookingToUpdate.setPaymentMethod(updatedBooking.getPaymentMethod());
        bookingToUpdate.setRemarks(updatedBooking.getRemarks());

        return new Booking(bookingRepository.save(bookingToUpdate));
    }

    @Override
    public Booking deleteBooking(UUID bookingId) {
        Booking bookingToDelete = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        bookingRepository.deleteById(bookingId);

        return bookingToDelete;
    }

    @Override
    public Item addNewItemToBooking(UUID bookingId, Item newItem) {
        Booking selectedBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        return itemService.assignBookingToNewItem(newItem, selectedBooking);
    }

    @Override
    public Item addExistingItemToBooking(UUID bookingId, UUID itemId) {
        Booking selectedBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        return itemService.assignBookingToExistingItem(itemId, selectedBooking);
    }

    @Override
    public List<Item> getAllItems(UUID bookingId) {
        Booking selectedBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        return (!selectedBooking.getItems().isEmpty())
            ? selectedBooking.getItems()
                            .stream()
                            .map(Item::new)
                            .toList()
            : null;
    }
}
