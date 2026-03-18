package com.ronaldo.meal_planner_vip.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DatabaseMigrationConfig {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationConfig.class);

    @Bean
    public CommandLineRunner ensureMealTypeColumn(JdbcTemplate jdbcTemplate) {
        return args -> {
            Integer columnCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'meal_template' AND COLUMN_NAME = 'meal_type'",
                    Integer.class
            );

            if (columnCount != null && columnCount == 0) {
                jdbcTemplate.execute("ALTER TABLE meal_template ADD COLUMN meal_type VARCHAR(50) NULL");
            }

            jdbcTemplate.update("UPDATE meal_template SET meal_type = 'maintain' WHERE meal_type IS NULL OR meal_type = ''");
        };
    }

    @Bean
    public CommandLineRunner ensureMealDetailsPrimaryKey(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                Integer hasMealTimeInPk = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'meal_details' " +
                                "AND CONSTRAINT_NAME = 'PRIMARY' AND COLUMN_NAME = 'meal_time'",
                        Integer.class
                );

                if (hasMealTimeInPk != null && hasMealTimeInPk == 0) {
                    jdbcTemplate.update("UPDATE meal_details SET meal_time = 'breakfast' WHERE meal_time IS NULL OR meal_time = ''");
                    jdbcTemplate.execute("ALTER TABLE meal_details DROP PRIMARY KEY, ADD PRIMARY KEY (idmf, food_id, meal_time)");
                }
            } catch (Exception exception) {
                logger.warn("Skip meal_details primary key migration: {}", exception.getMessage());
            }
        };
    }

    @Bean
    public CommandLineRunner ensureScheduleMealPrimaryKey(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                Integer hasDateInPk = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schedule_meal' " +
                                "AND CONSTRAINT_NAME = 'PRIMARY' AND COLUMN_NAME = 'date'",
                        Integer.class
                );

                if (hasDateInPk != null && hasDateInPk == 0) {
                    jdbcTemplate.update("UPDATE schedule_meal SET date = CURDATE() WHERE date IS NULL");
                    jdbcTemplate.execute("ALTER TABLE schedule_meal DROP PRIMARY KEY, ADD PRIMARY KEY (schedule_id, idmf, date)");
                }
            } catch (Exception exception) {
                logger.warn("Skip schedule_meal primary key migration: {}", exception.getMessage());
            }
        };
    }

    @Bean
    public CommandLineRunner removeLegacyFoodsColumns(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                Integer hasUnitColumn = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'foods' AND COLUMN_NAME = 'unit'",
                        Integer.class
                );

                if (hasUnitColumn != null && hasUnitColumn > 0) {
                    jdbcTemplate.execute("ALTER TABLE foods DROP COLUMN unit");
                }

                Integer hasFoodImageColumn = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'foods' AND COLUMN_NAME = 'food_image'",
                        Integer.class
                );

                if (hasFoodImageColumn != null && hasFoodImageColumn > 0) {
                    jdbcTemplate.execute("ALTER TABLE foods DROP COLUMN food_image");
                }
            } catch (Exception exception) {
                logger.warn("Skip foods column cleanup migration: {}", exception.getMessage());
            }
        };
    }
}
