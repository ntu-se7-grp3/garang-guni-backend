package sg.edu.ntu.garang_guni_backend.services;

import java.util.List;
import java.util.UUID;
import sg.edu.ntu.garang_guni_backend.entities.Booking;
import sg.edu.ntu.garang_guni_backend.entities.Location;

public interface LocationService {
    Location createLocation(Location location);

    Location getLocationById(UUID locationId);

    List<Location> getLocationsWithoutBooking();

    Location updateLocation(UUID locationId, Location updatedLocation);

    Location deleteLocation(UUID locationId);

    Booking addNewBookingToLocation(UUID locationId, Booking newBooking);

    Booking addExisitingBookingToLocation(UUID locationId, UUID bookingId);

    List<Booking> getAllBookings(UUID locationId);
}
