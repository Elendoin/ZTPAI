package Repositories;

import Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository  extends JpaRepository<User, Long> {
    List<User> findAll();
    User findByEmail(String email);
    User findById(long id);
}