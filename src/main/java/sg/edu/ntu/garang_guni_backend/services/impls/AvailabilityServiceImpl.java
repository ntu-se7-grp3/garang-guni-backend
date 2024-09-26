package sg.edu.ntu.garang_guni_backend.services.impls;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.exceptions.AvailabilityNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.InvalidDateException;
import sg.edu.ntu.garang_guni_backend.exceptions.UnauthorizedAccessException;
import sg.edu.ntu.garang_guni_backend.repositories.AvailabilityRepository;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;

@Service
public class AvailabilityServiceImpl implements AvailabilityService {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Override
    public Availability createAvailability(UUID scrapDealerId, Availability availability) {
        if (availability.getAvailableDate().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Available date cannot be in the past");
        }

        return availabilityRepository.save(availability);
    }

    @Override
    public Availability updateAvailability(Long id, Availability availability) {
        Optional<Availability> existingAvailability = availabilityRepository.findById(id);
        if (existingAvailability.isEmpty()) {
            throw new AvailabilityNotFoundException("Availability with id " + id + " not found");
        }
    
        if (availability.getAvailableDate().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Available date cannot be in the past");
        }
    
        availability.setId(id);
    
        return availabilityRepository.save(availability);
    }
    

    @Override
    public void deleteAvailability(Long id, UUID loggedInUserId) {
        Optional<Availability> availability = availabilityRepository.findById(id);
        if (availability.isEmpty()) {
            throw new AvailabilityNotFoundException("Availability not found");
        }

        if (!availability.get().getScrapDealer().getScrapDealerId().equals(loggedInUserId)) {
            throw new UnauthorizedAccessException(
                "You are not authorized to delete this availability");
        }

        availabilityRepository.deleteById(id);
    }

    @Override
    public List<Availability> findByDateAndLocation(LocalDate date, Long locationId) {
        return availabilityRepository.findByAvailableDateAndLocation_Id(date, locationId);
    }

    @Override
    public List<Location> findDistinctLocationsByDate(LocalDate date) {
        return availabilityRepository.findDistinctLocationsByAvailableDate(date);
    }

    @Override
    public List<LocalDate> findDistinctDatesByLocation(Long locationId) {
        return availabilityRepository.findDistinctDatesByLocation_Id(locationId);
    }
}
