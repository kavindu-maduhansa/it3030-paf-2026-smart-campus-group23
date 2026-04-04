package com.smartcampus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import com.smartcampus.websocket.ResourceWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * WebSocket Configuration
 * Enables real-time updates for multiple users
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private ResourceWebSocketHandler resourceWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(resourceWebSocketHandler, "/ws/resources")
                .setAllowedOrigins("*");
    }
}
