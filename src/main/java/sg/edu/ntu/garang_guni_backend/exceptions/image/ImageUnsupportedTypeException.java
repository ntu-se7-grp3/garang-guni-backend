package sg.edu.ntu.garang_guni_backend.exceptions.image;

import org.springframework.web.multipart.MultipartFile;

public class ImageUnsupportedTypeException extends ImageUtilsException {
    public ImageUnsupportedTypeException(ImageErrorCode errorMsgCode, MultipartFile file) {
        super("Could not find a supported image (" + file.getOriginalFilename() 
                + ").\n" + errorMsgCode.getMessage(),
                errorMsgCode.getStatusCode());
    }
}
