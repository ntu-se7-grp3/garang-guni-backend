package sg.edu.ntu.garang_guni_backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import sg.edu.ntu.garang_guni_backend.services.ScrapDealerService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/scrapdealers")
public class ScrapDealerController {

    @Autowired
    private ScrapDealerService scrapDealerService;

    @PostMapping({ "", "/" })
    public ResponseEntity<ScrapDealer> createScrapDealer(@RequestBody ScrapDealer scrapDealer) {
        ScrapDealer createdDealer = scrapDealerService.createDealer(scrapDealer);
        return new ResponseEntity<>(createdDealer, HttpStatus.CREATED);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<ScrapDealer> deleteDealerById(@PathVariable UUID id) {
        scrapDealerService.deleteDealerById(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
    }


}