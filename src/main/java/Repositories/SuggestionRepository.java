package Repositories;

import Models.Suggestion;
import Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
    List<Suggestion> findAll();
    Suggestion findById(long id);
    List<Suggestion> findByAssignedBy(User assignedBy);
    List<Suggestion> findByOrderByLikesDesc();
    List<Suggestion> findByOrderByCreatedAtDesc();
    List<Suggestion> findByTitleContainingIgnoreCase(String title);
}
