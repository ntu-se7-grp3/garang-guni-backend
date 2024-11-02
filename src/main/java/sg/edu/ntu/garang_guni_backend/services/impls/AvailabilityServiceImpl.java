package sg.edu.ntu.garang_guni_backend.services.impls;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.AvailabilityRequest;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.exceptions.AvailabilityNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.DateNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.location.LocationNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.AvailabilityRepository;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;
import sg.edu.ntu.garang_guni_backend.services.LocationService;

@Service
public class AvailabilityServiceImpl implements AvailabilityService {

    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private AvailabilityRepository availabilityRepository;

    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private LocationService locationService;

    public AvailabilityServiceImpl(AvailabilityRepository availabilityRepository,
            LocationService locationService) {
        this.availabilityRepository = availabilityRepository;
        this.locationService = locationService;
    }

    @Override
    public Availability createAvailability(@Valid AvailabilityRequest availabilityRequest) {
        Location newLocation = availabilityRequest.getLocation();
        if (newLocation == null) {
            throw new LocationNotFoundException();
        }
        Location createdLocation;
        if (newLocation.getLocationId() != null) {
            createdLocation = 
                locationService.getLocationById(newLocation.getLocationId());
        } else {
            createdLocation = locationService.createLocation(newLocation);
        }
        Availability newAvailability = Availability.builder()
                .availableDate(availabilityRequest.getAvailableDate())
                .location(createdLocation)
                // .scrapDealer(availabilityRequest.getScrapDealer())
                .build();
        return availabilityRepository.save(newAvailability);
    }

    @Override
    public Availability updateAvailability(
            UUID id,
            Availability updatedAvailability) {
        Availability existingAvailability = availabilityRepository
            .findById(id)
            .orElseThrow(() -> new AvailabilityNotFoundException(id));
        existingAvailability.setAvailableDate(updatedAvailability.getAvailableDate());
        // existingAvailability.setScrapDealer(updatedAvailability.getScrapDealer());
        return availabilityRepository.save(existingAvailability);
    }

    @Override
    public void deleteAvailability(UUID id) {
        boolean exists = availabilityRepository.existsById(id);
        if (!exists) {
            throw new AvailabilityNotFoundException(id);
        }
        availabilityRepository.deleteById(id);
    }

    @Override
    public Availability getAvailabilityById(UUID id) {
        return availabilityRepository
                .findById(id)
                .orElseThrow(() -> new AvailabilityNotFoundException(id));
    }

    @Override
    public List<Availability> findByDateAndLocation(LocalDate date, UUID locationId) {
        List<Availability> availableDates = availabilityRepository
                .findByAvailableDateAndLocation_LocationId(date, locationId);
        if (availableDates.isEmpty()) {
            throw new AvailabilityNotFoundException(date, locationId);
        }
        return availableDates;
    }

    @Override
    public List<Location> findDistinctLocationsByDate(LocalDate date) {
        List<Location> availableLocations = availabilityRepository
                .findDistinctLocationsByAvailableDate(date);
        if (availableLocations.isEmpty()) {
            throw new LocationNotFoundException(date);
        }
        return availableLocations;
    }

    @Override
    public List<LocalDate> findDistinctDatesByLocation(UUID locationId) {
        List<LocalDate> availableDates = availabilityRepository
                .findDistinctDatesByLocation_LocationId(locationId);
        if (availableDates.isEmpty()) {
            throw new DateNotFoundException(locationId);
        }
        return availableDates;
    }

    @Override
    public Availability updateAvailabilityLocation(UUID availabilityId, UUID locationId) {
        Location selectedLocation = locationService.getLocationById(locationId);
        Availability availabilityToUpdate = getAvailabilityById(availabilityId);
        availabilityToUpdate.setLocation(selectedLocation);

        return availabilityRepository.save(availabilityToUpdate);
    }
}
