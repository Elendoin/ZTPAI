package DTOs;

import Models.Role;

public class AuthResponseDTO {
    private String message;
    private boolean success;
    private Long userId;
    private Role role;
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
