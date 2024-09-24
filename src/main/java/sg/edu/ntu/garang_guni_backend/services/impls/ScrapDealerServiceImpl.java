package sg.edu.ntu.garang_guni_backend.services.impls;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.ScrapDealer;
import sg.edu.ntu.garang_guni_backend.repositories.ScrapDealerRepository;
import sg.edu.ntu.garang_guni_backend.services.ScrapDealerService;

import java.util.List;

@Service
public class ScrapDealerServiceImpl implements ScrapDealerService {

    @Autowired
    private ScrapDealerRepository scrapDealerRepository;

    @Override
    public ScrapDealer createDealer(ScrapDealer scrapDealer) {
        return scrapDealerRepository.save(scrapDealer);
    }

    @Override
    public List<ScrapDealer> getAllDealers() {
        return scrapDealerRepository.findAll();
    }
}
