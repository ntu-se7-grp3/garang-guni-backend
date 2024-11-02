package sg.edu.ntu.garang_guni_backend.exceptions.image;

public class ImageUtilsException extends RuntimeException {
    private final Integer statusCode;

    public ImageUtilsException(String message, Integer statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public Integer getStatusCode() {
        return statusCode;
    }
}
