package sg.edu.ntu.garang_guni_backend.services.impls;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
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
import sg.edu.ntu.garang_guni_backend.entities.Image;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.exceptions.item.ItemNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.ItemRepository;

@SpringBootTest
class ItemServiceImplTest {
    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private ItemServiceImpl itemService;
    private static Item sampleItem;
    private static Item updatedItem;
    private static UUID id;

    @BeforeAll
    static void setup() {
        id = UUID.randomUUID();

        sampleItem = Item.builder()
                .itemName("Aluminium Cans")
                .itemDescription("It's a metal can.")
                .build();
        
        Image steelCanImage = Image.builder()
                        .imageName("Steel Can Photo")
                        .imageType("image/png")
                        .imageData("This is a Steel can image".getBytes())
                        .build();

        Image steelCanSideImage = Image.builder()
                        .imageName("Steel Can Side Photo")
                        .imageType("image/png")
                        .imageData("This is a Steel can side image".getBytes())
                        .build();
        
        updatedItem = Item.builder()
                .itemName("Steel Cans")
                .itemDescription("It's STILL a metal can.")
                .images(List.of(steelCanImage, steelCanSideImage))
                .build();
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
        when(itemRepository.findById(id)).thenReturn(Optional.of(sampleItem));

        Item retrievedItem = itemService.getItemById(id);
        assertEquals(sampleItem.getItemName(), retrievedItem.getItemName(),
            "The name of retrieved Item should be the same as original!");
        assertEquals(sampleItem.getItemDescription(), retrievedItem.getItemDescription(),
            "The description of retrieved Item should be the same as original!");
        verify(itemRepository, times(1)).findById(id);
    }

    @DisplayName("Get Item By Id - Invalid Id")
    @Test
    void getItemByIdWithNonExistentIdTest() {
        when(itemRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ItemNotFoundException.class, 
            () -> itemService.getItemById(id));
    }

    @DisplayName("Update Item - Successful")
    @Test
    void updateItemTest() {
        when(itemRepository.findById(id)).thenReturn(Optional.of(sampleItem));
        when(itemRepository.save(any(Item.class)))
                            .thenAnswer(invocation ->  {
                                return invocation.getArgument(0);
                            });

        Item retrievedUpdatedItem = itemService.updateItem(id, updatedItem);
        
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
        verify(itemRepository, times(1)).findById(id);
        verify(itemRepository, times(1)).save(any(Item.class));
    }

    @DisplayName("Update Item - Invalid Id")
    @Test
    void updateItemWithNonExistentId() {
        assertThrows(ItemNotFoundException.class,
            () -> itemService.updateItem(id, updatedItem));
    }

    @DisplayName("Delete Item - Successful")
    @Test
    void deleteItemTest() {
        when(itemRepository.findById(id)).thenReturn(Optional.of(sampleItem));
        
        Item popItem = itemService.deleteItem(id);
        assertEquals(popItem, sampleItem);
        verify(itemRepository, times(1)).findById(id);
        verify(itemRepository, times(1)).deleteById(id);
    }

    @DisplayName("Delete Item - Invalid Id")
    @Test
    void deleteItemWithNonExistentId() {
        when(itemRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ItemNotFoundException.class, () -> itemService.deleteItem(id));
    }
}
