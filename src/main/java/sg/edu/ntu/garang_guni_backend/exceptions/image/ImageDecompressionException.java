package sg.edu.ntu.garang_guni_backend.exceptions.image;

import sg.edu.ntu.garang_guni_backend.entities.Image;

public class ImageDecompressionException extends ImageUtilsException {
    public ImageDecompressionException(ImageErrorCode errorMsgCode, Image image) {
        super("Image cannot be decompressed due to the following reason: " 
                + errorMsgCode.getMessage() + "\n" 
                + "Image ID: " + image.getImageId() + "\n" 
                + "Image Name: " + image.getImageName(), errorMsgCode.getStatusCode());
    }
}
