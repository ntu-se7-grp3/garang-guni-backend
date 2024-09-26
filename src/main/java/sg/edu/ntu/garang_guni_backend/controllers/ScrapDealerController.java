package sg.edu.ntu.garang_guni_backend.controllers;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import sg.edu.ntu.garang_guni_backend.services.ScrapDealerService;

@RestController
@RequestMapping("/scrapdealers")
public class ScrapDealerController {

    @Autowired
    private ScrapDealerService scrapDealerService;

    @PreAuthorize("hasRole('SCRAP_DEALER')")
    @PostMapping({ "", "/" })
    public ResponseEntity<ScrapDealer> createScrapDealer(
        @Valid @RequestBody ScrapDealer scrapDealer) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();

        if (role.equals("ROLE_SCRAP_DEALER") || role.equals("ROLE_ADMIN")) {
            ScrapDealer createdDealer = scrapDealerService.createDealer(scrapDealer);
            return new ResponseEntity<>(createdDealer, HttpStatus.CREATED);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping({ "", "/" })
    public ResponseEntity<List<ScrapDealer>> getAllScrapDealers() {
        List<ScrapDealer> dealers = scrapDealerService.getAllDealers();
        return new ResponseEntity<>(dealers, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScrapDealer> getScrapDealerById(@PathVariable UUID id) {
        ScrapDealer dealer = scrapDealerService.getScrapDealerById(id);
        return ResponseEntity.status(HttpStatus.OK).body(dealer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScrapDealer> updateScrapDealer(
        @PathVariable UUID id, @Valid @RequestBody ScrapDealer scrapDealer) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();
        UUID loggedInUserId = (UUID) auth.getPrincipal();

        if (role.equals("ROLE_SCRAP_DEALER") || loggedInUserId.equals(id)) {
            ScrapDealer updatedDealer = scrapDealerService.updateScrapDealer(
                id, scrapDealer, loggedInUserId);
            return ResponseEntity.status(HttpStatus.OK).body(updatedDealer);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDealerById(@PathVariable UUID id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUserIdString = auth.getName();
        UUID loggedInUserId = UUID.fromString(loggedInUserIdString);
    
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (role.equals("ROLE_SCRAP_DEALER") || loggedInUserId.equals(id)) {
            scrapDealerService.deleteDealerById(id, loggedInUserId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
    
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
