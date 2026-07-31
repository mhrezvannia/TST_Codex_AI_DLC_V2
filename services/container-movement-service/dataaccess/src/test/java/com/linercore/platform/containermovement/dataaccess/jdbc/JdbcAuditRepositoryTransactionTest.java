package com.linercore.platform.containermovement.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.containermovement.applicationservice.port.AuditRepository;
import java.io.PrintWriter;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.SQLFeatureNotSupportedException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;

class JdbcAuditRepositoryTransactionTest {
    @Test
    void durableRejectionCommitsBeforeOuterBusinessTransactionRollsBack() {
        try (AnnotationConfigApplicationContext context =
                     new AnnotationConfigApplicationContext(TransactionTestConfiguration.class)) {
            AuditRepository audit = context.getBean(AuditRepository.class);
            RecordingDataSource dataSource = context.getBean(RecordingDataSource.class);
            TransactionTemplate outer = new TransactionTemplate(
                    context.getBean(PlatformTransactionManager.class));

            assertThrows(OuterBusinessFailure.class, () -> outer.executeWithoutResult(ignored -> {
                audit.appendDurableRejection(
                        "CMM_OUT_OF_SEQUENCE_MOVEMENT",
                        "journey-1",
                        "operator-1",
                        "current=GATED_OUT;requiredNext=LOAD",
                        "corr-rollback");
                throw new OuterBusinessFailure();
            }));

            assertEquals(2, dataSource.connections.size());
            assertTrue(dataSource.connections.stream().anyMatch(
                    state -> state.updates == 1 && state.commits == 1 && state.rollbacks == 0));
            assertTrue(dataSource.connections.stream().anyMatch(
                    state -> state.updates == 0 && state.commits == 0 && state.rollbacks == 1));
        }
    }

    @Configuration
    @EnableTransactionManagement
    static class TransactionTestConfiguration {
        @Bean
        RecordingDataSource dataSource() {
            return new RecordingDataSource();
        }

        @Bean
        JdbcTemplate jdbcTemplate(DataSource dataSource) {
            return new JdbcTemplate(dataSource);
        }

        @Bean
        PlatformTransactionManager transactionManager(DataSource dataSource) {
            return new DataSourceTransactionManager(dataSource);
        }

        @Bean
        AuditRepository auditRepository(JdbcTemplate jdbc) {
            return new JdbcAuditRepository(jdbc);
        }
    }

    static final class RecordingDataSource implements DataSource {
        private final List<ConnectionState> connections = new ArrayList<>();

        @Override
        public Connection getConnection() {
            ConnectionState state = new ConnectionState();
            connections.add(state);
            return state.connection();
        }

        @Override
        public Connection getConnection(String username, String password) {
            return getConnection();
        }

        @Override
        public PrintWriter getLogWriter() {
            return null;
        }

        @Override
        public void setLogWriter(PrintWriter out) {
        }

        @Override
        public void setLoginTimeout(int seconds) {
        }

        @Override
        public int getLoginTimeout() {
            return 0;
        }

        @Override
        public Logger getParentLogger() throws SQLFeatureNotSupportedException {
            throw new SQLFeatureNotSupportedException();
        }

        @Override
        public <T> T unwrap(Class<T> iface) throws SQLException {
            throw new SQLException("not a wrapper");
        }

        @Override
        public boolean isWrapperFor(Class<?> iface) {
            return false;
        }
    }

    static final class ConnectionState {
        private int commits;
        private int rollbacks;
        private int updates;
        private boolean autoCommit = true;
        private boolean closed;

        Connection connection() {
            Connection[] holder = new Connection[1];
            holder[0] = (Connection) Proxy.newProxyInstance(
                    Connection.class.getClassLoader(),
                    new Class<?>[]{Connection.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "setAutoCommit" -> {
                            autoCommit = (boolean) args[0];
                            yield null;
                        }
                        case "getAutoCommit" -> autoCommit;
                        case "commit" -> {
                            commits++;
                            yield null;
                        }
                        case "rollback" -> {
                            rollbacks++;
                            yield null;
                        }
                        case "close" -> {
                            closed = true;
                            yield null;
                        }
                        case "isClosed" -> closed;
                        case "prepareStatement" -> preparedStatement(holder[0]);
                        case "isReadOnly" -> false;
                        case "getTransactionIsolation" -> Connection.TRANSACTION_READ_COMMITTED;
                        case "getWarnings" -> null;
                        case "isWrapperFor" -> false;
                        case "unwrap" -> throw new SQLException("not a wrapper");
                        case "toString" -> "RecordingConnection";
                        default -> defaultValue(method.getReturnType());
                    });
            return holder[0];
        }

        private PreparedStatement preparedStatement(Connection connection) {
            return (PreparedStatement) Proxy.newProxyInstance(
                    PreparedStatement.class.getClassLoader(),
                    new Class<?>[]{PreparedStatement.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "executeUpdate" -> {
                            updates++;
                            yield 1;
                        }
                        case "getConnection" -> connection;
                        case "isClosed", "isWrapperFor" -> false;
                        case "unwrap" -> throw new SQLException("not a wrapper");
                        case "toString" -> "RecordingPreparedStatement";
                        default -> defaultValue(method.getReturnType());
                    });
        }

        private static Object defaultValue(Class<?> type) {
            if (!type.isPrimitive()) {
                return null;
            }
            if (type == boolean.class) {
                return false;
            }
            if (type == char.class) {
                return '\0';
            }
            if (type == byte.class) {
                return (byte) 0;
            }
            if (type == short.class) {
                return (short) 0;
            }
            if (type == int.class) {
                return 0;
            }
            if (type == long.class) {
                return 0L;
            }
            if (type == float.class) {
                return 0F;
            }
            return 0D;
        }
    }

    private static final class OuterBusinessFailure extends RuntimeException {
    }
}
