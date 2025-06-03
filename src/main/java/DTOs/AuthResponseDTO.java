package DTOs;

import Models.Role;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication response containing user details and operation status")
public class AuthResponseDTO {
    @Schema(description = "Response message", example = "Login successful")
    private String message;
    
    @Schema(description = "Operation success status", example = "true")
    private boolean success;
    
    @Schema(description = "User ID", example = "1")
    private Long userId;
    
    @Schema(description = "User role")
    private Role role;
    
    @Schema(description = "User email", example = "user@example.com")
    private String email;

    public AuthResponseDTO() {}

    public AuthResponseDTO(String message, boolean success) {
        this.message = message;
        this.success = success;
    }    public AuthResponseDTO(String message, boolean success, Long userId) {
        this.message = message;
        this.success = success;
        this.userId = userId;
    }    public AuthResponseDTO(String message, boolean success, Long userId, Role role) {
        this.message = message;
        this.success = success;
        this.userId = userId;
        this.role = role;
    }

    public AuthResponseDTO(String message, boolean success, Long userId, Role role, String email) {
        this.message = message;
        this.success = success;
        this.userId = userId;
        this.role = role;
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
