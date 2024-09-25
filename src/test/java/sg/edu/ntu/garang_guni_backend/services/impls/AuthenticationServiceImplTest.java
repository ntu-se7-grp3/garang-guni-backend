package sg.edu.ntu.garang_guni_backend.services.impls;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.exceptions.UserExistsException;
import sg.edu.ntu.garang_guni_backend.repositories.UserRepository;

@SpringBootTest
public class AuthenticationServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private User user;

    @BeforeEach
    public void init() {
        user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("test@example.com")
                .password("P@ssword123")
                .build();
    }

    @DisplayName("Test successful signup")
    @Test
    public void signupSuccessTest() {
        // Arrange
        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(passwordEncoder.encode("P@ssword123")).thenReturn("encodedPassword");
        when(userRepository.save(user)).thenReturn(user);

        // Act
        User newUser = authenticationService.signup(user);

        // Assert
        assertNotNull(newUser);
        assertEquals("encodedPassword", newUser.getPassword(), "The password should be encoded");
        assertEquals(user, newUser, "The saved user should be the same as the new user");

        verify(userRepository).existsByEmail(user.getEmail());
        verify(passwordEncoder, times(1)).encode("P@ssword123");
        verify(userRepository, times(1)).save(user);
    }

    @DisplayName("Test signup with existing email throws UserExistsException")
    @Test
    public void signupWithExistingEmailTest() {
        // Arrange
        when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(UserExistsException.class, () -> authenticationService.signup(user));

        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @DisplayName("Test password is encoded before saving user")
    @Test
    public void signupPasswordEncodingTest() {
        // Arrange
        String rawPassword = user.getPassword();
        String encodedPassword = "encodedPassword";

        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);
        when(userRepository.save(user)).thenReturn(user);

        // Act
        User result = authenticationService.signup(user);

        // Assert
        assertEquals(encodedPassword, result.getPassword());
        verify(passwordEncoder).encode(rawPassword);
    }
}
