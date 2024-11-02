package sg.edu.ntu.garang_guni_backend.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.AvailabilityRequest;
import sg.edu.ntu.garang_guni_backend.entities.Location;

public interface AvailabilityService {

    Availability createAvailability(AvailabilityRequest availabilityRequest);

    Availability updateAvailability(UUID id, Availability availability);

    void deleteAvailability(UUID id);

    Availability getAvailabilityById(UUID id);

    List<Availability> findByDateAndLocation(LocalDate date, UUID locationId);

    List<Location> findDistinctLocationsByDate(LocalDate date);

    List<LocalDate> findDistinctDatesByLocation(UUID locationId);

    Availability updateAvailabilityLocation(UUID availabilityId, UUID locationId);
}
