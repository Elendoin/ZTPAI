package Controllers;

import DTOs.QuestionDTO;
import Services.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/questions")
@Tag(name = "Questions", description = "Daily quiz question management endpoints")
public class QuestionController {@Autowired
    private QuestionService questionService;    @GetMapping
    @Operation(summary = "Get all questions", description = "Retrieve all questions without answers (for general browsing)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Questions retrieved successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = QuestionDTO.class)))
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        List<QuestionDTO> questions = questionService.getAllQuestionsWithoutAnswers();
        return ResponseEntity.ok(questions);    }    @GetMapping("/{id}")
    @Operation(summary = "Get question by ID", description = "Retrieve a specific question by its ID (without answer)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Question found",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = QuestionDTO.class))),
        @ApiResponse(responseCode = "404", description = "Question not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<QuestionDTO> getQuestionById(
            @Parameter(description = "Question ID", required = true) @PathVariable Long id) {
        Optional<QuestionDTO> question = questionService.getQuestionByIdWithoutAnswer(id);
        return question.map(ResponseEntity::ok)                      .orElse(ResponseEntity.notFound().build());
    }    @GetMapping("/today")
    @Operation(summary = "Get today's question", description = "Retrieve today's daily quiz question (without answer)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Today's question retrieved successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = QuestionDTO.class))),
        @ApiResponse(responseCode = "404", description = "No question available for today")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<QuestionDTO> getTodaysQuestion() {
        Optional<QuestionDTO> question = questionService.getTodaysQuestion();
        return question.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());}    @GetMapping("/today/with-answer")
    @Operation(summary = "Get today's question with answer", description = "Retrieve today's daily quiz question including the correct answer (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Today's question with answer retrieved successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = QuestionDTO.class))),
        @ApiResponse(responseCode = "404", description = "No question available for today"),
        @ApiResponse(responseCode = "403", description = "Access denied - admin role required")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDTO> getTodaysQuestionWithAnswer() {
        Optional<QuestionDTO> question = questionService.getTodaysQuestionWithAnswer();
        return question.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());}    @GetMapping("/date/{date}")
    @Operation(summary = "Get question by date", description = "Retrieve a question for a specific date")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Question for the specified date retrieved successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = QuestionDTO.class))),
        @ApiResponse(responseCode = "404", description = "No question found for the specified date"),
        @ApiResponse(responseCode = "400", description = "Invalid date format")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<QuestionDTO> getQuestionByDate(
            @Parameter(description = "Date in ISO format (YYYY-MM-DD)", required = true, example = "2024-01-15")
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Optional<QuestionDTO> question = questionService.getQuestionByDate(date);
        return question.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());}    @PostMapping
    @Operation(summary = "Create a new question", description = "Create a new daily quiz question (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Question created successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = QuestionDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid question data provided"),
        @ApiResponse(responseCode = "403", description = "Access denied - admin role required")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDTO> createQuestion(
            @Parameter(description = "Question data to create", required = true)
            @RequestBody QuestionDTO questionDTO) {
        try {
            QuestionDTO createdQuestion = questionService.createQuestion(questionDTO);
            return ResponseEntity.ok(createdQuestion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }}    @PutMapping("/{id}")
    @Operation(summary = "Update a question", description = "Update an existing question by ID (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Question updated successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = QuestionDTO.class))),
        @ApiResponse(responseCode = "404", description = "Question not found"),
        @ApiResponse(responseCode = "400", description = "Invalid question data provided"),
        @ApiResponse(responseCode = "403", description = "Access denied - admin role required")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDTO> updateQuestion(
            @Parameter(description = "Question ID", required = true) @PathVariable Long id, 
            @Parameter(description = "Updated question data", required = true) @RequestBody QuestionDTO questionDTO) {
        try {
            QuestionDTO updatedQuestion = questionService.updateQuestion(id, questionDTO);
            return ResponseEntity.ok(updatedQuestion);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }}    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a question", description = "Delete a question by ID (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Question deleted successfully",
                    content = @Content(mediaType = "text/plain", 
                                     schema = @Schema(type = "string", example = "Question successfully deleted! ID: 1"))),
        @ApiResponse(responseCode = "404", description = "Question not found"),
        @ApiResponse(responseCode = "403", description = "Access denied - admin role required")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteQuestion(
            @Parameter(description = "Question ID", required = true) @PathVariable Long id) {
        try {
            questionService.deleteQuestion(id);
            return ResponseEntity.ok("Question successfully deleted! ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }}    @PostMapping("/{id}/check")
    @Operation(summary = "Check answer for a question", description = "Submit an answer for a specific question and get result")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Answer checked successfully",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(type = "object", 
                                                    example = "{\"correct\": true, \"questionId\": 1}"))),
        @ApiResponse(responseCode = "400", description = "Answer is required or invalid format"),
        @ApiResponse(responseCode = "404", description = "Question not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<Map<String, Object>> checkAnswer(
            @Parameter(description = "Question ID", required = true) @PathVariable Long id, 
            @Parameter(description = "Answer submission", required = true, 
                      schema = @Schema(type = "object", example = "{\"answer\": \"Paris\"}"))
            @RequestBody Map<String, String> answerRequest) {
        String userAnswer = answerRequest.get("answer");
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Answer is required"));
        }

        boolean isCorrect = questionService.checkAnswer(id, userAnswer);        return ResponseEntity.ok(Map.of(
            "correct", isCorrect,
            "questionId", id
        ));    }
}
