package sg.edu.ntu.garang_guni_backend.services;

import java.util.List;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import sg.edu.ntu.garang_guni_backend.entities.Booking;
import sg.edu.ntu.garang_guni_backend.entities.Item;

public interface ItemService {
    Item createItem(Item item);

    Item assignBookingToNewItem(Item newItem, Booking booking);

    Item assignBookingToExistingItem(UUID itemId, Booking booking);

    Item getItemById(UUID id);

    Item updateItem(UUID id, Item item);
    
    Item deleteItem(UUID id);

    UUID addNewImageToItem(UUID id, MultipartFile newImage);

    UUID addExistingImageToItem(UUID itemId, UUID imageId);

    List<UUID> addAllNewImageToItem(UUID itemId, List<MultipartFile> images);

    List<String> getAllImages(UUID id);
}
