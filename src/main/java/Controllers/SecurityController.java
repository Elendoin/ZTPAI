package Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
        public String username;
        public String password;
    }

    @GetMapping("/api/users")
    public ResponseEntity<?> getUsers(){
        if(users.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }


}
