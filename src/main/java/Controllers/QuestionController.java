package Controllers;

import DTOs.QuestionDTO;
import Services.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;    // Get all questions (without correct answers)
    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        List<QuestionDTO> questions = questionService.getAllQuestionsWithoutAnswers();
        return ResponseEntity.ok(questions);
    }

    // Get question by ID (without correct answer)
    @GetMapping("/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Long id) {
        Optional<QuestionDTO> question = questionService.getQuestionByIdWithoutAnswer(id);
        return question.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    // Get today's question
    @GetMapping("/today")
    public ResponseEntity<QuestionDTO> getTodaysQuestion() {
        Optional<QuestionDTO> question = questionService.getTodaysQuestion();
        return question.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    // Get question by specific date
    @GetMapping("/date/{date}")
    public ResponseEntity<QuestionDTO> getQuestionByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Optional<QuestionDTO> question = questionService.getQuestionByDate(date);
        return question.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    // Get questions by date range
    @GetMapping("/range")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<QuestionDTO> questions = questionService.getQuestionsByDateRange(startDate, endDate);
        return ResponseEntity.ok(questions);
    }

    // Get all questions ordered by date (newest first)
    @GetMapping("/ordered")
    public ResponseEntity<List<QuestionDTO>> getAllQuestionsOrderedByDate() {
        List<QuestionDTO> questions = questionService.getAllQuestionsOrderedByDate();
        return ResponseEntity.ok(questions);
    }    // Create new question (admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDTO> createQuestion(@RequestBody QuestionDTO questionDTO) {
        try {
            QuestionDTO createdQuestion = questionService.createQuestion(questionDTO);
            return ResponseEntity.ok(createdQuestion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update question (admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDTO> updateQuestion(@PathVariable Long id, @RequestBody QuestionDTO questionDTO) {
        try {
            QuestionDTO updatedQuestion = questionService.updateQuestion(id, questionDTO);
            return ResponseEntity.ok(updatedQuestion);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete question (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteQuestion(@PathVariable Long id) {
        try {
            questionService.deleteQuestion(id);
            return ResponseEntity.ok("Question successfully deleted! ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Check answer for a question
    @PostMapping("/{id}/check")
    public ResponseEntity<Map<String, Object>> checkAnswer(@PathVariable Long id, @RequestBody Map<String, String> answerRequest) {
        String userAnswer = answerRequest.get("answer");
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Answer is required"));
        }

        boolean isCorrect = questionService.checkAnswer(id, userAnswer);
        return ResponseEntity.ok(Map.of(
            "correct", isCorrect,
            "questionId", id
        ));
    }

    // Get total question count
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTotalQuestionCount() {
        long count = questionService.getTotalQuestionCount();
        return ResponseEntity.ok(Map.of("totalQuestions", count));
    }
}
