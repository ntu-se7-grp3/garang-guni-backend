package sg.edu.ntu.garang_guni_backend.services.impls;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.repositories.AvailabilityRepository;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;

import java.time.LocalDate;
import java.util.List;

@Service
public class AvailabilityServiceImpl implements AvailabilityService {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Override
    public Availability createAvailability(Availability availability) {
        return availabilityRepository.save(availability);
    }

    @Override
    public List<Availability> findByDateAndLocation(LocalDate date, String location) {
        return availabilityRepository.findByAvailableDateAndLocation(date, location);
    }
}
