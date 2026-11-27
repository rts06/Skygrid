package com.skygrid.common.dto;

public record FlightDto(
    String flightNumber,
    String origin,
    String destination,
    String departureTime,
    String arrivalTime,
    int availableSeats,
    String status
) {}
