package com.grupo_innovar.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@ConfigurationPropertiesScan("com.grupo_innovar.config")
public class BackendEcommerceGrupoInnovarApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendEcommerceGrupoInnovarApplication.class, args);
	}

}
