package Models;

import jakarta.persistence.*;

@Entity
@Table(name = "user_suggestions")
public class UserSuggestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_suggestion")
    private Suggestion suggestion;
    
    public UserSuggestion() {}
    
    public UserSuggestion(User user, Suggestion suggestion) {
        this.user = user;
        this.suggestion = suggestion;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Suggestion getSuggestion() {
        return suggestion;
    }
    
    public void setSuggestion(Suggestion suggestion) {
        this.suggestion = suggestion;
    }
}
