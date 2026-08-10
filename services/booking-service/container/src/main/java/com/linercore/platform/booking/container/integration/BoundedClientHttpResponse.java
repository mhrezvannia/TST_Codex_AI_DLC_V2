package com.linercore.platform.booking.container.integration;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.ClientHttpResponse;

public final class BoundedClientHttpResponse implements ClientHttpResponse {
    public static final int MAX_BODY_BYTES = 64 * 1024;

    private final ClientHttpResponse delegate;

    public BoundedClientHttpResponse(ClientHttpResponse delegate) {
        this.delegate = delegate;
    }

    @Override
    public HttpStatusCode getStatusCode() throws IOException {
        return delegate.getStatusCode();
    }

    @Override
    public String getStatusText() throws IOException {
        return delegate.getStatusText();
    }

    @Override
    public void close() {
        delegate.close();
    }

    @Override
    public InputStream getBody() throws IOException {
        return new FilterInputStream(delegate.getBody()) {
            private int consumed;

            @Override
            public int read() throws IOException {
                int value = super.read();
                if (value >= 0) {
                    check(++consumed);
                }
                return value;
            }

            @Override
            public int read(byte[] buffer, int offset, int length) throws IOException {
                int count = super.read(buffer, offset, length);
                if (count > 0) {
                    consumed += count;
                    check(consumed);
                }
                return count;
            }
        };
    }

    @Override
    public HttpHeaders getHeaders() {
        return delegate.getHeaders();
    }

    private static void check(int consumed) throws IOException {
        if (consumed > MAX_BODY_BYTES) {
            throw new IOException("Charge pricing response exceeded 65536 bytes");
        }
    }
}
