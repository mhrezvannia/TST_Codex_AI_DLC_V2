package com.linercore.platform.chargeagreement.container;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ChargeAgreementServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChargeAgreementServiceApplication.class, args);
    }
}
