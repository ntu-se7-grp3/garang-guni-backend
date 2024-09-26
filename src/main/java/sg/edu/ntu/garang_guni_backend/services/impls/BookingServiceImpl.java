package sg.edu.ntu.garang_guni_backend.services.impls;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sg.edu.ntu.garang_guni_backend.entities.Booking;
import sg.edu.ntu.garang_guni_backend.entities.BookingRequest;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.entities.ItemRequest;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.exceptions.booking.BookingNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.BookingRepository;
import sg.edu.ntu.garang_guni_backend.services.BookingService;
import sg.edu.ntu.garang_guni_backend.services.ItemService;
import sg.edu.ntu.garang_guni_backend.services.LocationService;

@Service
public class BookingServiceImpl implements BookingService {

    private BookingRepository bookingRepository;
    
    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private ItemService itemService;

    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private LocationService locationService;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            ItemService itemService,
            @Lazy LocationService locationService) {
        this.bookingRepository = bookingRepository;
        this.itemService = itemService;
        this.locationService = locationService;
    }
    
    @Override
    @Transactional
    public Booking createBooking(BookingRequest newBookingRequest) {
        Booking cloneBooking = Booking.builder()
                .userId(newBookingRequest.getUserId())
                .bookingDateTime(newBookingRequest.getBookingDateTime())
                .appointmentDateTime(newBookingRequest.getAppointmentDateTime())
                .isLocationSameAsRegistered(newBookingRequest.isLocationSameAsRegistered())
                .collectionType(newBookingRequest.getCollectionType())
                .paymentMethod(newBookingRequest.getPaymentMethod())
                .remarks(newBookingRequest.getRemarks())
                .build();
        
        boolean hasItems = newBookingRequest.getItems() != null;
        boolean hasLocationId = newBookingRequest.getLocationId() != null;
        Booking createdBooking = bookingRepository.save(cloneBooking);

        if (hasItems) {
            List<ItemRequest> newItems = newBookingRequest.getItems();
            List<UUID> createdItemsId = createItemsAndLinkImgs(newItems);
            linkItemsWithBooking(createdBooking.getBookingId(), createdItemsId);
        }

        if (hasLocationId) {
            locationService.addExisitingBookingToLocation(
                newBookingRequest.getLocationId(), createdBooking.getBookingId());
        }
        
        return new Booking(createdBooking);
    }

    private List<Item> linkItemsWithBooking(UUID bookingId, List<UUID> itemsId) {
        List<Item> linkedItems = new ArrayList<>();
        for (UUID itemId : itemsId) {
            linkedItems.add(addExistingItemToBooking(bookingId, itemId));
        }

        return linkedItems;
    }

    private List<UUID> createItemsAndLinkImgs(List<ItemRequest> newItems) {
        List<UUID> createdItemsId = new ArrayList<>();
        for (ItemRequest newItemRequest : newItems) {
            Item newItem = Item.builder()
                            .itemName(newItemRequest.getItemName())
                            .itemDescription(newItemRequest.getItemDescription())
                            .build();

            Item itemCreated = itemService.createItem(newItem);
            createdItemsId.add(itemCreated.getItemId());

            if (newItemRequest.getImages() != null 
                    && !newItemRequest.getImages().isEmpty()) {
                List<MultipartFile> imageFiles = newItemRequest.getImages();
                itemService.addAllNewImageToItem(
                        itemCreated.getItemId(), imageFiles);
            }
        }
        
        return createdItemsId;
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

    @Override
    public Booking assignLocationToNewBooking(Booking newBooking,
            Location selectedLocation) {
        Booking cloneBooking = Booking.builder()
                .userId(newBooking.getUserId())
                .bookingDateTime(newBooking.getBookingDateTime())
                .appointmentDateTime(newBooking.getAppointmentDateTime())
                .isLocationSameAsRegistered(newBooking.isLocationSameAsRegistered())
                .collectionType(newBooking.getCollectionType())
                .paymentMethod(newBooking.getPaymentMethod())
                .remarks(newBooking.getRemarks())
                .build();
        cloneBooking.setLocation(selectedLocation);
        return new Booking(bookingRepository.save(cloneBooking));
    }

    @Override
    public Booking assignLocationToExistingBooking(UUID bookingId,
            Location selectedLocation) {
        Booking selectedBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        selectedBooking.setLocation(selectedLocation);
        return new Booking(bookingRepository.save(selectedBooking));
    }
}
