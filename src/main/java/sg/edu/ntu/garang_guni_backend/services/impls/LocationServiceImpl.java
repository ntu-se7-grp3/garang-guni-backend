package sg.edu.ntu.garang_guni_backend.services.impls;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.exceptions.location.LocationNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.LocationRepository;
import sg.edu.ntu.garang_guni_backend.services.LocationService;

@Service
public class LocationServiceImpl implements LocationService {
    private LocationRepository locationRepository;

    public LocationServiceImpl(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @Override
    public Location createLocation(Location newLocation) {
        return locationRepository.save(newLocation);
    }

    @Override
    public Location getLocationById(UUID locationId) {
        Location retrievedLocation = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException(locationId));

        return new Location(retrievedLocation);
    }

    @Override
    public List<Location> getLocationsWithoutBooking() {
        List<Location> locations = locationRepository.findAll()
                                    .stream()
                                    .map(Location::new)
                                    .toList();
            
        locations.forEach(location -> location.setBooking(null));
        return locations;
    }

    @Override
    public Location updateLocation(UUID locationId, Location updatedLocation) {
        Location locationToUpdate = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException(locationId));

        locationToUpdate.setLocationName(updatedLocation.getLocationName());
        locationToUpdate.setLocationAddress(updatedLocation.getLocationAddress());
        locationToUpdate.setLatitude(updatedLocation.getLatitude());
        locationToUpdate.setLongitude(updatedLocation.getLongitude());

        return new Location(locationRepository.save(locationToUpdate));
    }

    @Override
    public Location deleteLocation(UUID locationId) {
        Location locationToDelete = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException(locationId));
        locationRepository.deleteById(locationId);

        return locationToDelete;
    }
    
}
