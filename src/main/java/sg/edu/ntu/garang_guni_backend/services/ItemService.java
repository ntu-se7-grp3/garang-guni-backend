package sg.edu.ntu.garang_guni_backend.services;

import java.util.List;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import sg.edu.ntu.garang_guni_backend.entities.Item;

public interface ItemService {
    Item createItem(Item item);

    Item getItemById(UUID id);

    Item updateItem(UUID id, Item item);
    
    Item deleteItem(UUID id);

    UUID addImageToItem(UUID id, MultipartFile newImage);

    List<String> getAllImages(UUID id);
}
