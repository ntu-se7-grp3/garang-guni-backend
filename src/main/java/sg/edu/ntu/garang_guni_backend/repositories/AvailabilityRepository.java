package sg.edu.ntu.garang_guni_backend.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.Location;

public interface AvailabilityRepository extends JpaRepository<Availability, UUID> {

    List<Availability> findByAvailableDateAndLocation_Id(LocalDate availableDate, UUID locationId);

    List<Availability> findByScrapDealer_ScrapDealerIdAndAvailableDate(
        UUID scrapDealerId, LocalDate availableDate);

    List<Availability> findByScrapDealer_ScrapDealerId(UUID scrapDealerId);

    @Query("SELECT DISTINCT a.location FROM Availability a WHERE a.availableDate = :date")
    List<Location> findDistinctLocationsByAvailableDate(LocalDate date);

    @Query("SELECT DISTINCT a.availableDate FROM Availability a WHERE a.location.id = :locationId")
    List<LocalDate> findDistinctDatesByLocation_Id(UUID locationId);
}
