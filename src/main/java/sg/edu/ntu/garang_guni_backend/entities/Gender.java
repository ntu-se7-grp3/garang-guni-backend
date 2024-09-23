package sg.edu.ntu.garang_guni_backend.entities;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Gender {
    // enum constants calling the enum constructors
    MALE("Male"),
    FEMALE("Female");

    private final String gender;

    // private enum constructor
    private Gender(String gender) {
        this.gender = gender;
    }

    // Getter to return the custom value
    @JsonValue
    public String getGender() {
        return gender;
    }

    // Custom deserialization logic to handle mapping input to enum constants
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
