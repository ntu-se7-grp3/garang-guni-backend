package sg.edu.ntu.garang_guni_backend.controllers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.services.ItemService;

@RestController
@RequestMapping("/items")
public class ItemController {

    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private final ItemService itemService;

    public ItemController(@Qualifier("itemServiceImpl") ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping({ "", "/" })
    public ResponseEntity<Item> createItem(@Valid @RequestBody Item newItem) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itemService.createItem(newItem));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable UUID id) {
        Item selecetedItem = itemService.getItemById(id);
        return ResponseEntity.status(HttpStatus.OK).body(selecetedItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable UUID id, 
            @Valid @RequestBody Item updatedItem) {
        Item selectedItem = itemService.updateItem(id, updatedItem);
        return ResponseEntity.status(HttpStatus.OK).body(selectedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Item> deleteItem(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                            .body(itemService.deleteItem(id));
    }

    @PostMapping({"/{id}/images", "/{id}/images/"})
    public ResponseEntity<UUID> addNewImageToItem(
            @PathVariable UUID id,
            @RequestParam("image") MultipartFile newImage) {
        UUID newImageId = itemService.addNewImageToItem(id, newImage);
        return ResponseEntity.status(HttpStatus.CREATED).body(newImageId);
    }

    @PutMapping("/{itemId}/images/{imageId}")
    public ResponseEntity<UUID> addExistingImageToItem(
            @PathVariable UUID itemId,
            @PathVariable UUID imageId) {
        UUID newImageId = itemService.addExistingImageToItem(itemId, imageId);
        return ResponseEntity.status(HttpStatus.CREATED).body(newImageId);
    }

    @GetMapping("/{id}/images")
    public ResponseEntity<List<String>> viewAllImages(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(itemService.getAllImages(id));
    }
}
