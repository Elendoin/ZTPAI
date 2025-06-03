package Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import Models.User;
import Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User management endpoints")
public class UserController {@Autowired
    private UserService userService;

    @Value("${jwt.cookie.name}")
    private String jwtCookieName;    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve all users in the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "404", description = "No users found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> getUsers(){
        List<User> users = userService.getAllUsers();
        if(users.isEmpty()){
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(users);
    }    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> getUser(
            @Parameter(description = "User ID", required = true) @PathVariable Long id){
        User user = userService.getUserById(id);
        if(user == null) {
            return ResponseEntity.status(404).body("User not found!");
        }        return ResponseEntity.ok(user);
    }    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, HttpServletResponse response){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            User currentUser = userService.getUserByEmail(currentUserEmail);
            
            if (currentUser.getRole().getValue().equals("ADMIN") || currentUser.getId().equals(id)) {
                // Check if user is deleting their own profile
                boolean isDeletingOwnProfile = currentUser.getId().equals(id);
                
                userService.deleteUser(id);
                
                // If user is deleting their own profile, clear the cookies to log them out
                if (isDeletingOwnProfile) {
                    Cookie jwtCookie = new Cookie(jwtCookieName, null);
                    jwtCookie.setHttpOnly(true);
                    jwtCookie.setSecure(false);
                    jwtCookie.setPath("/");
                    jwtCookie.setMaxAge(0);
                    response.addCookie(jwtCookie);
                }
                
                return ResponseEntity.ok("User successfully deleted! ID: " + id);
            } else {
                return ResponseEntity.status(403).body("You can only delete your own profile or you need admin privileges");
            }
        } catch (Exception e) {            return ResponseEntity.status(404).body("User not found!");
        }
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<?> updateUserAnswer(@PathVariable Long id, @RequestBody Map<String, Object> answerRequest) {
        try {
            Boolean isCorrect = (Boolean) answerRequest.get("correct");
            String userAnswer = (String) answerRequest.get("answer");
            
            if (isCorrect == null) {
                return ResponseEntity.badRequest().body("Missing 'correct' field");
            }            if (userAnswer == null) {
                return ResponseEntity.badRequest().body("Missing 'answer' field");
            }

            if (userService.hasUserAnsweredToday(id)) {
                return ResponseEntity.badRequest().body("User has already answered today");
            }

            User updatedUser = userService.updateUserStats(id, isCorrect, userAnswer);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("User not found!");
        }
    }

    @GetMapping("/{id}/answered-today")
    public ResponseEntity<Map<String, Boolean>> hasUserAnsweredToday(@PathVariable Long id) {
        boolean hasAnswered = userService.hasUserAnsweredToday(id);
        return ResponseEntity.ok(Map.of("hasAnsweredToday", hasAnswered));
    }
}
