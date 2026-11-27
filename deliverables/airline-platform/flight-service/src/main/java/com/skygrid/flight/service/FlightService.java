package com.skygrid.flight.service;

import com.skygrid.common.dto.FlightDto;
import com.skygrid.flight.repository.FlightRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FlightService {

    private final FlightRepository flightRepository;

    public FlightService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public List<FlightDto> getAvailableFlights(String flightNumber, String origin, String destination) {
        return flightRepository.findAllAvailable().stream()
            .filter(f -> flightNumber == null || flightNumber.isBlank()
                || f.flightNumber().toLowerCase().contains(flightNumber.trim().toLowerCase()))
            .filter(f -> origin == null || origin.isBlank()
                || f.origin().equalsIgnoreCase(origin.trim()))
            .filter(f -> destination == null || destination.isBlank()
                || f.destination().equalsIgnoreCase(destination.trim()))
            .toList();
    }
}
