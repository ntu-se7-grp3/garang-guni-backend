package sg.edu.ntu.garang_guni_backend.services.impls;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Booking;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.exceptions.location.LocationNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.LocationRepository;
import sg.edu.ntu.garang_guni_backend.services.BookingService;
import sg.edu.ntu.garang_guni_backend.services.LocationService;

@Service
public class LocationServiceImpl implements LocationService {
    private LocationRepository locationRepository;

    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private BookingService bookingService;

    public LocationServiceImpl(
        LocationRepository locationRepository,
        BookingService bookingService) {
        this.locationRepository = locationRepository;
        this.bookingService = bookingService;
    }

    @Override
    public Location createLocation(Location newLocation) {
        Location cloneLocation = Location.builder()
                .locationName(newLocation.getLocationName())
                .locationAddress(newLocation.getLocationAddress())
                .latitude(newLocation.getLatitude())
                .longitude(newLocation.getLongitude())
                .build();
        return new Location(locationRepository.save(cloneLocation));
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
            
        locations.forEach(location -> location.setBookings(null));
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
    
    @Override
    public Booking addNewBookingToLocation(UUID locationId, Booking newBooking) {
        Location selectedLocation = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException(locationId));
        
        return bookingService
                .assignLocationToNewBooking(newBooking, selectedLocation);
    }

    @Override
    public Booking addExisitingBookingToLocation(UUID locationId, UUID bookingId) {
        Location selectedLocation = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException(locationId));
        
        return bookingService
                .assignLocationToExistingBooking(bookingId, selectedLocation);
    }

    @Override
    public List<Booking> getAllBookings(UUID locationId) {
        Location selectedLocation = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException(locationId));

        return (!selectedLocation.getBookings().isEmpty())
            ? selectedLocation.getBookings()
                            .stream()
                            .map(Booking::new)
                            .toList()
            : null;
    }
    
}
