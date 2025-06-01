package Services;

import Repositories.UserRepository;
import org.springframework.stereotype.Service;
import Models.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    public User getUserById(long id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(long id) throws Exception {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new Exception("User not found");
        }
        userRepository.delete(user);
    }
}
