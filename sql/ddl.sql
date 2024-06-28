-- Create and use the main Database
CREATE DATABASE IF NOT EXISTS telco;
USE telco;

-- Create usage Table
CREATE TABLE IF NOT EXISTS `usage` (
    UsageID VARCHAR(50) NOT NULL,
    SIMID VARCHAR(50),
    Location VARCHAR(100),
    UsageType VARCHAR(255),
    DataTransferAmount NUMERIC(18,2),
    CallDuration INT,
    Timestamp TIMESTAMP(6),
    Geo GEOGRAPHYPOINT,
    SHARD KEY (UsageID)
);

-- Create potential_fraud Table
CREATE TABLE IF NOT EXISTS `potential_fraud` (
    FraudID BIGINT NOT NULL AUTO_INCREMENT,
    UsageID1 VARCHAR(50),
    UsageID2 VARCHAR(50),
    Timestamp TIMESTAMP(6),
    SHARD KEY (FraudID)
);

-- Create Table with new Full-Text Index over JSON
CREATE TABLE `telco-users-fts` (
    id BSON,
    records JSON,
    FULLTEXT USING VERSION 2 rec_ft_index (records));