package com.skygrid.flight.controller;

import com.skygrid.common.dto.FlightDto;
import com.skygrid.flight.service.FlightService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
public class FlightController {

    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @GetMapping("/available")
    public ResponseEntity<List<FlightDto>> getAvailableFlights(
            @RequestParam(required = false) String flightNumber,
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination) {
        return ResponseEntity.ok(
            flightService.getAvailableFlights(flightNumber, origin, destination)
        );
    }
}
