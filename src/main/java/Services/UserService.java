package Services;

import Repositories.UserRepository;
import org.springframework.stereotype.Service;
import Models.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.time.LocalDate;

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
    }    public User updateUserStats(long userId, boolean isCorrect, String userAnswer) throws Exception {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw new Exception("User not found");
        }

        UserStats stats = user.getUserStats();
        if (stats == null) {
            stats = new UserStats();
            user.setUserStats(stats);        }

        if (isCorrect) {
            stats.setWins(stats.getWins() + 1);
        } else {
            stats.setLosses(stats.getLosses() + 1);        }

        stats.setLatestAnswer(userAnswer);
        stats.setLastAnswered(LocalDate.now());

        return userRepository.save(user);
    }

    public boolean hasUserAnsweredToday(long userId) {
        User user = userRepository.findById(userId);
        if (user == null || user.getUserStats() == null) {
            return false;
        }

        LocalDate today = LocalDate.now();
        LocalDate lastAnswered = user.getUserStats().getLastAnswered();
        
        return lastAnswered != null && lastAnswered.equals(today);
    }
}
