package Repositories;

import Models.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findAll();
    Optional<Question> findById(Long id);
    
    // Find questions by date
    List<Question> findByDate(LocalDate date);
    
    // Find questions between dates
    List<Question> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find questions ordered by date (newest first)
    List<Question> findAllByOrderByDateDesc();
    
    // Find today's question
    @Query("SELECT q FROM Question q WHERE q.date = :date")
    Optional<Question> findByDateExact(LocalDate date);
    
    // Count total questions
    long count();
}
