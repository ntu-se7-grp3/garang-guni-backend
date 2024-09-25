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
import sg.edu.ntu.garang_guni_backend.entities.LoginRequest;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.security.JwtTokenUtil;
import sg.edu.ntu.garang_guni_backend.services.AuthenticationService;

@RestController
@RequestMapping("auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthenticationController(
            @Qualifier("authenticationServiceImpl") AuthenticationService authenticationService,
            JwtTokenUtil jwtTokenUtil) {
        this.authenticationService = authenticationService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody User user) {
        User newUser = authenticationService.signup(user);
        return createTokenResponse(newUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> authenticate(@RequestBody LoginRequest login) {
        User authenticatedUser = authenticationService.authenticate(login);
        return createTokenResponse(authenticatedUser, HttpStatus.OK);
    }

    /**
     * Creates a response containing the JWT token.
     *
     * @param user   the authenticated or newly registered user
     * @param status the HTTP status to return
     * @return ResponseEntity with the token and status
     */
    private ResponseEntity<Map<String, String>> createTokenResponse(User user, HttpStatus status) {
        String token = jwtTokenUtil.createToken(user);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);

        return ResponseEntity.status(status).body(response);
    }
}
