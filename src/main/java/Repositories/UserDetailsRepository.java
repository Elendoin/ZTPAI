package Repositories;

import Models.UserDetails;
import Models.UserDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDetailsRepository  extends JpaRepository<UserDetails, Long> {
    UserDetails findById(long id);
}