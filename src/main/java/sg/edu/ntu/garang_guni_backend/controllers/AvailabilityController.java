package sg.edu.ntu.garang_guni_backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sg.edu.ntu.garang_guni_backend.entities.Availability;
import sg.edu.ntu.garang_guni_backend.services.AvailabilityService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/availability")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @PostMapping
    public ResponseEntity<Availability> createAvailability(@RequestBody Availability availability) {
        Availability createdAvailability = availabilityService.createAvailability(availability);
        return new ResponseEntity<>(createdAvailability, HttpStatus.CREATED);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Availability>> searchByDateAndLocation(
        @RequestParam LocalDate date, @RequestParam String location) {
        List<Availability> availabilities = availabilityService.findByDateAndLocation(date, location);
        return new ResponseEntity<>(availabilities, HttpStatus.OK);
    }
}