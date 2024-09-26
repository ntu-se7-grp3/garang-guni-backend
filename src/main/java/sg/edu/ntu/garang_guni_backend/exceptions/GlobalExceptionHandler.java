package sg.edu.ntu.garang_guni_backend.exceptions;

import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles not found exception.
     *
     * @param exception the exception that was thrown
     * @return a ResponseEntity containing the error message and a 404 Not Found status
     */
    @ExceptionHandler(
        {
            UserNotFoundException.class,
            UsernameNotFoundException.class 
        }
    )
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
        RuntimeException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
            exception.getMessage(),
            LocalDateTime.now()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles the UserExistsException when a user attempts to register with an email
     * that already exists in the system.
     *
     * @param exception the UserExistsException thrown when a duplicate user is detected
     * @return a ResponseEntity containing the error message and a 409 CONFLICT status
     */
    @ExceptionHandler(UserExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserExistsException(UserExistsException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
            exception.getMessage(),
            LocalDateTime.now()
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handles any general exceptions thrown during the application's execution.
     * If the exception is of type BadCredentialsException, it returns an unauthorized response.
     *
     * @param exception the exception that was thrown
     * @return a ResponseEntity containing a customized error message
     * and the appropriate HTTP status
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception exception) {
        logger.error(exception.getMessage(), exception);

        if (exception instanceof BadCredentialsException) {
            ErrorResponse errorResponse = new ErrorResponse(
                "The email or password is incorrect",
                LocalDateTime.now()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }

        ErrorResponse errorResponse = new ErrorResponse(
            "Something went wrong", LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handles validation exceptions (MethodArgumentNotValidException) that occur
     * when the input data fails validation.
     *
     * @param exception the MethodArgumentNotValidException thrown by the application
     * @return a ResponseEntity containing all validation error messages
     * and a 400 Bad Request status
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException exception) {
        List<ObjectError> validationErrors = exception.getBindingResult().getAllErrors();
        StringBuilder sb = new StringBuilder();

        for (ObjectError error : validationErrors) {
            sb.append(error.getDefaultMessage() + ". ");
        }
        ErrorResponse errorResponse = new ErrorResponse(sb.toString(), LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
