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
    List<Question> findAll();    Optional<Question> findById(Long id);
    
    @Query("SELECT q FROM Question q WHERE q.date = :date")    Optional<Question> findByDateExact(LocalDate date);
}
