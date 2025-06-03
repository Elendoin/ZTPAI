package Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import Models.Suggestion;
import Models.User;
import Services.SuggestionService;
import Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    @Autowired
    private SuggestionService suggestionService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getSuggestions() {
        List<Suggestion> suggestions = suggestionService.getAllSuggestions();
        if (suggestions.isEmpty()) {
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSuggestion(@PathVariable Long id) {
        Suggestion suggestion = suggestionService.getSuggestionById(id);
        if (suggestion == null) {
            return ResponseEntity.status(404).body("Suggestion not found!");
        }        return ResponseEntity.ok(suggestion);
    }

    @PostMapping
    public ResponseEntity<?> createSuggestion(@RequestBody Map<String, Object> suggestionRequest) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            User currentUser = userService.getUserByEmail(currentUserEmail);

            String title = (String) suggestionRequest.get("title");
            String description = (String) suggestionRequest.get("description");
            String image = (String) suggestionRequest.get("image");

            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title is required");
            }

            Suggestion newSuggestion = suggestionService.createSuggestion(title, description, image, currentUser);
            return ResponseEntity.ok(newSuggestion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create suggestion: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSuggestion(@PathVariable Long id, @RequestBody Map<String, Object> suggestionRequest) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            User currentUser = userService.getUserByEmail(currentUserEmail);
            
            Suggestion suggestion = suggestionService.getSuggestionById(id);
            if (suggestion == null) {
                return ResponseEntity.status(404).body("Suggestion not found!");
            }
            
            // Allow update if user is admin OR if user is the one who created the suggestion
            if (!currentUser.getRole().getValue().equals("ADMIN") && 
                !suggestion.getAssignedBy().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body("You can only update your own suggestions or you need admin privileges");
            }

            String title = (String) suggestionRequest.get("title");
            String description = (String) suggestionRequest.get("description");
            String image = (String) suggestionRequest.get("image");

            Suggestion updatedSuggestion = suggestionService.updateSuggestion(id, title, description, image);
            return ResponseEntity.ok(updatedSuggestion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update suggestion: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeSuggestion(@PathVariable Long id) {
        try {
            Suggestion likedSuggestion = suggestionService.likeSuggestion(id);
            return ResponseEntity.ok(likedSuggestion);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Suggestion not found!");
        }
    }

    @PostMapping("/{id}/unlike")
    public ResponseEntity<?> unlikeSuggestion(@PathVariable Long id) {
        try {
            Suggestion unlikedSuggestion = suggestionService.unlikeSuggestion(id);
            return ResponseEntity.ok(unlikedSuggestion);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Suggestion not found!");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSuggestion(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            User currentUser = userService.getUserByEmail(currentUserEmail);
            
            Suggestion suggestion = suggestionService.getSuggestionById(id);
            if (suggestion == null) {
                return ResponseEntity.status(404).body("Suggestion not found!");
            }
            
        
            if (currentUser.getRole().getValue().equals("ADMIN") || 
                suggestion.getAssignedBy().getId().equals(currentUser.getId())) {
                suggestionService.deleteSuggestion(id);
                return ResponseEntity.ok("Suggestion successfully deleted! ID: " + id);
            } else {
                return ResponseEntity.status(403).body("You can only delete your own suggestions or you need admin privileges");
            }
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Suggestion not found!");
        }
    }
}
