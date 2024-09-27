package sg.edu.ntu.garang_guni_backend.services.impls;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.repositories.UserRepository;

@SpringBootTest
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private User user;

    @BeforeEach
    public void init() {
        user = User.builder()
                .email("testuser@example.com")
                .password("encodedPassword")
                .build();
    }

    @DisplayName("Load user by username - Success")
    @Test
    void loadUserByUsernameTest() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());

        assertNotNull(userDetails);
        assertEquals(user.getEmail(), userDetails.getUsername(), "User email should match");
        assertEquals(user.getPassword(), userDetails.getPassword(), "User password should match");
        assertEquals(1, userDetails.getAuthorities().size(), "User should have one role");
        assertEquals("ROLE_USER", userDetails.getAuthorities().iterator().next().getAuthority(),
                "User role should be USER");

        verify(userRepository, times(1)).findByEmail(user.getEmail());
    }

    @DisplayName("Load user by username - User not found")
    @Test
    void loadInvalidUserByUsernameTest() {
        String email = "nonexistent@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername(email),
                "Should throw UsernameNotFoundException when user is not found");
        assertEquals("User not found with email: " + email, exception.getMessage());

        verify(userRepository, times(1)).findByEmail(email);
    }
}
