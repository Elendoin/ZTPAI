package Services;

import DTOs.QuestionDTO;
import Models.Question;
import Repositories.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    
    @Autowired
    private QuestionRepository questionRepository;

    public List<QuestionDTO> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<QuestionDTO> getAllQuestionsWithoutAnswers() {
        return questionRepository.findAll().stream()
                .map(this::convertToDTOWithoutAnswer)
                .collect(Collectors.toList());
    }

    public Optional<QuestionDTO> getQuestionById(Long id) {
        return questionRepository.findById(id)
                .map(this::convertToDTO);
    }

    public Optional<QuestionDTO> getQuestionByIdWithoutAnswer(Long id) {
        return questionRepository.findById(id)
                .map(this::convertToDTOWithoutAnswer);
    }    public Optional<QuestionDTO> getTodaysQuestion() {
        return questionRepository.findByDateExact(LocalDate.now())
                .map(this::convertToDTOWithoutAnswer);
    }

    public Optional<QuestionDTO> getTodaysQuestionWithAnswer() {
        return questionRepository.findByDateExact(LocalDate.now())
                .map(this::convertToDTO);
    }

    public Optional<QuestionDTO> getQuestionByDate(LocalDate date) {
        return questionRepository.findByDateExact(date)
                .map(this::convertToDTOWithoutAnswer);
    }

    public List<QuestionDTO> getQuestionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return questionRepository.findByDateBetween(startDate, endDate).stream()
                .map(this::convertToDTOWithoutAnswer)
                .collect(Collectors.toList());
    }

    public List<QuestionDTO> getAllQuestionsOrderedByDate() {
        return questionRepository.findAllByOrderByDateDesc().stream()
                .map(this::convertToDTOWithoutAnswer)
                .collect(Collectors.toList());
    }

    public QuestionDTO createQuestion(QuestionDTO questionDTO) {
        Question question = convertToEntity(questionDTO);
        Question savedQuestion = questionRepository.save(question);
        return convertToDTO(savedQuestion);
    }

    public QuestionDTO updateQuestion(Long id, QuestionDTO questionDTO) throws Exception {
        Optional<Question> existingQuestion = questionRepository.findById(id);
        if (existingQuestion.isEmpty()) {
            throw new Exception("Question not found");
        }

        Question question = existingQuestion.get();
        updateQuestionFromDTO(question, questionDTO);
        Question updatedQuestion = questionRepository.save(question);
        return convertToDTO(updatedQuestion);
    }

    public void deleteQuestion(Long id) throws Exception {
        Optional<Question> question = questionRepository.findById(id);
        if (question.isEmpty()) {
            throw new Exception("Question not found");
        }
        questionRepository.delete(question.get());
    }

    public long getTotalQuestionCount() {
        return questionRepository.count();
    }

    public boolean checkAnswer(Long questionId, String userAnswer) {
        Optional<Question> question = questionRepository.findById(questionId);
        if (question.isEmpty()) {
            return false;
        }
        return question.get().getCorrectAnswer().equalsIgnoreCase(userAnswer.trim());    }

    private QuestionDTO convertToDTO(Question question) {
        return new QuestionDTO(
                question.getId(),
                question.getContents(),
                question.getCorrectAnswer(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                question.getDate(),
                question.getImage()
        );
    }

    private QuestionDTO convertToDTOWithoutAnswer(Question question) {
        return new QuestionDTO(
                question.getId(),
                question.getContents(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                question.getDate(),
                question.getImage()
        );
    }

    private Question convertToEntity(QuestionDTO questionDTO) {
        Question question = new Question();
        updateQuestionFromDTO(question, questionDTO);
        return question;
    }

    private void updateQuestionFromDTO(Question question, QuestionDTO questionDTO) {
        question.setContents(questionDTO.getContents());
        question.setCorrectAnswer(questionDTO.getCorrectAnswer());
        question.setOptionA(questionDTO.getOptionA());
        question.setOptionB(questionDTO.getOptionB());
        question.setOptionC(questionDTO.getOptionC());
        question.setOptionD(questionDTO.getOptionD());
        question.setDate(questionDTO.getDate());
        question.setImage(questionDTO.getImage());
    }
}
