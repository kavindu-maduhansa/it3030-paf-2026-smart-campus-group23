package com.smartcampus;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.IOException;
import java.net.ServerSocket;

@SpringBootApplication
@EnableMethodSecurity
@EnableScheduling
public class SmartCampusBackendApplication {

	public static void main(String[] args) {
		loadDotEnvAsSystemProperties();
		maybeUseAlternatePortIfDefaultBusy();
		SpringApplication.run(SmartCampusBackendApplication.class, args);
	}

	/**
	 * If the active profile contains {@code dev} and the configured default port is 8080 but
	 * something else is already listening there, switch to the first free port in a local
	 * fallback range so {@code mvnw spring-boot:run} does not fail when previous JVMs are still
	 * running.
	 */
	private static void maybeUseAlternatePortIfDefaultBusy() {
		String profiles = System.getProperty("spring.profiles.active", "");
		if (profiles == null || !profiles.contains("dev")) {
			return;
		}
		String envPort = System.getenv("PORT");
		String propPort = System.getProperty("PORT");
		String effective = firstNonBlank(envPort, propPort, "8080");
		if (!"8080".equals(effective)) {
			return;
		}
		try (ServerSocket ignored = new ServerSocket(8080)) {
			// port free
		} catch (IOException e) {
			int fallbackPort = findAvailablePort(8081, 20);
			if (fallbackPort == -1) {
				System.err.println("[smart-campus] Port 8080 is busy and no free fallback port was found in 8081-8100.");
				return;
			}
			System.setProperty("PORT", Integer.toString(fallbackPort));
			System.err.println("[smart-campus] Port 8080 is in use; using PORT=" + fallbackPort + " (dev). "
					+ "Point Vite VITE_BACKEND_ORIGIN at the selected port or use backend/run-backend.ps1.");
		}
	}

	private static int findAvailablePort(int startPort, int attempts) {
		for (int i = 0; i < attempts; i++) {
			int candidate = startPort + i;
			try (ServerSocket ignored = new ServerSocket(candidate)) {
				return candidate;
			} catch (IOException ignored) {
				// continue scanning
			}
		}
		return -1;
	}

	private static String firstNonBlank(String a, String b, String fallback) {
		if (a != null && !a.isBlank()) {
			return a.trim();
		}
		if (b != null && !b.isBlank()) {
			return b.trim();
		}
		return fallback;
	}

	/**
	 * Spring Boot does not read {@code .env} files. Copy {@code .env.example} to {@code .env}
	 * in the backend directory so local runs pick up {@code DB_*}, {@code PORT}, etc.
	 * Existing OS env vars or {@code -D} system properties take precedence.
	 */
	private static void loadDotEnvAsSystemProperties() {
		Dotenv dotenv = Dotenv.configure()
				.directory("./")
				.ignoreIfMissing()
				.ignoreIfMalformed()
				.load();
		dotenv.entries().forEach(entry -> {
			String key = entry.getKey();
			if (System.getProperty(key) != null || System.getenv(key) != null) {
				return;
			}
			String value = entry.getValue();
			if ("SPRING_PROFILES_ACTIVE".equals(key)) {
				System.setProperty("spring.profiles.active", value);
			} else {
				System.setProperty(key, value);
			}
		});
	}

}
