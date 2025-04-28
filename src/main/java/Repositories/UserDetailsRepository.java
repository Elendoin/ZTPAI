package Repositories;

import Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDetailsRepository  extends JpaRepository<User, Long> {
    List<User> findAll();
}