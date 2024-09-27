package sg.edu.ntu.garang_guni_backend.entities;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * The Gender enum represents a user's gender with custom serialization
 * and deserialization support for JSON. This enum has two constants, MALE 
 * and FEMALE, each mapped to their corresponding string representations.
 *
 * <p>The enum provides custom JSON handling by annotating methods for serialization 
 * and deserialization.
 */
public enum Gender {

    /**
     * Represents the Male gender, serialized as "Male".
     */
    MALE("Male"),

    /**
     * Represents the Female gender, serialized as "Female".
     */
    FEMALE("Female");

    private final String gender;

    /**
     * Private constructor for the {@code Gender} enum.
     *
     * @param gender the string representation of the gender
     */
    private Gender(String gender) {
        this.gender = gender;
    }

    /**
     * Returns the string representation of the gender for JSON serialization.
     *
     * @return the gender as a string (e.g., "Male", "Female")
     */
    @JsonValue
    public String getGender() {
        return gender;
    }

    /**
     * Parses a string value into the corresponding {@code Gender} enum constant.
     * This method is case-insensitive and used for custom deserialization.
     *
     * @param genderValue the string representation of the gender (e.g., "Male", "Female")
     * @return the corresponding {@code Gender} enum constant
     * @throws IllegalArgumentException if the provided genderValue does not match any enum constant
     */
    @JsonCreator
    public static Gender parseGender(String genderValue) {
        for (Gender gender : Gender.values()) {
            if (gender.gender.equalsIgnoreCase(genderValue)) {
                return gender;
            }
        }

        throw new IllegalArgumentException("Invalid gender value: " + genderValue);
    }
}
