package sg.edu.ntu.garang_guni_backend.services.impls;

import java.util.ArrayList;
import java.util.List;
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.repositories.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        List<String> roles = new ArrayList<String>();
        roles.add("USER");

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(roles.toArray(new String[0]))
                .build();

        return userDetails;
    }
}
