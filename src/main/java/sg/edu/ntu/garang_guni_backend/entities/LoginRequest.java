package sg.edu.ntu.garang_guni_backend.entities;

import lombok.Getter;

@Getter
public class LoginRequest {
    private String email;
    private String password;
}
