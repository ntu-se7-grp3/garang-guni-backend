package sg.edu.ntu.garang_guni_backend.exceptions.image;

import java.util.UUID;

public class ImageNotFoundException extends RuntimeException {
    public ImageNotFoundException(String name) {
        super("Could not find image with name: " + name);
    }

    public ImageNotFoundException(UUID id) {
        super("Could not find image with UUID: " + id);
    }
}
