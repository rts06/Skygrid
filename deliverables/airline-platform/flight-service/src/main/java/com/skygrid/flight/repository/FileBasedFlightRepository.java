package com.skygrid.flight.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skygrid.common.dto.FlightDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@Repository
@ConditionalOnProperty(name = "flight.storage.mode", havingValue = "file", matchIfMissing = true)
public class FileBasedFlightRepository implements FlightRepository {

    private final ObjectMapper objectMapper;
    private final Path flightsFilePath;

    public FileBasedFlightRepository(
            ObjectMapper objectMapper,
            @Value("${flights.data.path:/app/data/flights.json}") String flightsFilePath) {
        this.objectMapper = objectMapper;
        this.flightsFilePath = Path.of(flightsFilePath);
    }

    @Override
    public List<FlightDto> findAllAvailable() {
        try {
            List<FlightDto> allFlights = objectMapper.readValue(
                flightsFilePath.toFile(),
                new TypeReference<>() {}
            );
            return allFlights.stream()
                .filter(f -> "Available".equalsIgnoreCase(f.status()))
                .toList();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read flights.json", e);
        }
    }
}
