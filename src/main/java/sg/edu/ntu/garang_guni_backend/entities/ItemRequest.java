package sg.edu.ntu.garang_guni_backend.entities;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ItemRequest {
    @NotBlank(message = "Name for item is mandatory!")
    private String itemName;

    @NotBlank(message = "Description for item is mandatory!")
    private String itemDescription;

    private List<MultipartFile> images;
}
