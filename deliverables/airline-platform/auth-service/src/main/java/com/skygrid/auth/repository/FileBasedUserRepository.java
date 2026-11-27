package com.skygrid.auth.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skygrid.auth.model.UserAccount;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@Repository
public class FileBasedUserRepository implements UserRepository {

    private final ObjectMapper objectMapper;
    private final Path usersFilePath;

    public FileBasedUserRepository(
            ObjectMapper objectMapper,
            @Value("${users.data.path:/app/data/users.json}") String usersFilePath) {
        this.objectMapper = objectMapper;
        this.usersFilePath = Path.of(usersFilePath);
    }

    @Override
    public Optional<UserAccount> findByUsername(String username) {
        try {
            List<UserAccount> users = objectMapper.readValue(
                usersFilePath.toFile(),
                new TypeReference<>() {}
            );
            return users.stream()
                .filter(u -> u.username().equalsIgnoreCase(username.trim()))
                .findFirst();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read users.json", e);
        }
    }
}
