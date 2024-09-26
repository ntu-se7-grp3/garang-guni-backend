package sg.edu.ntu.garang_guni_backend.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.Location;

public interface AvailabilityService {

    Availability createAvailability(UUID scrapDealerId, Availability availability);

    Availability updateAvailability(Long id, Availability availability);

    void deleteAvailability(Long id, UUID loggedInUserId);

    List<Availability> findByDateAndLocation(LocalDate date, Long locationId);

    List<Location> findDistinctLocationsByDate(LocalDate date);

    List<LocalDate> findDistinctDatesByLocation(Long locationId);
}