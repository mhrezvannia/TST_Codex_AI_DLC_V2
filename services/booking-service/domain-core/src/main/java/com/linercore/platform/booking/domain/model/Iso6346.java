package com.linercore.platform.booking.domain.model;

final class Iso6346 {
    private Iso6346() {
    }

    static boolean isValid(String value) {
        if (value == null || !value.matches("[A-Z]{3}[UJZ][0-9]{7}")) {
            return false;
        }
        long sum = 0;
        for (int index = 0; index < 10; index++) {
            char character = value.charAt(index);
            int numeric = Character.isDigit(character) ? character - '0' : letterValue(character);
            sum += numeric * (1L << index);
        }
        int checkDigit = (int) ((sum % 11) % 10);
        return checkDigit == value.charAt(10) - '0';
    }

    private static int letterValue(char character) {
        int value = character - 'A' + 10;
        return value + (value - 1) / 10;
    }
}
