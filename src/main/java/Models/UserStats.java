package Models;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_stats")
public class UserStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int wins = 0;
      @Column(nullable = false)
    private int losses = 0;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate lastAnswered;

    @Column(length = 1)
    private String latestAnswer;

    public UserStats() {}

    public UserStats(int wins, int losses) {
        this.wins = wins;
        this.losses = losses;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        this.wins = wins;
    }

    public int getLosses() {
        return losses;
    }

    public void setLosses(int losses) {
        this.losses = losses;
    }    public LocalDate getLastAnswered() {
        return lastAnswered;
    }

    public void setLastAnswered(LocalDate lastAnswered) {
        this.lastAnswered = lastAnswered;
    }

    public String getLatestAnswer() {
        return latestAnswer;
    }

    public void setLatestAnswer(String latestAnswer) {
        this.latestAnswer = latestAnswer;
    }
}
