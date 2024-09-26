package sg.edu.ntu.garang_guni_backend.services;

import java.util.List;
import java.util.UUID;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;

public interface ScrapDealerService {

    ScrapDealer createDealer(ScrapDealer scrapDealer);

    List<ScrapDealer> getAllDealers();

    ScrapDealer getScrapDealerById(UUID id);

    ScrapDealer updateScrapDealer(UUID id, ScrapDealer scrapDealer, UUID loggedInUserId);

    void deleteDealerById(UUID id, UUID loggedInUserId);
}
