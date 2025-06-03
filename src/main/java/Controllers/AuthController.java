package Controllers;

import DTOs.AuthResponseDTO;
import DTOs.LoginRequestDTO;
import DTOs.RegisterRequestDTO;
import DTOs.UserDTO;
import Models.User;
import Services.AuthService;
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
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${jwt.cookie.name}")
    private String jwtCookieName;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequest) {        try {
            User user = authService.register(registerRequest);
            return ResponseEntity.ok(new AuthResponseDTO("User registered successfully", true, user.getId(), user.getRole(), user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponseDTO(e.getMessage(), false));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest, 
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

    @PostMapping("/logout")    public ResponseEntity<AuthResponseDTO> logout(HttpServletResponse response) {
        Cookie jwtCookie = new Cookie(jwtCookieName, null);        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0);
        
        response.addCookie(jwtCookie);
        
        return ResponseEntity.ok(new AuthResponseDTO("Logout successful", true));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            UserDTO userInfo = authService.getUserInfo(user.getEmail());
            return ResponseEntity.ok(userInfo);
        }
        
        return ResponseEntity.status(401).body(new AuthResponseDTO("Not authenticated", false));
    }    @GetMapping("/status")
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
