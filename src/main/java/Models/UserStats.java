package Models;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_stats")
public class UserStats{
    @Id
    private long id;

    private int wins;
    private int losses;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate last_answered;
}
