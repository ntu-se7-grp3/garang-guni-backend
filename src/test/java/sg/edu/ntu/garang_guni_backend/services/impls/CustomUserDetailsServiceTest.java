package sg.edu.ntu.garang_guni_backend.services.impls;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

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
public class CustomUserDetailsServiceTest {

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
    public void loadUserByUsernameTest() {
        // Arrange
        when(userRepository.findByEmail("testuser@example.com")).thenReturn(user);

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(
            "testuser@example.com");

        // Assert
        assertEquals(user.getEmail(), userDetails.getUsername(), "User email should match");
        assertEquals(user.getPassword(), userDetails.getPassword(), "User password should match");
        assertEquals(1, userDetails.getAuthorities().size(), "User should have one role");
        assertEquals("ROLE_USER", userDetails.getAuthorities().iterator().next().getAuthority(),
                "User role should be USER");
    }

    @DisplayName("Load user by username - User not found")
    @Test
    public void loadInvalidUserByUsernameTest() {
        // Arrange
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(null);

        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername("unknown@example.com");
        }, "Should throw UsernameNotFoundException when user is not found");
    }
}
