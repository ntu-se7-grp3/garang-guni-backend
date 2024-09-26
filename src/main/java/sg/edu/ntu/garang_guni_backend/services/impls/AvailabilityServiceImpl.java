package sg.edu.ntu.garang_guni_backend.services.impls;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import sg.edu.ntu.garang_guni_backend.exceptions.AvailabilityNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.InvalidDateException;
import sg.edu.ntu.garang_guni_backend.exceptions.ScrapDealerNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.UnauthorizedAccessException;
import sg.edu.ntu.garang_guni_backend.repositories.AvailabilityRepository;
import sg.edu.ntu.garang_guni_backend.repositories.ScrapDealerRepository;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;

@Service
public class AvailabilityServiceImpl implements AvailabilityService {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private ScrapDealerRepository scrapDealerRepository;

    @Override
    public Availability createAvailability(UUID scrapDealerId, Availability availability) {
        ScrapDealer scrapDealer = scrapDealerRepository.findById(scrapDealerId)
                .orElseThrow(() -> new ScrapDealerNotFoundException("Scrap dealer not found"));

        if (availability.getAvailableDate().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Available date cannot be in the past");
        }

        availability.setScrapDealer(scrapDealer);
        return availabilityRepository.save(availability);
    }

    @Override
    public List<Availability> findByDateAndLocation(LocalDate date, String location) {
        if (date == null || location == null || location.isBlank()) {
            throw new IllegalArgumentException("Date and location are required for search.");
        }
        return availabilityRepository.findByAvailableDateAndLocation(date, location);
    }

    // @Override
    // public Availability updateAvailability(
            //Long id, Availability availability, UUID loggedInUserId) {
    //     Availability existingAvailability = availabilityRepository.findById(id)
    //             .orElseThrow(() -> new AvailabilityNotFoundException("Availability not found"));

    //     if (!existingAvailability.getScrapDealer().getScrapDealerId().equals(loggedInUserId)) {
    //         throw new UnauthorizedAccessException(
                    //"You are not allowed to modify this availability");
    //     }

    //     if (availability.getAvailableDate().isBefore(LocalDate.now())) {
    //         throw new InvalidDateException("Available date cannot be in the past");
    //     }

    //     existingAvailability.setAvailableDate(availability.getAvailableDate());
    //     existingAvailability.setLocation(availability.getLocation());

    //     return availabilityRepository.save(existingAvailability);
    // }

    @Override
    public Availability updateAvailability(Long id, Availability availability) {
        Availability existingAvailability = availabilityRepository.findById(id)
                .orElseThrow(() -> new AvailabilityNotFoundException("Availability not found"));

        if (availability.getAvailableDate().isBefore(LocalDate.now())) {
            throw new InvalidDateException("Available date cannot be in the past");
        }

        existingAvailability.setAvailableDate(availability.getAvailableDate());
        existingAvailability.setLocation(availability.getLocation());

        return availabilityRepository.save(existingAvailability);
    }

    @Override
    public void deleteAvailability(Long id, UUID loggedInUserId) {
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new AvailabilityNotFoundException("Availability not found"));

        if (!availability.getScrapDealer().getScrapDealerId().equals(loggedInUserId)) {
            throw new UnauthorizedAccessException(
                "You are not allowed to delete this availability");
        }

        availabilityRepository.delete(availability);
    }
}
