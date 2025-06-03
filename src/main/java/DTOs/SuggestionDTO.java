package DTOs;

import Models.Suggestion;
import java.time.LocalDateTime;

public class SuggestionDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private String image;
    private Integer likes;
    private String assignedByEmail;
    private boolean isLiked;

    public SuggestionDTO() {}

    public SuggestionDTO(Suggestion suggestion, String assignedByEmail, boolean isLiked) {
        this.id = suggestion.getId();
        this.title = suggestion.getTitle();
        this.description = suggestion.getDescription();
        this.createdAt = suggestion.getCreatedAt();
        this.image = suggestion.getImage();
        this.likes = suggestion.getLikes();
        this.assignedByEmail = assignedByEmail;
        this.isLiked = isLiked;    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Integer getLikes() {
        return likes;
    }

    public void setLikes(Integer likes) {
        this.likes = likes;
    }

    public String getAssignedByEmail() {
        return assignedByEmail;
    }

    public void setAssignedByEmail(String assignedByEmail) {
        this.assignedByEmail = assignedByEmail;
    }

    public boolean isLiked() {
        return isLiked;
    }

    public void setLiked(boolean liked) {
        isLiked = liked;
    }
}
