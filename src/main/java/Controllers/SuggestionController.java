package Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import Models.Suggestion;
import Models.User;
import DTOs.SuggestionDTO;
import Services.SuggestionService;
import Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/suggestions")
@Tag(name = "Suggestions", description = "Suggestion management endpoints")
public class SuggestionController {

    @Autowired
    private SuggestionService suggestionService;

    @Autowired
    private UserService userService;    @GetMapping
    @Operation(summary = "Get all suggestions", description = "Retrieve all suggestions with user-specific like status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Suggestions retrieved successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = SuggestionDTO.class))),
        @ApiResponse(responseCode = "404", description = "No suggestions found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> getSuggestions() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = null;
            
            if (auth != null && !auth.getName().equals("anonymousUser")) {
                String currentUserEmail = auth.getName();
                currentUser = userService.getUserByEmail(currentUserEmail);
            }
            
            List<SuggestionDTO> suggestions = suggestionService.getAllSuggestionsWithUserInfo(currentUser);
            if (suggestions.isEmpty()) {
                return ResponseEntity.status(404).build();
            }
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching suggestions: " + e.getMessage());
        }
    }    @GetMapping("/{id}")
    @Operation(summary = "Get suggestion by ID", description = "Retrieve a specific suggestion by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Suggestion found",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = Suggestion.class))),
        @ApiResponse(responseCode = "404", description = "Suggestion not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> getSuggestion(
            @Parameter(description = "Suggestion ID", required = true) @PathVariable Long id) {
        Suggestion suggestion = suggestionService.getSuggestionById(id);
        if (suggestion == null) {
            return ResponseEntity.status(404).body("Suggestion not found!");
        }        return ResponseEntity.ok(suggestion);
    }    @PostMapping
    @Operation(summary = "Create new suggestion", description = "Create a new suggestion with title, description and optional image")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Suggestion created successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = Suggestion.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> createSuggestion(
            @Parameter(description = "Suggestion title", required = true) @RequestParam("title") String title,
            @Parameter(description = "Suggestion description", required = true) @RequestParam("description") String description,
            @Parameter(description = "Optional image file") @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            User currentUser = userService.getUserByEmail(currentUserEmail);

            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title is required");
            }            String imagePath = null;
            if (file != null && !file.isEmpty()) {
                String contentType = file.getContentType();
                if (contentType == null || (!contentType.startsWith("image/"))) {
                    return ResponseEntity.badRequest().body("Invalid file type. Only images are allowed.");
                }

                if (file.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body("File size too large. Maximum size is 5MB.");
                }

                String originalFilename = file.getOriginalFilename();
                String fileExtension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String fileName = UUID.randomUUID().toString() + fileExtension;

                Path uploadPath = Paths.get("react-app/public/img");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                imagePath = fileName;
            }

            Suggestion newSuggestion = suggestionService.createSuggestion(title, description, imagePath, currentUser);
            return ResponseEntity.ok(newSuggestion);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload file: " + e.getMessage());
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
            
            Suggestion suggestion = suggestionService.getSuggestionById(id);            if (suggestion == null) {
                return ResponseEntity.status(404).body("Suggestion not found!");
            }
            
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
    }    @PostMapping("/{id}/like")
    @Operation(summary = "Toggle like on suggestion", description = "Like or unlike a suggestion (toggles the current state)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Like status toggled successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = SuggestionDTO.class))),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Suggestion not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> likeSuggestion(
            @Parameter(description = "Suggestion ID", required = true) @PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            User currentUser = userService.getUserByEmail(currentUserEmail);
            
            if (currentUser == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            SuggestionDTO suggestionDTO = suggestionService.toggleLikeSuggestion(id, currentUser);
            return ResponseEntity.ok(suggestionDTO);
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
    }    @DeleteMapping("/{id}")
    @Operation(summary = "Delete suggestion", description = "Delete a suggestion (only by owner or admin)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Suggestion deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Insufficient privileges - you can only delete your own suggestions"),
        @ApiResponse(responseCode = "404", description = "Suggestion not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> deleteSuggestion(
            @Parameter(description = "Suggestion ID", required = true) @PathVariable Long id) {
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
