package sg.edu.ntu.garang_guni_backend.controllers;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.entities.UserRole;
import sg.edu.ntu.garang_guni_backend.security.JwtTokenUtil;
import sg.edu.ntu.garang_guni_backend.services.AuthenticationService;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthenticationController(
            @Qualifier("authenticationServiceImpl") AuthenticationService authenticationService,
            JwtTokenUtil jwtTokenUtil) {
        this.authenticationService = authenticationService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    // General User Signup
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody User user) {
        user.setRole(UserRole.CUSTOMER); // Default role is customer
        return generateSignupResponse(user);
    }

    // Scrap Dealer Signup
    @PostMapping("/signup/scrapdealer")
    public ResponseEntity<Map<String, String>> registerScrapDealer(@Valid @RequestBody User user) {
        user.setRole(UserRole.SCRAP_DEALER); // Assign Scrap Dealer role
        return generateSignupResponse(user);
    }

    // Admin Signup (optional)
    @PostMapping("/signup/admin")
    public ResponseEntity<Map<String, String>> registerAdmin(@Valid @RequestBody User user) {
        user.setRole(UserRole.ADMIN); // Assign Admin role
        return generateSignupResponse(user);
    }

    // Shared method to generate response
    private ResponseEntity<Map<String, String>> generateSignupResponse(User user) {
        User newUser = authenticationService.signup(user);
        String token = jwtTokenUtil.createToken(newUser);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
