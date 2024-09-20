package sg.edu.ntu.garang_guni_backend.services.impls;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sg.edu.ntu.garang_guni_backend.entities.Image;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.exceptions.item.ItemNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.ItemRepository;
import sg.edu.ntu.garang_guni_backend.services.ImageService;
import sg.edu.ntu.garang_guni_backend.services.ItemService;
import sg.edu.ntu.garang_guni_backend.utils.ImageUtils;

@Service
public class ItemServiceImpl implements ItemService {

    private ItemRepository itemRepository;
    private ImageService imgService;

    public ItemServiceImpl(ItemRepository itemRepository, ImageService imgService) {
        this.itemRepository = itemRepository;
        this.imgService = imgService;
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
    public Item deleteItem(UUID id) {
        Item itemToDelete = itemRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));
        itemRepository.deleteById(id);

        return itemToDelete;
    }

    @Override
    public UUID addImageToItem(UUID id, MultipartFile file) {
        Item selectedItem = itemRepository
                .findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));
        return imgService.uploadImageAndAssignItemId(selectedItem, file);
    }

    @Override
    public List<String> getAllImages(UUID id) {
        Item selectedItem = itemRepository
                .findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));

        return (!selectedItem.getImages().isEmpty())
            ? selectedItem.getImages()
                            .stream()
                            .map(Image::getImageId)
                            .map(imgId -> imgService.getImageById(imgId))
                            .map(ImageUtils::convertBytesArrToBase64)
                            .toList()
            : null;
    }
}
