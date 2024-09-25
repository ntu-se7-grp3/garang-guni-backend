package sg.edu.ntu.garang_guni_backend.services.impls;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import sg.edu.ntu.garang_guni_backend.entities.Image;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.exceptions.item.ItemNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.ItemRepository;
import sg.edu.ntu.garang_guni_backend.services.ImageService;

@SpringBootTest
class ItemServiceImplTest {
    @Mock
    private ItemRepository itemRepository;

    @Mock
    private ImageService imgService;

    @InjectMocks
    private ItemServiceImpl itemService;
    private static Item sampleItem;
    private static Item updatedItem;
    private static UUID itemId;
    private static MultipartFile imgFile;
    private static Image steelCanImage;
    private static Image steelCanSideImage;
    private static final String BASE_64_STEEL_CAN_IMG
            = "VGhpcyBpcyBhIFN0ZWVsIGNhbiBpbWFnZQ==";

    @BeforeAll
    static void setup() {
        itemId = UUID.randomUUID();

        sampleItem = Item.builder()
                .itemName("Aluminium Cans")
                .itemDescription("It's a metal can.")
                .build();
        
        steelCanImage = Image.builder()
                        .imageName("Steel Can Photo")
                        .imageType("image/png")
                        .imageData("This is a Steel can image".getBytes())
                        .build();

        steelCanSideImage = Image.builder()
                        .imageName("Steel Can Side Photo")
                        .imageType("image/png")
                        .imageData("This is a Steel can side image".getBytes())
                        .build();
        
        updatedItem = Item.builder()
                .itemName("Steel Cans")
                .itemDescription("It's STILL a metal can.")
                .images(List.of(steelCanImage, steelCanSideImage))
                .build();

        imgFile = new MockMultipartFile("image",
                "test_image.png", 
                "image/png",
                "This is a test image".getBytes());
    }
    
    @DisplayName("Create Item - Successful")
    @Test
    void createItemTest() {
        when(itemRepository.save(sampleItem)).thenReturn(sampleItem);
        
        Item createdItem = itemService.createItem(sampleItem);
        assertNotEquals(sampleItem, createdItem, 
            "The saved Item should NOT be the same as the original Item!");
        assertEquals(sampleItem.getItemName(), createdItem.getItemName(),
            "The name of saved Item should be the same as original!");
        assertEquals(sampleItem.getItemDescription(), createdItem.getItemDescription(),
            "The description of saved Item should be the same as original!");
        verify(itemRepository, times(1)).save(any(Item.class));
    }
    
    @DisplayName("Get Item By Id - Successful")
    @Test
    void getItemByIdTest() {
        when(itemRepository.findById(itemId)).thenReturn(Optional.of(sampleItem));

        Item retrievedItem = itemService.getItemById(itemId);
        assertEquals(sampleItem.getItemName(), retrievedItem.getItemName(),
            "The name of retrieved Item should be the same as original!");
        assertEquals(sampleItem.getItemDescription(), retrievedItem.getItemDescription(),
            "The description of retrieved Item should be the same as original!");
        verify(itemRepository, times(1)).findById(itemId);
    }

    @DisplayName("Get Item By Id - Invalid Id")
    @Test
    void getItemByIdWithNonExistentIdTest() {
        when(itemRepository.findById(itemId)).thenReturn(Optional.empty());

        assertThrows(ItemNotFoundException.class, 
            () -> itemService.getItemById(itemId));
    }

    @DisplayName("Update Item - Successful")
    @Test
    void updateItemTest() {
        when(itemRepository.findById(itemId)).thenReturn(Optional.of(sampleItem));
        when(itemRepository.save(any(Item.class)))
                            .thenAnswer(invocation ->  {
                                return invocation.getArgument(0);
                            });

        Item retrievedUpdatedItem = itemService.updateItem(itemId, updatedItem);
        
        assertNotEquals(updatedItem, retrievedUpdatedItem, 
            "The saved Item should NOT be the same as the updated Item!");
        assertEquals(updatedItem.getItemName(), retrievedUpdatedItem.getItemName(),
            "The name of saved Item should be the same as the updated Item!");
        assertEquals(updatedItem.getItemDescription(), retrievedUpdatedItem.getItemDescription(),
            "The description of saved Item should be the same as the updated Item!");
        assertEquals(updatedItem.getImages().get(0).getImageName(),
                retrievedUpdatedItem.getImages().get(0).getImageName(),
            "The name of saved Item should be same as updated Item!");
        assertEquals(updatedItem.getImages().get(0).getImageType(),
                retrievedUpdatedItem.getImages().get(0).getImageType(),
            "The type of saved Item should be same as updated Item!");
        assertArrayEquals(updatedItem.getImages().get(0).getImageData(),
                retrievedUpdatedItem.getImages().get(0).getImageData(),
            "The data of saved Item should be same as updated Item!");
        verify(itemRepository, times(1)).findById(itemId);
        verify(itemRepository, times(1)).save(any(Item.class));
    }

    @DisplayName("Update Item - Invalid Id")
    @Test
    void updateItemWithNonExistentId() {
        assertThrows(ItemNotFoundException.class,
            () -> itemService.updateItem(itemId, updatedItem));
    }

    @DisplayName("Delete Item - Successful")
    @Test
    void deleteItemTest() {
        when(itemRepository.findById(itemId)).thenReturn(Optional.of(sampleItem));
        
        Item popItem = itemService.deleteItem(itemId);
        assertEquals(popItem, sampleItem);
        verify(itemRepository, times(1)).findById(itemId);
        verify(itemRepository, times(1)).deleteById(itemId);
    }

    @DisplayName("Delete Item - Invalid Id")
    @Test
    void deleteItemWithNonExistentId() {
        when(itemRepository.findById(itemId)).thenReturn(Optional.empty());
        assertThrows(ItemNotFoundException.class, () -> itemService.deleteItem(itemId));
    }

    @DisplayName("Add Image to Item - Successful")
    @Test
    void addImageToItemTest() {
        when(itemRepository.findById(itemId)).thenReturn(Optional.of(sampleItem));
        UUID uploadedImgId = UUID.randomUUID();
        when(imgService.assignItemToNewImage(sampleItem, imgFile))
                .thenReturn(uploadedImgId);

        UUID result = itemService.addNewImageToItem(itemId, imgFile);

        assertEquals(uploadedImgId, result, 
                "The returned ID should match the generated image ID");
        verify(itemRepository, times(1))
                .findById(itemId);
        verify(imgService, times(1))
                .assignItemToNewImage(sampleItem, imgFile);
    }

    @DisplayName("Add Image to Item - Invalid Id")
    @Test
    void addImageToNonExistantItemTest() {
        when(itemRepository.findById(itemId)).thenReturn(Optional.empty());
        assertThrows(ItemNotFoundException.class, 
                () -> itemService.addNewImageToItem(itemId, imgFile));
    }

    @DisplayName("Get All Images - Successful")
    @Test
    void getAllImagesTest() {
        UUID imgId = UUID.randomUUID();
        Item updatedItemMock = mock(Item.class);
        Image steelCanImageMock = mock(Image.class);
        when(itemRepository.findById(itemId)).thenReturn(Optional.of(updatedItemMock));
        when(updatedItemMock.getImages())
            .thenReturn(List.of(steelCanImageMock));
        when(steelCanImageMock.getImageId())
            .thenReturn(imgId);
        when(imgService.getImageById(any(UUID.class)))
            .thenReturn(steelCanImage.getImageData());

        List<String> images = itemService.getAllImages(itemId);
        assertEquals(1, images.size());
        assertTrue(images.stream().anyMatch(image -> 
                image.equals(BASE_64_STEEL_CAN_IMG)));
    }
    
    @DisplayName("Get All Images - Invalid Id")
    @Test
    void getAllImagesFromNonExistantItemTest() {
        when(itemRepository.findById(itemId)).thenReturn(Optional.empty());
        assertThrows(ItemNotFoundException.class, 
                () -> itemService.getAllImages(itemId));
    }
}
