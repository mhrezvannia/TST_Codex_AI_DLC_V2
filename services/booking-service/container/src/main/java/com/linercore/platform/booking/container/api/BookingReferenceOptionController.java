package com.linercore.platform.booking.container.api;

import com.linercore.platform.booking.applicationservice.port.ReferenceSet;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderUnavailable;
import com.linercore.platform.booking.container.integration.HttpReferenceOptionAdapter;
import com.linercore.platform.booking.container.integration.HttpReferenceOptionAdapter.ReferenceOption;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/reference-options")
public class BookingReferenceOptionController {
    private final HttpReferenceOptionAdapter options;

    public BookingReferenceOptionController(HttpReferenceOptionAdapter options) {
        this.options = options;
    }

    @GetMapping
    public List<ReferenceOption> list(
            @RequestParam("set") ReferenceSet set,
            @RequestParam(name = "search", required = false) String search,
            @RequestHeader(name = "X-Correlation-Id") String correlationId) {
        return options.activeOptions(set, search, correlationId);
    }

    @ExceptionHandler(ReferenceProviderUnavailable.class)
    public ResponseEntity<ErrorResponse> unavailable(ReferenceProviderUnavailable exception) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse("REFERENCE_DATA_UNAVAILABLE", exception.getMessage(),
                        exception.correlationId()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("REFERENCE_OPTION_VALIDATION", exception.getMessage(), null));
    }

    public record ErrorResponse(String code, String message, String correlationId) {
    }
}
