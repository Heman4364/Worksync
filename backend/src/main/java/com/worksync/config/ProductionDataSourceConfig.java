package com.worksync.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Profile("prod")
public class ProductionDataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(ProductionDataSourceConfig.class);

    @Value("${SPRING_DATASOURCE_URL:${DATABASE_URL:}}")
    private String rawUrl;

    @Value("${DB_HOST:}")
    private String dbHost;

    @Value("${DB_PORT:5432}")
    private String dbPort;

    @Value("${DB_NAME:worksync}")
    private String dbName;

    @Value("${DB_USER:${SPRING_DATASOURCE_USERNAME:worksync}}")
    private String dbUser;

    @Value("${DB_PASSWORD:${SPRING_DATASOURCE_PASSWORD:}}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        // 1. Check if direct URL (DATABASE_URL or SPRING_DATASOURCE_URL) is supplied
        if (rawUrl != null && !rawUrl.isBlank()) {
            String url = rawUrl.trim();
            if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
                try {
                    URI uri = new URI(url.replace("postgres://", "http://").replace("postgresql://", "http://"));
                    String host = uri.getHost();
                    int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                    String path = uri.getPath();
                    String userInfo = uri.getUserInfo();

                    config.setJdbcUrl("jdbc:postgresql://" + host + ":" + port + path);
                    config.setDriverClassName("org.postgresql.Driver");

                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        config.setUsername(parts[0]);
                        config.setPassword(parts[1]);
                    } else if (userInfo != null) {
                        config.setUsername(userInfo);
                        config.setPassword(dbPassword);
                    } else {
                        config.setUsername(dbUser);
                        config.setPassword(dbPassword);
                    }
                    log.info("Production PostgreSQL connected via parsed URL: {}:{}", host, port);
                    return new HikariDataSource(config);
                } catch (Exception e) {
                    log.warn("Failed to parse URI ({}), using fallback JDBC wrapping", e.getMessage());
                    config.setJdbcUrl(url.startsWith("jdbc:") ? url : "jdbc:" + url);
                    config.setDriverClassName("org.postgresql.Driver");
                    config.setUsername(dbUser);
                    config.setPassword(dbPassword);
                    return new HikariDataSource(config);
                }
            } else {
                config.setJdbcUrl(url);
                config.setDriverClassName(url.contains("h2") ? "org.h2.Driver" : "org.postgresql.Driver");
                config.setUsername(dbUser);
                config.setPassword(dbPassword);
                return new HikariDataSource(config);
            }
        }

        // 2. Check if Render Blueprint DB_HOST is supplied
        if (dbHost != null && !dbHost.isBlank() && !dbHost.equalsIgnoreCase("localhost")) {
            String jdbcUrl = "jdbc:postgresql://" + dbHost + ":" + dbPort + "/" + dbName;
            config.setJdbcUrl(jdbcUrl);
            config.setDriverClassName("org.postgresql.Driver");
            config.setUsername(dbUser);
            config.setPassword(dbPassword);
            log.info("Production PostgreSQL connected via DB_HOST: {}", jdbcUrl);
            return new HikariDataSource(config);
        }

        // 3. Fallback to resilient file-backed H2 if no cloud DB is linked
        log.info("No cloud PostgreSQL found. Running production in embedded file-backed H2 mode.");
        config.setJdbcUrl("jdbc:h2:file:./data/worksync-prod-db;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE;MODE=PostgreSQL");
        config.setDriverClassName("org.h2.Driver");
        config.setUsername("sa");
        config.setPassword("");
        return new HikariDataSource(config);
    }
}
