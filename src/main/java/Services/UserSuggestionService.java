package Services;

import Repositories.UserSuggestionRepository;
import org.springframework.stereotype.Service;
import Models.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@Service
public class UserSuggestionService {
    
    @Autowired
    private UserSuggestionRepository userSuggestionRepository;

    public UserSuggestion getUserSuggestionById(long id) {
        Optional<UserSuggestion> userSuggestion = userSuggestionRepository.findById(id);
        return userSuggestion.orElse(null);
    }

    public List<UserSuggestion> getAllUserSuggestions() {
        return userSuggestionRepository.findAll();
    }

    public List<UserSuggestion> getUserSuggestionsByUser(User user) {
        return userSuggestionRepository.findByUser(user);
    }

    public List<UserSuggestion> getUserSuggestionsBySuggestion(Suggestion suggestion) {
        return userSuggestionRepository.findBySuggestion(suggestion);
    }

    public UserSuggestion createUserSuggestion(User user, Suggestion suggestion) throws Exception {
        if (user == null) {
            throw new Exception("User is required");
        }
        if (suggestion == null) {
            throw new Exception("Suggestion is required");
        }

        if (userSuggestionRepository.existsByUserAndSuggestion(user, suggestion)) {
            throw new Exception("User suggestion relationship already exists");
        }

        UserSuggestion userSuggestion = new UserSuggestion(user, suggestion);
        return userSuggestionRepository.save(userSuggestion);
    }

    public UserSuggestion findByUserAndSuggestion(User user, Suggestion suggestion) {
        Optional<UserSuggestion> userSuggestion = userSuggestionRepository.findByUserAndSuggestion(user, suggestion);
        return userSuggestion.orElse(null);
    }

    public boolean existsByUserAndSuggestion(User user, Suggestion suggestion) {
        return userSuggestionRepository.existsByUserAndSuggestion(user, suggestion);
    }

    public void deleteUserSuggestion(long id) throws Exception {
        Optional<UserSuggestion> userSuggestion = userSuggestionRepository.findById(id);
        if (userSuggestion.isEmpty()) {
            throw new Exception("User suggestion not found");
        }
        userSuggestionRepository.delete(userSuggestion.get());
    }

    public void deleteUserSuggestion(User user, Suggestion suggestion) throws Exception {
        Optional<UserSuggestion> userSuggestion = userSuggestionRepository.findByUserAndSuggestion(user, suggestion);
        if (userSuggestion.isEmpty()) {
            throw new Exception("User suggestion relationship not found");
        }
        userSuggestionRepository.delete(userSuggestion.get());
    }
}
