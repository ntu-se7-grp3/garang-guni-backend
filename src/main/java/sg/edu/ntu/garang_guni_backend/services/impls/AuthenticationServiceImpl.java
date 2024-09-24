package sg.edu.ntu.garang_guni_backend.services.impls;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.exceptions.UserExistsException;
import sg.edu.ntu.garang_guni_backend.repositories.UserRepository;
import sg.edu.ntu.garang_guni_backend.services.AuthenticationService;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthenticationServiceImpl(PasswordEncoder passwordEncoder,
            UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Override
    public User signup(User user) {
        String email = user.getEmail();
        logger.info("Attempting to create user with email: {}", email);

        if (userRepository.existsByEmail(email)) {
            logger.error("User with email {} already exists", email);
            throw new UserExistsException(email);
        }

        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        User newUser = userRepository.save(user);
        logger.info("Successfully created user with email: {}", email);

        return newUser;
    }
}
