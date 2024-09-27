package sg.edu.ntu.garang_guni_backend.exceptions;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import sg.edu.ntu.garang_guni_backend.exceptions.booking.BookingNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.image.ImageNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.image.ImageUtilsException;
import sg.edu.ntu.garang_guni_backend.exceptions.item.ItemNotFoundException;
import sg.edu.ntu.garang_guni_backend.exceptions.location.LocationNotFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

    private final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(
        {
            ContactNotFoundException.class,
            ImageNotFoundException.class,
            ItemNotFoundException.class,
            LocationNotFoundException.class,
            BookingNotFoundException.class
        })
    public ResponseEntity<ErrorResponse> handleResourceException(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(ContactNotProcessingException.class)
    public ResponseEntity<ErrorResponse> handleContactNotProcessingException(
            ContactNotProcessingException ex) {
        logger.error("Error: ", ex);
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR); // 500
    }

    @ExceptionHandler(ImageUtilsException.class)
    public ResponseEntity<ErrorResponse> handleImageCompressionException(ImageUtilsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(ex.getStatusCode()).body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
                MethodArgumentNotValidException ex) {
        List<ObjectError> validationErrors = ex.getBindingResult().getAllErrors();
        StringBuilder sb = new StringBuilder();
        for (ObjectError error : validationErrors) {
            sb.append(error.getDefaultMessage() + ". ");
        }
        ErrorResponse errorResponse = new ErrorResponse(sb.toString(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {
        String errorMsg = ex.getMessage();
        String re = "Detail: ([^]]+)";
        Pattern pattern = Pattern.compile(re);
        Matcher matcher = pattern.matcher(errorMsg);
        String detailMsg = "";
        if (matcher.find()) {
            detailMsg = matcher.group(1).trim();
        } else {
            detailMsg = "Unknown unique constraint has been violated";
        }

        ErrorResponse errorMessage = new ErrorResponse(
                    "A data integrity error occurred: " + detailMsg, LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorMessage);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(
                HttpMessageNotReadableException ex) {
        ErrorResponse errorResponse = new ErrorResponse("Malformed JSON request",
                LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex) {
        logger.warn("Validation failed: {}", ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST); // 400
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse("Something went wrong",
                LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
package sg.edu.ntu.garang_guni_backend.exceptions;

import jakarta.validation.ValidationException;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    private final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ContactNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleContactNotFoundException(
            ContactNotFoundException ex) {
        logger.error("Error: ", ex);
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND); // 404
    }

    @ExceptionHandler(ContactNotProcessingException.class)
    public ResponseEntity<ErrorResponse> handleContactNotProcessingException(
            ContactNotProcessingException ex) {
        logger.error("Error: ", ex);
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR); // 500
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
        MethodArgumentNotValidException ex) {
        logger.warn("Validation failed: {}", ex.getMessage());
        List<ObjectError> validationErrors = ex.getBindingResult().getAllErrors();
        StringBuilder sb = new StringBuilder();
        for (ObjectError error : validationErrors) {
            sb.append(error.getDefaultMessage()).append(". ");
        }
        ErrorResponse errorResponse = new ErrorResponse(sb.toString(), LocalDateTime.now());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST); // 400
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex) {
        logger.warn("Validation failed: {}", ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), LocalDateTime.now());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST); // 400
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        logger.error("Unexpected Error: ", ex);
        ErrorResponse errorResponse = new ErrorResponse(
                "An error occurred. Please contact support.", LocalDateTime.now());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR); // 500
    }
}
