package Services;

import DTOs.LoginRequestDTO;
import DTOs.RegisterRequestDTO;
import DTOs.UserDTO;
import Models.Role;
import Models.User;
import Models.UserDetailsEntity;
import Models.UserStats;
import Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public User register(RegisterRequestDTO registerRequest) throws Exception {
        if (userRepository.findByEmail(registerRequest.getEmail()) != null) {
            throw new Exception("Email already exists");
        }        User user = new User();
        user.setEmail(registerRequest.getEmail());        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(Role.USER);

        UserDetailsEntity userDetails = new UserDetailsEntity();
        userDetails.setName(registerRequest.getName());
        userDetails.setSurname(registerRequest.getSurname());        user.setUserDetailsEntity(userDetails);

        UserStats userStats = new UserStats();
        user.setUserStats(userStats);

        return userRepository.save(user);
    }

    public String login(LoginRequestDTO loginRequest) throws Exception {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            User user = (User) authentication.getPrincipal();
            return jwtService.generateToken(user);
        } catch (AuthenticationException e) {
            throw new Exception("Invalid credentials");
        }
    }    public UserDTO getUserInfo(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null && user.getUserDetailsEntity() != null) {
            return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getUserDetailsEntity().getName(),
                user.getUserDetailsEntity().getSurname(),
                user.getRole()
            );
        }
        return null;
    }
}
