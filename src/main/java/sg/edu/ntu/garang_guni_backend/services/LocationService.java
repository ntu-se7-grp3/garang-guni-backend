package sg.edu.ntu.garang_guni_backend.services;

import java.util.List;
import java.util.UUID;
import sg.edu.ntu.garang_guni_backend.entities.Location;

public interface LocationService {
    Location createLocation(Location location);

    Location getLocationById(UUID locationId);

    List<Location> getLocationsWithoutBooking();

    Location updateLocation(UUID locationId, Location updatedLocation);

    Location deleteLocation(UUID locationId);
}
