package sg.edu.ntu.garang_guni_backend.exceptions.image;

import org.springframework.web.multipart.MultipartFile;

public class ImageCompressionException extends ImageUtilsException {
    public ImageCompressionException(ImageErrorCode errorMsgCode, MultipartFile image) {
        super("Image cannot be compressed due to the following reason: " 
                + errorMsgCode.getMessage() + "\n" + "Image Name: " 
                + image.getOriginalFilename(), errorMsgCode.getStatusCode());
    }
}
