package com.skygrid.common.dto;

public record AuthResponse(
    String token,
    String tokenType,
    long expiresIn,
    UserProfileDto user
) {
    public record UserProfileDto(String username, String fullName, String role) {}
}
