package DTOs;

public class AuthResponseDTO {
    private String message;
    private boolean success;
    private Long userId;

    public AuthResponseDTO() {}

    public AuthResponseDTO(String message, boolean success) {
        this.message = message;
        this.success = success;
    }

    public AuthResponseDTO(String message, boolean success, Long userId) {
        this.message = message;
        this.success = success;
        this.userId = userId;
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
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
