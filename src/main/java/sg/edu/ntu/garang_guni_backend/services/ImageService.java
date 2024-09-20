package sg.edu.ntu.garang_guni_backend.services;

import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import sg.edu.ntu.garang_guni_backend.entities.Item;

public interface ImageService {
    UUID uploadImage(MultipartFile file);

    UUID uploadImageAndAssignItemId(Item item, MultipartFile file);
    
    byte[] getImageByName(String imageName);

    byte[] getImageById(UUID id);

    UUID updateImage(UUID id, MultipartFile file);
    
    UUID deleteImage(UUID id);
}
