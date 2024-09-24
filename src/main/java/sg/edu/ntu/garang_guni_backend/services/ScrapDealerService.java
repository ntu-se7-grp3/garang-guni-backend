package sg.edu.ntu.garang_guni_backend.services;

import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import java.util.List;

public interface ScrapDealerService {
    ScrapDealer createDealer(ScrapDealer scrapDealer);
    List<ScrapDealer> getAllDealers();
}
