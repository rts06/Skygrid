package com.skygrid.flight.repository;

import com.skygrid.common.dto.FlightDto;
import java.util.List;

/**
 * Persistence abstraction for flight availability.
 * Business logic depends solely on this interface so DatabaseFlightRepository
 * can replace FileBasedFlightRepository without modifying services or frontend code.
 */
public interface FlightRepository {
    List<FlightDto> findAllAvailable();
}
