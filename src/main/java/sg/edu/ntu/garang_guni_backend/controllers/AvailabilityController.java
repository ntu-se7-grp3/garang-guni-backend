package sg.edu.ntu.garang_guni_backend.controllers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.entities.AvailabilityRequest;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;

@RestController
@RequestMapping("/availabilities")
public class AvailabilityController {

    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @PostMapping("")
    public ResponseEntity<Availability> createAvailability(
            @Valid @RequestBody AvailabilityRequest availabilityRequest) {

        Availability createdAvailability = availabilityService
                .createAvailability(availabilityRequest);
        return new ResponseEntity<>(createdAvailability, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Availability> updateAvailability(
        @PathVariable UUID id, 
        @Valid @RequestBody Availability availability) {
        
        Availability updatedAvailability = availabilityService
                .updateAvailability(id, availability);
        return ResponseEntity.status(HttpStatus.OK).body(updatedAvailability);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable UUID id) {
        availabilityService.deleteAvailability(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/check-location-date")
    public ResponseEntity<List<Availability>> searchByDateAndLocation(
        @RequestParam LocalDate date, @RequestParam UUID locationId) {
        
        List<Availability> availabilities = availabilityService
                .findByDateAndLocation(date, locationId);
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
            @RequestParam UUID locationId) {
        List<LocalDate> dates = availabilityService.findDistinctDatesByLocation(locationId);
        return ResponseEntity.ok(dates);
    }

    @PutMapping("/{availabilityId}/locations/{locationId}")
    public ResponseEntity<Availability> updateAvailabilityLocation(
            @PathVariable UUID availabilityId, 
            @PathVariable UUID locationId) {
        
        Availability updatedAvailability = availabilityService
                .updateAvailabilityLocation(availabilityId, locationId);
        return ResponseEntity.status(HttpStatus.OK).body(updatedAvailability);
    }

}
