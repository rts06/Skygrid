package com.skygrid.auth.model;

public record UserAccount(
    String username,
    String password,
    String fullName,
    String role
) {}
