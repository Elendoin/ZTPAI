package Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import Models.User;
import Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

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
}
