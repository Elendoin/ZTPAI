package Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Models.User;

import java.util.ArrayList;
import java.util.List;

@RestController
public class SecurityController {
    private static final List<User> users = new ArrayList<User>();

    static class LoginRequest {
        public String email;
        public String password;
    }

    static class RegitserRequest {
        public String username;
        public String surname;
        public String email;
        public String password;
    }

    @GetMapping("/api/users")
    public ResponseEntity<?> getUsers(){
        if(users.isEmpty()){
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/api/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id){
        for(User user : users){
            if(user.getId().equals(id)){
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(404).body("User not found!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        for(User user : users){
            if(request.email.equals(user.getEmail()) && request.password.equals(user.getPassword())){
                return ResponseEntity.ok("Logged in successfully!" + user.getId());
            }
        }
        return ResponseEntity.status(401).body("Login failed!");

    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegitserRequest request) {
        for(User user : users){
            if(request.email.equals(user.getEmail())){
                return ResponseEntity.badRequest().body("Email already in use!");
            }
        }

        User user = new User(users.size()+1L, request.email, request.password);
        users.add(user);
        return ResponseEntity.ok("User successfully registered!" + user.getId());
    }

    @DeleteMapping("/api/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id){
        for(User user : users){
            if(user.getId().equals(id)){
                users.remove(user);
                return ResponseEntity.ok("User successfully deleted! ID: " + user.getId());
            }
        }
        return ResponseEntity.status(404).body("User not found!");
    }
}
