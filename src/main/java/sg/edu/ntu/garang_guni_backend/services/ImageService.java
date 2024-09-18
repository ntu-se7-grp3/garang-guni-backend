package sg.edu.ntu.garang_guni_backend.services;

import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface ImageService {
    UUID uploadImage(MultipartFile file);
    
    byte[] getImageByName(String imageName);

    byte[] getImageById(UUID id);

    UUID updateImage(UUID id, MultipartFile file);
    
    UUID deleteImage(UUID id);
}
