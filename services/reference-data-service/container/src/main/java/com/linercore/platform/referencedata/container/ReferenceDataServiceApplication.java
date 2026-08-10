package com.linercore.platform.referencedata.container;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ReferenceDataServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReferenceDataServiceApplication.class, args);
    }
}
