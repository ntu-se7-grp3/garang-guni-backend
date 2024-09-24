package sg.edu.ntu.garang_guni_backend.services;

import sg.edu.ntu.garang_guni_backend.entities.Availability;
import java.time.LocalDate;
import java.util.List;

public interface AvailabilityService {
    Availability createAvailability(Availability availability);
    List<Availability> findByDateAndLocation(LocalDate date, String location);
}
