package sg.edu.ntu.garang_guni_backend.services.impls;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.exceptions.UserNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.UserRepository;
import sg.edu.ntu.garang_guni_backend.services.UserService;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User getUser(UUID id) {
        logger.info("Retrieving user with id {}", id);
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    @Override
    public User updateUser(UUID id, User user) {
        logger.info("Updating user with id {}", id);
        User dbUser = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));

        dbUser.setFirstName(user.getFirstName());
        dbUser.setLastName(user.getLastName());
        dbUser.setEmail(user.getEmail());
        dbUser.setPassword(user.getPassword());
        dbUser.setContactNo(user.getContactNo());
        dbUser.setDob(user.getDob());
        dbUser.setGender(user.getGender());
        dbUser.setPostalCode(user.getPostalCode());
        dbUser.setAddress(user.getAddress());
        dbUser.setFloor(user.getFloor());
        dbUser.setUnitNumber(user.getUnitNumber());

        return userRepository.save(dbUser);
    }
}
