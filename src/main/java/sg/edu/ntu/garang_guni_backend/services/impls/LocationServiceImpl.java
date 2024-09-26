package sg.edu.ntu.garang_guni_backend.services.impls;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.exceptions.LocationNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.LocationRepository;
import sg.edu.ntu.garang_guni_backend.services.LocationService;

@Service
public class LocationServiceImpl implements LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Override
    public Location createLocation(Location location) {
        return locationRepository.save(location);
    }

    @Override
    public Location updateLocation(Long locationId, Location location) {
        Location existingLocation = getLocationById(locationId);
        existingLocation.setName(location.getName());
        existingLocation.setLatitude(location.getLatitude());
        existingLocation.setLongitude(location.getLongitude());
        return locationRepository.save(existingLocation);
    }

    @Override
    public Location getLocationById(Long locationId) {
        return locationRepository.findById(locationId)
            .orElseThrow(() -> new LocationNotFoundException(
                "Location not found with id: " + locationId));
    }

    @Override
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    @Override
    public void deleteLocation(Long locationId) {
        Location location = getLocationById(locationId);
        locationRepository.delete(location);
    }
}