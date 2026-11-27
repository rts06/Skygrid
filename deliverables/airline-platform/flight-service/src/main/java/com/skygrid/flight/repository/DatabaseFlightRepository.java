package com.skygrid.flight.repository;

import com.skygrid.common.dto.FlightDto;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Future database implementation stub.
 * Activate via `flight.storage.mode=database` once Spring Data JPA is configured.
 * Zero changes required in FlightService, FlightController, or Angular UI.
 */
@Repository
@ConditionalOnProperty(name = "flight.storage.mode", havingValue = "database")
public class DatabaseFlightRepository implements FlightRepository {

    @Override
    public List<FlightDto> findAllAvailable() {
        throw new UnsupportedOperationException(
            "DatabaseFlightRepository is reserved for future JPA/SQL integration."
        );
    }
}
