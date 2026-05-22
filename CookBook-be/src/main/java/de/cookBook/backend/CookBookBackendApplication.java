package de.cookBook.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CookBookBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CookBookBackendApplication.class, args);
	}

}
