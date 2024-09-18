package sg.edu.ntu.garang_guni_backend.services.impls;

import jakarta.transaction.Transactional;
import java.io.IOException;
import java.util.UUID;
import java.util.zip.DataFormatException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sg.edu.ntu.garang_guni_backend.entities.Image;
import sg.edu.ntu.garang_guni_backend.exceptions.image.ImageCompressionException;
import sg.edu.ntu.garang_guni_backend.exceptions.image.ImageDecompressionException;
import sg.edu.ntu.garang_guni_backend.exceptions.image.ImageErrorCode;
import sg.edu.ntu.garang_guni_backend.exceptions.image.ImageNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.image.ImageUnsupportedTypeException;
import sg.edu.ntu.garang_guni_backend.repositories.ImageRepository;
import sg.edu.ntu.garang_guni_backend.services.ImageService;
import sg.edu.ntu.garang_guni_backend.utils.ImageUtils;

@Service
public class ImageServiceImpl implements ImageService {
    private ImageRepository imgRepository;

    public ImageServiceImpl(ImageRepository imgRepository) {
        this.imgRepository = imgRepository;
    }

    @Override
    public UUID uploadImage(MultipartFile file) {
        boolean isImage = ImageUtils.isImage(file);
        if (!isImage) {
            throw new ImageUnsupportedTypeException(
                ImageErrorCode.INVALID_IMAGE_EXTENSION, file);
        }
        
        try {
            Image image = Image.builder()
                    .imageName(file.getOriginalFilename())
                    .imageType(file.getContentType())
                    .imageData(ImageUtils.compressImage(file.getBytes()))
                    .build();
            imgRepository.save(image);
            return image.getImageId();
        } catch (IOException ioException) {
            ImageErrorCode errorMsgCode;
            if (ioException.getMessage().contains("Disk full")) {
                errorMsgCode = ImageErrorCode.COMPRESS_DISK_FULL;
            } else if (ioException.getMessage().contains("File system error")) {
                errorMsgCode = ImageErrorCode.COMPRESS_FILE_SYSTEM_ERROR;
            } else {
                errorMsgCode = ImageErrorCode.COMPRESS_GENERAL_ERROR;
            }

            throw new ImageCompressionException(errorMsgCode, file);
        }
    }

    @Override
    @Transactional
    public byte[] getImageByName(String imageName) {
        Image dbImage = imgRepository.findByImageName(imageName)
                .orElseThrow(() -> new ImageNotFoundException(imageName));

        try {
            return ImageUtils.decompressImage(dbImage.getImageData());
        } catch (IOException ioException) {
            ImageErrorCode errorMsgCode;
            if (ioException.getMessage().contains("Disk full")) {
                errorMsgCode = ImageErrorCode.DECOMPRESS_DISK_FULL;
            } else if (ioException.getMessage().contains("File system error")) {
                errorMsgCode = ImageErrorCode.DECOMPRESS_FILE_SYSTEM_ERROR;
            } else {
                errorMsgCode = ImageErrorCode.DECOMPRESS_GENERAL_ERROR;
            }

            throw new ImageDecompressionException(errorMsgCode, dbImage);
        } catch (DataFormatException dataFormatException) {
            throw new ImageDecompressionException(ImageErrorCode.CORRUPT_DATA, dbImage);
        }
    }

    @Override
    @Transactional
    public byte[] getImageById(UUID id) {
        Image dbImage = imgRepository.findById(id)
                .orElseThrow(() -> new ImageNotFoundException(id));

        try {
            return ImageUtils.decompressImage(dbImage.getImageData());
        } catch (IOException ioException) {
            ImageErrorCode errorMsgCode;
            if (ioException.getMessage().contains("Disk full")) {
                errorMsgCode = ImageErrorCode.DECOMPRESS_DISK_FULL;
            } else if (ioException.getMessage().contains("File system error")) {
                errorMsgCode = ImageErrorCode.DECOMPRESS_FILE_SYSTEM_ERROR;
            } else {
                errorMsgCode = ImageErrorCode.DECOMPRESS_GENERAL_ERROR;
            }

            throw new ImageDecompressionException(errorMsgCode, dbImage);
        } catch (DataFormatException dataFormatException) {
            throw new ImageDecompressionException(ImageErrorCode.CORRUPT_DATA, dbImage);
        }
    }

    @Override
    public UUID updateImage(UUID id, MultipartFile file) {
        boolean isImage = ImageUtils.isImage(file);
        if (!isImage) {
            throw new ImageUnsupportedTypeException(
                ImageErrorCode.INVALID_IMAGE_EXTENSION, file);
        }

        Image imageToUpdate = imgRepository.findById(id)
                .orElseThrow(() -> new ImageNotFoundException(id));

        try {
            imageToUpdate.setImageName(file.getOriginalFilename());
            imageToUpdate.setImageType(file.getContentType());
            imageToUpdate.setImageData(ImageUtils.compressImage(file.getBytes()));
            imgRepository.save(imageToUpdate);
            return imageToUpdate.getImageId();
        } catch (IOException ioException) {
            ImageErrorCode errorMsgCode;
            if (ioException.getMessage().contains("Disk full")) {
                errorMsgCode = ImageErrorCode.COMPRESS_DISK_FULL;
            } else if (ioException.getMessage().contains("File system error")) {
                errorMsgCode = ImageErrorCode.COMPRESS_FILE_SYSTEM_ERROR;
            } else {
                errorMsgCode = ImageErrorCode.COMPRESS_GENERAL_ERROR;
            }

            throw new ImageCompressionException(errorMsgCode, file);
        }
    }

    @Override
    public UUID deleteImage(UUID id) {
        Image imageToDelete = imgRepository.findById(id)
                .orElseThrow(() -> new ImageNotFoundException(id));
        imgRepository.deleteById(id);
        return imageToDelete.getImageId();
    }
}
