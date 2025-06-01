package com.example.Popdle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"com.example.Popdle", "Controllers", "Services", "Config", "DTOs"})
@EntityScan(basePackages = {"Models"})
@EnableJpaRepositories(basePackages = {"Repositories"})
public class PopdleApplication {

	public static void main(String[] args) {
		SpringApplication.run(PopdleApplication.class, args);
	}

}
