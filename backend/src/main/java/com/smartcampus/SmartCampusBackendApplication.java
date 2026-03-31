package com.smartcampus;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {
		org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
		org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class,
		org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration.class
})
public class SmartCampusBackendApplication {

	public static void main(String[] args) {
		loadDotEnvAsSystemProperties();
		SpringApplication.run(SmartCampusBackendApplication.class, args);
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
