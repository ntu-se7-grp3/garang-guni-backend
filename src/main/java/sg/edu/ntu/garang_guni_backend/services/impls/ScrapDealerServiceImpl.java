package sg.edu.ntu.garang_guni_backend.services.impls;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import sg.edu.ntu.garang_guni_backend.exceptions.ScrapDealerNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.UnauthorizedAccessException;
import sg.edu.ntu.garang_guni_backend.repositories.ScrapDealerRepository;
import sg.edu.ntu.garang_guni_backend.services.ScrapDealerService;

import java.util.List;
import java.util.UUID;

@Service
public class ScrapDealerServiceImpl implements ScrapDealerService {

    @Autowired
    private ScrapDealerRepository scrapDealerRepository;

    @Override
    public ScrapDealer createDealer(ScrapDealer scrapDealer) {
        if (scrapDealer.getFirstName() == null || scrapDealer.getFirstName().isBlank()) {
            throw new IllegalArgumentException("First name is required.");
        }

        if (scrapDealer.getLastName() == null || scrapDealer.getLastName().isBlank()) {
            throw new IllegalArgumentException("Last name is required.");
        }

        if (scrapDealer.getEmail() == null || scrapDealer.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        if (!scrapDealer.getEmail().matches("^\\S+@\\S+\\.\\S+$")) {
            throw new IllegalArgumentException("Email format is invalid.");
        }
        
        if (scrapDealer.getPhoneNumber() == null || scrapDealer.getPhoneNumber().isBlank()) {
            throw new IllegalArgumentException("Phone number is required.");
        }
        if (!scrapDealer.getPhoneNumber().matches("^\\+65[689]\\d{7}$")) {
            throw new IllegalArgumentException("Phone number must start with +65 followed by 8 digits starting with 6, 8, or 9.");
        }
    
        return scrapDealerRepository.save(scrapDealer);
    }

    @Override
    public List<ScrapDealer> getAllDealers() {
        return scrapDealerRepository.findAll();
    }

    @Override
    public ScrapDealer getScrapDealerById(UUID id) {
        return scrapDealerRepository.findById(id)
            .orElseThrow(() -> new ScrapDealerNotFoundException(
                "Scrap dealer not found with id: " + id));
    }

    @Override
    public ScrapDealer updateScrapDealer(UUID id, ScrapDealer scrapDealer, UUID loggedInUserId) {
        ScrapDealer existingDealer = getScrapDealerById(id);

        if (!existingDealer.getScrapDealerId().equals(loggedInUserId)) {
            throw new UnauthorizedAccessException("You are not allowed to modify this scrap dealer's details");
        }

        existingDealer.setFirstName(scrapDealer.getFirstName());
        existingDealer.setAvailabilityList(scrapDealer.getAvailabilityList());
        return scrapDealerRepository.save(existingDealer);
    }

    @Override
    public void deleteDealerById(UUID id, UUID loggedInUserId) {
        ScrapDealer dealer = getScrapDealerById(id);

        if (!dealer.getScrapDealerId().equals(loggedInUserId)) {
            throw new UnauthorizedAccessException("You are not allowed to delete this scrap dealer");
        }

        scrapDealerRepository.delete(dealer);
    }
}
