package sg.edu.ntu.garang_guni_backend.controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/availability")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @PostMapping("/{scrapDealerId}")
    public ResponseEntity<Availability> createAvailability(@PathVariable UUID scrapDealerId,
                                                           @Valid @RequestBody Availability availability) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();  // to check auth implementation
        if (role.equals("ROLE_SCRAP_DEALER") || role.equals("ROLE_ADMIN")) {
            Availability createdAvailability = availabilityService.createAvailability(scrapDealerId, availability);
            return new ResponseEntity<>(createdAvailability, HttpStatus.CREATED);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Availability> updateAvailability(@PathVariable Long id,
                                                           @Valid @RequestBody Availability availability) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();

        if (role.equals("ROLE_SCRAP_DEALER") || role.equals("ROLE_ADMIN")) {
            Availability updatedAvailability = availabilityService.updateAvailability(id, availability);
            return ResponseEntity.status(HttpStatus.OK).body(updatedAvailability);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();

        if (role.equals("ROLE_SCRAP_DEALER") || role.equals("ROLE_ADMIN")) {
            availabilityService.deleteAvailability(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Availability>> searchByDateAndLocation(
            @RequestParam LocalDate date, @RequestParam String location) {
        List<Availability> availabilities = availabilityService.findByDateAndLocation(date, location);
        return new ResponseEntity<>(availabilities, HttpStatus.OK);
    }
}
