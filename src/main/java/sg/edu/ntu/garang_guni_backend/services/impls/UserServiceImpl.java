package sg.edu.ntu.garang_guni_backend.services.impls;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.exceptions.UserExistsException;
import sg.edu.ntu.garang_guni_backend.exceptions.UserNotFoundException;
import sg.edu.ntu.garang_guni_backend.repositories.UserRepository;
import sg.edu.ntu.garang_guni_backend.services.UserService;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserServiceImpl(
        PasswordEncoder passwordEncoder,
        UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Override
    public User getUser(UUID id) {
        logger.info("Retrieving user with id {}", id);
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    @Override
    public User updateUser(UUID id, User user) {
        String email = user.getEmail();
        logger.info("Attempting to update user with id {}", id);

        if (userRepository.existsByEmail(email)) {
            logger.error("User with email {} already exists", email);
            throw new UserExistsException(email);
        }

        User dbUser = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));

        dbUser.setFirstName(user.getFirstName());
        dbUser.setLastName(user.getLastName());
        dbUser.setEmail(email);

        String encodedPassword = passwordEncoder.encode(user.getPassword());
        dbUser.setPassword(encodedPassword);
        dbUser.setContactNo(user.getContactNo());
        dbUser.setDob(user.getDob());
        dbUser.setGender(user.getGender());
        dbUser.setPostalCode(user.getPostalCode());
        dbUser.setAddress(user.getAddress());
        dbUser.setFloor(user.getFloor());
        dbUser.setUnitNumber(user.getUnitNumber());

        logger.info("Successfully updated user with email: {}", email);

        return userRepository.save(dbUser);
    }
}
