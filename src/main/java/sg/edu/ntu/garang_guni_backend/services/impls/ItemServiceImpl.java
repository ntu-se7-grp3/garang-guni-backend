package sg.edu.ntu.garang_guni_backend.services.impls;

import java.util.UUID;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.exceptions.item.ItemNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.ItemRepository;
import sg.edu.ntu.garang_guni_backend.services.ItemService;

@Service
public class ItemServiceImpl implements ItemService {

    private ItemRepository itemRepository;

    public ItemServiceImpl(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public Item createItem(Item item) {
        Item cloneItem = Item.builder()
                            .itemName(item.getItemName())
                            .itemDescription(item.getItemDescription())
                            .build();
        itemRepository.save(cloneItem);
        return cloneItem;
    }

    @Override
    public Item getItemById(UUID id) {
        Item retrievedItem = itemRepository.findById(id)
                        .orElseThrow(() -> new ItemNotFoundException(id));
        
        return new Item(retrievedItem);
    }

    @Override
    public Item updateItem(UUID id, Item updatedItem) {
        Item retrievedItem = itemRepository.findById(id)
                        .orElseThrow(() -> new ItemNotFoundException(id));
        
        retrievedItem.setItemName(updatedItem.getItemName());
        retrievedItem.setItemDescription(updatedItem.getItemDescription());
        retrievedItem.setImages(updatedItem.getImages());

        return itemRepository.save(retrievedItem);
    }

    @Override
    public Item deleteImage(UUID id) {
        Item itemToDelete = itemRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));
        itemRepository.deleteById(id);

        return itemToDelete;
    }
}
