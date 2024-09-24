package sg.edu.ntu.garang_guni_backend.controllers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sg.edu.ntu.garang_guni_backend.entities.Location;
import sg.edu.ntu.garang_guni_backend.services.LocationService;

@RestController
@RequestMapping("/locations")
public class LocationController {
    @SuppressFBWarnings("EI_EXPOSE_REP2")
    private final LocationService locationService;

    public LocationController(
            @Qualifier("locationServiceImpl") LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping({ "", "/" })
    public ResponseEntity<Location> createLocation(
            @Valid @RequestBody Location newLocation) {
        Location createdLocation = locationService.createLocation(newLocation);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLocation);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable UUID id) {
        Location selectedLocation = locationService.getLocationById(id);
        return ResponseEntity.status(HttpStatus.OK).body(selectedLocation);
    }

    @GetMapping({ "", "/" })
    public ResponseEntity<List<Location>> getLocations() {
        List<Location> allLocations = locationService.getLocationsWithoutBooking();
        return ResponseEntity.status(HttpStatus.OK).body(allLocations);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable UUID id,
            @Valid @RequestBody Location updatedLocation) {
        Location selectedLocation = locationService.updateLocation(id, updatedLocation);
        return ResponseEntity.status(HttpStatus.OK).body(selectedLocation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Location> deleteLocation(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(locationService.deleteLocation(id));
    }
}
 