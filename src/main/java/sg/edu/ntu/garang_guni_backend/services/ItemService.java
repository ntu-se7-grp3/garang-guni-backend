package sg.edu.ntu.garang_guni_backend.services;

import java.util.UUID;
import sg.edu.ntu.garang_guni_backend.entities.Item;

public interface ItemService {
    Item createItem(Item item);

    Item getItemById(UUID id);

    Item updateItem(UUID id, Item item);
    
    Item deleteImage(UUID id);
}
