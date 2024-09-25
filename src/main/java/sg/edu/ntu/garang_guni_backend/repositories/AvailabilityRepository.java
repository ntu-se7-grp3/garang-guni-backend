package sg.edu.ntu.garang_guni_backend.repositories;


import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import sg.edu.ntu.garang_guni_backend.entities.Availability;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByAvailableDateAndLocation(LocalDate availableDate, String location);

    List<Availability> findByScrapDealer_ScrapDealerIdAndAvailableDate(UUID scrapDealerId, LocalDate availableDate);

    List<Availability> findByLocation(String location);

    List<Availability> findByScrapDealer_ScrapDealerId(UUID scrapDealerId);
}