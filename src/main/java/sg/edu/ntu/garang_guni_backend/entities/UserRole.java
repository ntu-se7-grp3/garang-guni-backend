package sg.edu.ntu.garang_guni_backend.entities;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
    // enum constants calling the enum constructors
    SCRAP_DEALER("Scrap Dealer"),
    CUSTOMER("Customer"),
    ADMIN("Admin");

    private final String role;

    // private enum constructor
    private UserRole(String role) {
        this.role = role;
    }

    // Getter to return the custom value
    @JsonValue
    public String getRole() {
        return role;
    }

    // Custom deserialization logic to handle mapping input to enum constants
    @JsonCreator
    public static UserRole parseUserRole(String role) {
        for (UserRole userRole : UserRole.values()) {
            if (userRole.role.equalsIgnoreCase(role)) {
                return userRole;
            }
        }

        throw new IllegalArgumentException("Invalid user role value: " + role);
    }
}
