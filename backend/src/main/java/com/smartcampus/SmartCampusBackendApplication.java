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
	 * In dev mode, if the effective local port is already in use, switch to the first free
	 * fallback port so {@code mvnw spring-boot:run} does not fail when previous JVMs are still
	 * running.
	 */
	private static void maybeUseAlternatePortIfDefaultBusy() {
		String profiles = System.getProperty("spring.profiles.active", "");
		if (profiles == null || !profiles.contains("dev")) {
			return;
		}
		String envPort = System.getenv("PORT");
		String propPort = System.getProperty("PORT");
		String effective = firstNonBlank(envPort, propPort, "8081");
		int effectivePort;
		try {
			effectivePort = Integer.parseInt(effective);
		} catch (NumberFormatException ignored) {
			return;
		}
		if (isPortAvailable(effectivePort)) {
			return;
		}
		int fallbackPort = findAvailablePort(effectivePort + 1, 20);
		if (fallbackPort == -1) {
			System.err.println("[smart-campus] Port " + effectivePort
					+ " is busy and no free fallback port was found in the next 20 ports.");
			return;
		}
		System.setProperty("PORT", Integer.toString(fallbackPort));
		System.err.println("[smart-campus] Port " + effectivePort + " is in use; using PORT=" + fallbackPort + " (dev). "
				+ "Point Vite VITE_BACKEND_ORIGIN at the selected port or use backend/run-backend.ps1.");
	}

	private static int findAvailablePort(int startPort, int attempts) {
		for (int i = 0; i < attempts; i++) {
			int candidate = startPort + i;
			if (isPortAvailable(candidate)) {
				return candidate;
			}
		}
		return -1;
	}

	private static boolean isPortAvailable(int port) {
		try (ServerSocket ignored = new ServerSocket(port)) {
			return true;
		} catch (IOException ignored) {
			return false;
		}
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
