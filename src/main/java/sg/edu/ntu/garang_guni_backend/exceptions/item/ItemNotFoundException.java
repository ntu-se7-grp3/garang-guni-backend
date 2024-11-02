package sg.edu.ntu.garang_guni_backend.exceptions.item;

import java.util.UUID;

public class ItemNotFoundException extends RuntimeException {
    public ItemNotFoundException(UUID id) {
        super("Could not find item with UUID: " + id);
    }
}
