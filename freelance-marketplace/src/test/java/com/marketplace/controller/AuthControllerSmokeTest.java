package com.marketplace.controller;

import com.marketplace.dto.auth.AuthResponse;
import com.marketplace.dto.auth.LoginRequest;
import com.marketplace.entity.enums.Role;
import com.marketplace.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuthControllerSmokeTest {

    private AuthService authService;
    private AuthController authController;

    @BeforeEach
    void setup() {
        authService = Mockito.mock(AuthService.class);
        authController = new AuthController(authService);
    }

    @Test
    void loginReturnsTokenPayload() throws Exception {
        AuthResponse response = AuthResponse.builder()
                .token("fake-token")
                .userId(1L)
                .name("Client One")
                .email("client@example.com")
                .role(Role.CLIENT)
                .build();
        when(authService.login(any())).thenReturn(response);

        LoginRequest request = new LoginRequest();
        request.setEmail("client@example.com");
        request.setPassword("secret");

        AuthResponse body = authController.login(request).getBody();
        assertEquals("fake-token", body.getToken());
        assertEquals("client@example.com", body.getEmail());
    }
}
