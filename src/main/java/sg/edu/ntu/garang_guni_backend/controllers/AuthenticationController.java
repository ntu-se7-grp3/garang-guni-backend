package sg.edu.ntu.garang_guni_backend.controllers;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import sg.edu.ntu.garang_guni_backend.entities.User;
import sg.edu.ntu.garang_guni_backend.security.JwtTokenUtil;
import sg.edu.ntu.garang_guni_backend.services.AuthenticationService;

@RestController
@RequestMapping("auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    private final JwtTokenUtil jwtTokenUtil;

    @Autowired // Constructor Injection
    public AuthenticationController(
            @Qualifier("authenticationServiceImpl") AuthenticationService authenticationService,
            JwtTokenUtil jwtTokenUtil) {
        this.authenticationService = authenticationService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody User user) {
        User newUser = authenticationService.signup(user);
        String token = jwtTokenUtil.createToken(newUser);

        // Return the token wrapped in a JSON object
        Map<String, String> response = new HashMap<String, String>();
        response.put("token", token);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
