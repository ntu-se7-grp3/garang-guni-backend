package sg.edu.ntu.garang_guni_backend.controllers;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;
import sg.edu.ntu.garang_guni_backend.services.LocationService;

@RestController
@RequestMapping("/availability")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private LocationService locationService;

    @PostMapping("/{scrapDealerId}")
    public ResponseEntity<Availability> createAvailability(
        @PathVariable UUID scrapDealerId, 
        @RequestParam Long locationId,
        @Valid @RequestBody Availability availability) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();

        if (role.equals("ROLE_SCRAP_DEALER") || role.equals("ROLE_ADMIN")) {
            Location location = locationService.getLocationById(locationId);
            availability.setLocation(location);
            Availability createdAvailability = availabilityService.createAvailability(
                scrapDealerId, availability);
            return new ResponseEntity<>(createdAvailability, HttpStatus.CREATED);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Availability> updateAvailability(
        @PathVariable Long id, 
        @RequestParam Long locationId,
        @Valid @RequestBody Availability availability) {
        
        Location location = locationService.getLocationById(locationId);
        availability.setLocation(location);
        
        Availability updatedAvailability = availabilityService.updateAvailability(id, availability);
        return ResponseEntity.status(HttpStatus.OK).body(updatedAvailability);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();
        String loggedInUserIdString = auth.getName();
        UUID loggedInUserId = UUID.fromString(loggedInUserIdString);

        if (role.equals("ROLE_SCRAP_DEALER") || role.equals("ROLE_ADMIN")) {
            availabilityService.deleteAvailability(id, loggedInUserId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/check-location-date")
    public ResponseEntity<List<Availability>> searchByDateAndLocation(
        @RequestParam LocalDate date, @RequestParam Long locationId) {
        
        List<Availability> availabilities = availabilityService.findByDateAndLocation(
            date, locationId);
        return new ResponseEntity<>(availabilities, HttpStatus.OK);
    }

    @GetMapping("/locations-by-date")
    public ResponseEntity<List<Location>> getDistinctLocationsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Location> locations = availabilityService.findDistinctLocationsByDate(date);
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/dates-by-location")
    public ResponseEntity<List<LocalDate>> getDistinctDatesByLocation(
        @RequestParam Long locationId) {
        List<LocalDate> dates = availabilityService.findDistinctDatesByLocation(locationId);
        return ResponseEntity.ok(dates);
    }
}
