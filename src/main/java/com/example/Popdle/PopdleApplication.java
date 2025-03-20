package com.example.Popdle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "Controllers")
public class PopdleApplication {

	public static void main(String[] args) {
		SpringApplication.run(PopdleApplication.class, args);
	}

}
