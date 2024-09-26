package sg.edu.ntu.garang_guni_backend.services;

import java.util.List;
import sg.edu.ntu.garang_guni_backend.entities.Location;

public interface LocationService {

    Location createLocation(Location location);

    Location updateLocation(Long locationId, Location location);

    Location getLocationById(Long locationId);

    List<Location> getAllLocations();

    void deleteLocation(Long locationId);
}
