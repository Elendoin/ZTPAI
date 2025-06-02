package Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import Models.User;
import Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getUsers(){
        List<User> users = userService.getAllUsers();
        if(users.isEmpty()){
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id){
        User user = userService.getUserById(id);
        if(user == null) {
            return ResponseEntity.status(404).body("User not found!");
        }
        return ResponseEntity.ok(user);
    }    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id){
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User successfully deleted! ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("User not found!");
        }
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<?> updateUserAnswer(@PathVariable Long id, @RequestBody Map<String, Boolean> answerRequest) {
        try {
            Boolean isCorrect = answerRequest.get("correct");
            if (isCorrect == null) {
                return ResponseEntity.badRequest().body("Missing 'correct' field");
            }

            // Check if user has already answered today
            if (userService.hasUserAnsweredToday(id)) {
                return ResponseEntity.badRequest().body("User has already answered today");
            }

            User updatedUser = userService.updateUserStats(id, isCorrect);
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
