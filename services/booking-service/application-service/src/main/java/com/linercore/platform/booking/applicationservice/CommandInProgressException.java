package com.linercore.platform.booking.applicationservice;

public class CommandInProgressException extends IllegalStateException {
    public CommandInProgressException() {
        super("an equivalent booking command is still in progress");
    }
}
