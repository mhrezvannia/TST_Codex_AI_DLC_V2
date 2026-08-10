package com.linercore.platform.containermovement.container;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ContainerMovementServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ContainerMovementServiceApplication.class, args);
    }
}
