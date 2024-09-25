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

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import sg.edu.ntu.garang_guni_backend.entities.LoginRequest;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.exceptions.UserExistsException;
import sg.edu.ntu.garang_guni_backend.repositories.UserRepository;

@SpringBootTest
public class AuthenticationServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    public void init() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("john.doe@example.com");
        loginRequest.setPassword("P@ssword123");

        user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
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
        assertEquals(encodedPassword, result.getPassword(), "The password should be encoded");
        verify(passwordEncoder).encode(rawPassword);
    }

    @DisplayName("Test successful authentication")
    @Test
    public void authenticateSuccessTest() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(user));

        // Act
        User authenticatedUser = authenticationService.authenticate(loginRequest);

        // Assert
        assertNotNull(authenticatedUser);
        assertEquals("john.doe@example.com",
                    authenticatedUser.getEmail(),
                    "The email should exists"
        );

        verify(authenticationManager, times(1))
            .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, times(1)).findByEmail("john.doe@example.com");
    }

    @DisplayName("Test authentication with incorrect credentials")
    @Test
    public void authenticateInvalidCredentialsTest() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act & Assert
        BadCredentialsException exception = assertThrows(
                BadCredentialsException.class,
                () -> authenticationService.authenticate(loginRequest));
        assertEquals("Invalid credentials", exception.getMessage());

        verify(authenticationManager, times(1))
            .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, never()).findByEmail(anyString());
    }

    @DisplayName("Test authentication with non-existent user")
    @Test
    public void authenticateUserNotFoundTest() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> authenticationService.authenticate(loginRequest));
        assertEquals("User not found with email: john.doe@example.com", exception.getMessage());

        verify(authenticationManager, times(1))
            .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, times(1)).findByEmail("john.doe@example.com");
    }
}
