package sg.edu.ntu.garang_guni_backend.entities;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * The UserRole enum represents different roles a user can have in the system.
 * This enum has three constants: SCRAP_DEALER, CUSTOMER, and ADMIN,
 * each mapped to their corresponding string representations.
 *
 * <p>The enum provides custom JSON handling by annotating methods for serialization 
 * and deserialization.
 */
public enum UserRole {
    /**
     * Represents the "Scrap Dealer" role in the system.
     */
    SCRAP_DEALER("Scrap Dealer"),

    /**
     * Represents the "Customer" role in the system.
     */
    CUSTOMER("Customer"),

    /**
     * Represents the "Admin" role in the system.
     */
    ADMIN("Admin");

    private final String role;


    /**
     * Private constructor for the UserRole enum.
     *
     * @param role the string representation of the user role
     */
    private UserRole(String role) {
        this.role = role;
    }

    /**
     * Returns the string representation of the user role for JSON serialization.
     *
     * @return the role as a string (e.g., "Scrap Dealer", "Customer", "Admin")
     */
    @JsonValue
    public String getRole() {
        return role;
    }

    /**
     * Parses a string value into the corresponding {@code UserRole} enum constant.
     * This method is case-insensitive and is used for custom deserialization.
     *
     * <p>For example, a string value of "Customer" or "customer" would return {@code CUSTOMER}.
     *
     * @param role the string representation of the role (e.g., "Scrap Dealer", "Customer", "Admin")
     * @return the corresponding {@code UserRole} enum constant
     * @throws IllegalArgumentException if the provided role value does not match any enum constant
     */
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
