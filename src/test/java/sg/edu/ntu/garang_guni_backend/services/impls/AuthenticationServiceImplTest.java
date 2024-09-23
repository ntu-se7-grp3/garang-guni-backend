package sg.edu.ntu.garang_guni_backend.services.impls;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
// import java.time.LocalDate;
// import java.time.format.DateTimeFormatter;
// import org.junit.jupiter.api.BeforeEach;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
// import sg.edu.ntu.garang_guni_backend.entities.Gender;
import sg.edu.ntu.garang_guni_backend.entities.User;
// import sg.edu.ntu.garang_guni_backend.entities.UserRole;
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

    // @BeforeEach
    // public void init() {}

    @DisplayName("Test user signup with password encoding")
    @Test
    public void signupTest() {
        // Arrange
        //should declare as close as possible to the first use
        // String rawPassword = "P@ssword123"; 
        // String encodedPassword = "encodedPassword";

        // String dobString = "29-07-1996";
        // DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        // LocalDate dob = LocalDate.parse(dobString, formatter);

        user = new User();
        user.setFirstName("Asher");
        user.setLastName("Chew");
        user.setEmail("testuser@example.com");
        user.setPassword("P@ssword123");
        String rawPassword = user.getPassword();

        // Declare `encodedPassword` just before its first use
        String encodedPassword = "encodedPassword";

        // user =
        // User.builder().firstName("Asher").lastName("Chew").email("testuser@example.com")
        // .password(rawPassword).role(UserRole.parseUserRole("Customer"))
                //.contactNo("98761234").dob(dob)
        // .gender(Gender.parseGender("Male"))
        // .postalCode("209123").address("123 Main
        // St").floor(12).unitNumber(1234).build();

        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);
        when(userRepository.save(user)).thenReturn(user);

        // Act
        User savedUser = authenticationService.signup(user);

        // Assert
        verify(passwordEncoder, times(1)).encode(rawPassword);
        verify(userRepository, times(1)).save(user);

        assertEquals(encodedPassword, savedUser.getPassword(), "The password should be encoded");
        assertEquals(user, savedUser, "The saved user should be the same as the new user");
    }
}
