package sg.edu.ntu.garang_guni_backend.exceptions.image;

public enum ImageErrorCode {
    DECOMPRESS_DISK_FULL("Disk full: Unable to write decompressed image data", 507),
    COMPRESS_DISK_FULL("Disk full: Unable to write compressed image data", 507),
    DECOMPRESS_FILE_SYSTEM_ERROR("File system error: Unable to decompress image", 502),
    COMPRESS_FILE_SYSTEM_ERROR("File system error: Unable to compress image", 502),
    DECOMPRESS_GENERAL_ERROR("An error has occurred during image decompression", 500),
    COMPRESS_GENERAL_ERROR("An error has occured during image compression", 500),
    CORRUPT_DATA("Invalid compressed data format / methods or corrupted data", 400),
    INVALID_IMAGE_EXTENSION(
            "Unsupported image format. " 
            + " Please upload an image in one of the supported formats "
            + "(e.g., PNG, JPG, JPEG, GIF, BMP).",
            400);

    private final String message;
    private final Integer statusCode;

    ImageErrorCode(String message, Integer statusCode) {
        this.message = message;
        this.statusCode = statusCode;
    }

    public String getMessage() {
        return message;
    }

    public Integer getStatusCode() {
        return statusCode;
    }
}
