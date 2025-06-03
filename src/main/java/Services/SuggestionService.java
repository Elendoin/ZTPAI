package Services;

import Repositories.SuggestionRepository;
import org.springframework.stereotype.Service;
import Models.*;
import DTOs.SuggestionDTO;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;

@Service
public class SuggestionService {
    
    @Autowired
    private SuggestionRepository suggestionRepository;

    @Autowired
    private UserSuggestionService userSuggestionService;

    public Suggestion getSuggestionById(long id) {
        return suggestionRepository.findById(id);
    }

    public List<Suggestion> getAllSuggestions() {
        return suggestionRepository.findAll();
    }

    public List<Suggestion> getSuggestionsByUser(User user) {
        return suggestionRepository.findByAssignedBy(user);
    }

    public List<Suggestion> getSuggestionsByLikes() {
        return suggestionRepository.findByOrderByLikesDesc();
    }

    public List<Suggestion> getSuggestionsByDate() {
        return suggestionRepository.findByOrderByCreatedAtDesc();
    }    public List<Suggestion> searchSuggestionsByTitle(String title) {
        return suggestionRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<SuggestionDTO> getAllSuggestionsWithUserInfo(User currentUser) {
        List<Suggestion> suggestions = suggestionRepository.findAll();
        List<SuggestionDTO> suggestionDTOs = new ArrayList<>();
        
        for (Suggestion suggestion : suggestions) {
            String assignedByEmail = suggestion.getAssignedBy() != null ? 
                suggestion.getAssignedBy().getEmail() : "Anonymous";
            boolean isLiked = currentUser != null && 
                userSuggestionService.existsByUserAndSuggestion(currentUser, suggestion);
            
            suggestionDTOs.add(new SuggestionDTO(suggestion, assignedByEmail, isLiked));
        }
        
        return suggestionDTOs;
    }

    public Suggestion createSuggestion(String title, String description, String image, User assignedBy) throws Exception {
        if (title == null || title.trim().isEmpty()) {
            throw new Exception("Title is required");
        }
        if (assignedBy == null) {
            throw new Exception("Assigned by user is required");
        }

        Suggestion suggestion = new Suggestion();
        suggestion.setTitle(title);
        suggestion.setDescription(description);
        suggestion.setImage(image);
        suggestion.setAssignedBy(assignedBy);
        suggestion.setCreatedAt(LocalDateTime.now());
        suggestion.setLikes(0);

        return suggestionRepository.save(suggestion);
    }

    public Suggestion updateSuggestion(long id, String title, String description, String image) throws Exception {
        Suggestion suggestion = suggestionRepository.findById(id);
        if (suggestion == null) {
            throw new Exception("Suggestion not found");
        }

        if (title != null && !title.trim().isEmpty()) {
            suggestion.setTitle(title);
        }
        if (description != null) {
            suggestion.setDescription(description);
        }
        if (image != null) {
            suggestion.setImage(image);
        }

        return suggestionRepository.save(suggestion);
    }    public Suggestion likeSuggestion(long id) throws Exception {
        Suggestion suggestion = suggestionRepository.findById(id);
        if (suggestion == null) {
            throw new Exception("Suggestion not found");
        }

        suggestion.setLikes(suggestion.getLikes() + 1);
        return suggestionRepository.save(suggestion);
    }

    public SuggestionDTO toggleLikeSuggestion(long suggestionId, User user) throws Exception {
        Suggestion suggestion = suggestionRepository.findById(suggestionId);
        if (suggestion == null) {
            throw new Exception("Suggestion not found");
        }

        boolean wasLiked = userSuggestionService.existsByUserAndSuggestion(user, suggestion);
          if (wasLiked) {
            userSuggestionService.deleteUserSuggestion(user, suggestion);
            if (suggestion.getLikes() > 0) {
                suggestion.setLikes(suggestion.getLikes() - 1);
            }
        } else {
            userSuggestionService.createUserSuggestion(user, suggestion);
            suggestion.setLikes(suggestion.getLikes() + 1);
        }
        
        suggestion = suggestionRepository.save(suggestion);
        
        String assignedByEmail = suggestion.getAssignedBy() != null ? 
            suggestion.getAssignedBy().getEmail() : "Anonymous";
        boolean isLiked = !wasLiked;
        
        return new SuggestionDTO(suggestion, assignedByEmail, isLiked);
    }

    public Suggestion unlikeSuggestion(long id) throws Exception {
        Suggestion suggestion = suggestionRepository.findById(id);
        if (suggestion == null) {
            throw new Exception("Suggestion not found");
        }

        if (suggestion.getLikes() > 0) {
            suggestion.setLikes(suggestion.getLikes() - 1);
        }
        return suggestionRepository.save(suggestion);
    }

    public void deleteSuggestion(long id) throws Exception {
        Suggestion suggestion = suggestionRepository.findById(id);
        if (suggestion == null) {
            throw new Exception("Suggestion not found");
        }
        suggestionRepository.delete(suggestion);
    }
}
