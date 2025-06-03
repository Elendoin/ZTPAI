package Repositories;

import Models.UserSuggestion;
import Models.User;
import Models.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSuggestionRepository extends JpaRepository<UserSuggestion, Long> {
    List<UserSuggestion> findAll();
    List<UserSuggestion> findByUser(User user);
    List<UserSuggestion> findBySuggestion(Suggestion suggestion);
    Optional<UserSuggestion> findByUserAndSuggestion(User user, Suggestion suggestion);
    boolean existsByUserAndSuggestion(User user, Suggestion suggestion);
}
