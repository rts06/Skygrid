package com.skygrid.auth.service;

import com.skygrid.auth.model.UserAccount;
import com.skygrid.auth.repository.UserRepository;
import com.skygrid.common.dto.AuthRequest;
import com.skygrid.common.dto.AuthResponse;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SecretKey signingKey;
    private final PasswordEncoder passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
    private static final long EXPIRATION_SECONDS = 3600L;

    public AuthService(
            UserRepository userRepository,
            @Value("${jwt.secret}") String jwtSecret) {
        this.userRepository = userRepository;
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public Optional<AuthResponse> authenticate(AuthRequest request) {
        return userRepository.findByUsername(request.username())
            .filter(user -> passwordEncoder.matches(request.password(), user.password()))
            .map(this::issueToken);
    }

    private AuthResponse issueToken(UserAccount user) {
        Instant now = Instant.now();
        String token = Jwts.builder()
            .subject(user.username())
            .claim("fullName", user.fullName())
            .claim("role", user.role())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(EXPIRATION_SECONDS)))
            .signWith(signingKey)
            .compact();

        return new AuthResponse(
            token,
            "Bearer",
            EXPIRATION_SECONDS,
            new AuthResponse.UserProfileDto(user.username(), user.fullName(), user.role())
        );
    }
}
