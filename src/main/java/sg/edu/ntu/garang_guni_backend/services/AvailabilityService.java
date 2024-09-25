package sg.edu.ntu.garang_guni_backend.services;

import sg.edu.ntu.garang_guni_backend.entities.Availability;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AvailabilityService {

    Availability createAvailability(UUID scrapDealerId, Availability availability);

    List<Availability> findByDateAndLocation(LocalDate date, String location);

    Availability updateAvailability(Long id, Availability availability, UUID loggedInUserId);

    void deleteAvailability(Long id, UUID loggedInUserId);
}