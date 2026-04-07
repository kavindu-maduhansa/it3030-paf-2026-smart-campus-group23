package com.smartcampus;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.net.ServerSocket;

@SpringBootApplication
public class SmartCampusBackendApplication {

	public static void main(String[] args) {
		loadDotEnvAsSystemProperties();
		maybeUseAlternatePortIfDefaultBusy();
		SpringApplication.run(SmartCampusBackendApplication.class, args);
	}

	/**
	 * If the active profile contains {@code dev} and the configured default port is 8080 but
	 * something else is already listening there, switch to 8081 so {@code mvnw spring-boot:run}
	 * does not fail when a previous JVM is still running.
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
			System.setProperty("PORT", "8081");
			System.err.println("[smart-campus] Port 8080 is in use; using PORT=8081 (dev). "
					+ "Point Vite VITE_BACKEND_ORIGIN at 8081 or use backend/run-backend.ps1.");
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
