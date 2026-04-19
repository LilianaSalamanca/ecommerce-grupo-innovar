package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.dto.DashboardMetricsResponse;
import com.grupo_innovar.backend.service.AdminDashboardService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardMetricsResponse getMetrics() {
        return dashboardService.obtenerMetricas();
    }
}