package DTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Registration request containing user details")
public class RegisterRequestDTO {
    @NotBlank(message = "Name is required")
    @Schema(description = "User's first name", example = "John", required = true)
    private String name;
    
    @NotBlank(message = "Surname is required")
    @Schema(description = "User's last name", example = "Doe", required = true)
    private String surname;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Schema(description = "User email address", example = "john.doe@example.com", required = true)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    @Schema(description = "User password (minimum 6 characters)", example = "password123", required = true)
    private String password;

    public RegisterRequestDTO() {}

    public RegisterRequestDTO(String name, String surname, String email, String password) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
