package Controllers;

import DTOs.AuthResponseDTO;
import DTOs.LoginRequestDTO;
import DTOs.RegisterRequestDTO;
import DTOs.UserDTO;
import Models.User;
import Services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
@Tag(name = "Authentication", description = "User authentication and authorization endpoints")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${jwt.cookie.name}")
    private String jwtCookieName;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a new user account with email, password, name, and surname")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User registered successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = AuthResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Registration failed - invalid data or user already exists",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = AuthResponseDTO.class)))
    })
    public ResponseEntity<AuthResponseDTO> register(
            @Parameter(description = "User registration details", required = true)
            @Valid @RequestBody RegisterRequestDTO registerRequest) {        try {
            User user = authService.register(registerRequest);
            return ResponseEntity.ok(new AuthResponseDTO("User registered successfully", true, user.getId(), user.getRole(), user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponseDTO(e.getMessage(), false));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user with email and password")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = AuthResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Login failed - invalid credentials",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = AuthResponseDTO.class)))
    })
    public ResponseEntity<AuthResponseDTO> login(
            @Parameter(description = "User login credentials", required = true)
            @Valid @RequestBody LoginRequestDTO loginRequest, 
            HttpServletResponse response) {
        try {            String token = authService.login(loginRequest);
            
            Cookie jwtCookie = new Cookie(jwtCookieName, token);            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge((int) (jwtExpiration / 1000));
              response.addCookie(jwtCookie);
              UserDTO userInfo = authService.getUserInfo(loginRequest.getEmail());
            return ResponseEntity.ok(new AuthResponseDTO("Login successful", true, userInfo.getId(), userInfo.getRole(), userInfo.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponseDTO(e.getMessage(), false));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Clear user authentication cookie and logout")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout successful",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = AuthResponseDTO.class)))
    })
    public ResponseEntity<AuthResponseDTO> logout(HttpServletResponse response) {
        Cookie jwtCookie = new Cookie(jwtCookieName, null);        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0);
        
        response.addCookie(jwtCookie);
        
        return ResponseEntity.ok(new AuthResponseDTO("Logout successful", true));
    }    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get details of the currently authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User details retrieved successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = UserDTO.class))),
        @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = AuthResponseDTO.class)))
    })
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            UserDTO userInfo = authService.getUserInfo(user.getEmail());
            return ResponseEntity.ok(userInfo);
        }
        
        return ResponseEntity.status(401).body(new AuthResponseDTO("Not authenticated", false));
    }    @GetMapping("/status")
    @Operation(summary = "Check authentication status", description = "Check if user is currently authenticated")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Authentication status checked",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = AuthResponseDTO.class)))
    })
    public ResponseEntity<AuthResponseDTO> getAuthStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
          if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(new AuthResponseDTO("Authenticated", true, user.getId(), user.getRole(), user.getEmail()));
        }
        
        return ResponseEntity.ok(new AuthResponseDTO("Not authenticated", false));
    }
}
