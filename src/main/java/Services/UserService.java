package Services;

import Repositories.UserRepository;
import org.springframework.stereotype.Service;
import Models.*;

@Service
public class UserService {
    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserById(long id) {
        return userRepository.findById(id);
    }

}
