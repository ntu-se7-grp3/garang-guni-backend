package sg.edu.ntu.garang_guni_backend.controllers;

import static org.springframework.http.MediaType.IMAGE_PNG_VALUE;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import sg.edu.ntu.garang_guni_backend.services.ImageService;


@RestController
@RequestMapping("/images")
public class ImageController {
    private ImageService imgService;

    public ImageController(@Qualifier("imageServiceImpl") ImageService imgService) {
        this.imgService = imgService;
    }

    @PostMapping({ "", "/" })
    public ResponseEntity<UUID> uploadImage(@RequestParam("image") MultipartFile newImage) {
        return ResponseEntity.status(HttpStatus.CREATED).body(imgService.uploadImage(newImage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImageById(@PathVariable UUID id) {
        byte[] imageData = imgService.getImageById(id);
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.valueOf(IMAGE_PNG_VALUE))
                .body(imageData);
    }

    @GetMapping({ "", "/" })
    public ResponseEntity<byte[]> getImageByName(@RequestParam(required = false) String fileName) {
        if (fileName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        byte[] imageData = imgService.getImageByName(fileName);
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.valueOf(IMAGE_PNG_VALUE))
                .body(imageData);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UUID> updateImage(@PathVariable UUID id, 
            @RequestParam("image") MultipartFile newImage) {
        UUID uuid = imgService.updateImage(id, newImage);
        return ResponseEntity.status(HttpStatus.OK).body(uuid);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<UUID> deleteImage(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                            .body(imgService.deleteImage(id));
    }
}
