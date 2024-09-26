package sg.edu.ntu.garang_guni_backend.services.impls;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sg.edu.ntu.garang_guni_backend.entities.Booking;
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
    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private ImageService imgService;

    public ItemServiceImpl(ItemRepository itemRepository, ImageService imgService) {
        this.itemRepository = itemRepository;
        this.imgService = imgService;
    }

    @Override
    public Item createItem(Item item) {
        Item createdItem = createItemBase(item);
        itemRepository.save(createdItem);
        return new Item(createdItem);
    }

    @Override
    public Item assignBookingToNewItem(Item newItem, Booking booking) {
        Item createdItem = createItemBase(newItem);
        createdItem.setBooking(booking);
        itemRepository.save(createdItem);

        return new Item(createdItem);
    }

    @Override
    public Item assignBookingToExistingItem(UUID itemId, Booking booking) {
        Item retrievedItem = itemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException(itemId));
        retrievedItem.setBooking(booking);

        return new Item(itemRepository.save(retrievedItem));
    }

    private Item createItemBase(Item item) {
        return Item.builder()
                .itemName(item.getItemName())
                .itemDescription(item.getItemDescription())
                .build();
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

        return new Item(itemRepository.save(retrievedItem));
    }

    @Override
    public Item deleteItem(UUID id) {
        Item itemToDelete = itemRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));
        itemRepository.deleteById(id);

        return itemToDelete;
    }

    @Override
    public UUID addNewImageToItem(UUID itemId, MultipartFile file) {
        Item selectedItem = itemRepository
                .findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException(itemId));
        return imgService.assignItemToNewImage(selectedItem, file);
    }

    @Override
    public UUID addExistingImageToItem(UUID itemId, UUID imageId) {
        Item selectedItem = itemRepository
                .findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException(itemId));
        return imgService.assignItemToExistingImage(selectedItem, imageId);
    }

    @Override
    public List<UUID> addAllNewImageToItem(UUID itemId, List<MultipartFile> files) {
        List<UUID> allImgIds = new ArrayList<>();
        for (MultipartFile file : files) {
            allImgIds.add(addNewImageToItem(itemId, file));
        }
        return allImgIds;
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

    @Override
    public List<Image> getAllImagesDetails(UUID id) {
        Item selectedItem = itemRepository
                .findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));

        return (!selectedItem.getImages().isEmpty())
            ? selectedItem.getImages()
                            .stream()
                            .map(Image::new)
                            .toList()
            : null;
    }
}
