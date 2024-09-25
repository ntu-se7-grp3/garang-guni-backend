package sg.edu.ntu.garang_guni_backend.services;

import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;

import java.util.List;
import java.util.UUID;

public interface ScrapDealerService {

    ScrapDealer createDealer(ScrapDealer scrapDealer);

    List<ScrapDealer> getAllDealers();

    ScrapDealer getScrapDealerById(UUID id);

    ScrapDealer updateScrapDealer(UUID id, ScrapDealer scrapDealer, UUID loggedInUserId);

    void deleteDealerById(UUID id, UUID loggedInUserId);
}
