package com.skygrid.auth.repository;

import com.skygrid.auth.model.UserAccount;
import java.util.Optional;

public interface UserRepository {
    Optional<UserAccount> findByUsername(String username);
}
