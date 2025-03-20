package Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import Models.User;

import java.util.ArrayList;
import java.util.List;

@RestController
public class SecurityController {
    private static final List<User> users = new ArrayList<User>();

    static {
        users.add(new User(1L, "John", "Test", "johntest@gmail.com", "123"));
        users.add(new User(2L, "John", "Frog", "johnfrog@gmail.com", "123"));
    }

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        for(User user : users){
            if(request.email.equals(user.getEmail()) && request.password.equals(user.getPassword())){
                return ResponseEntity.ok("Logged in successfully" + user.getId());
            }
        }
        return ResponseEntity.status(401).build();

    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegitserRequest request) {
        for(User user : users){
            if(request.email.equals(user.getEmail())){
                return ResponseEntity.badRequest().body("Email already in use!");
            }
        }

        User user = new User(users.size()+1L, request.username, request.surname, request.email, request.password);
        users.add(user);
        return ResponseEntity.ok("User successfully registered!" + user.getId());
    }


}
