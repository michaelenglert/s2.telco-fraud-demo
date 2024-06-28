CREATE TABLE `usage` (
    UsageID BIGINT NOT NULL AUTO_INCREMENT,
    SIMID VARCHAR(50),
    Location VARCHAR(100),
    UsageType VARCHAR(255),
    DataTransferAmount NUMERIC(18,2),
    CallDuration INT,
    Timestamp TIMESTAMP(6),
    Geo GEOGRAPHYPOINT,
    SHARD KEY (UsageID)
);

CREATE TABLE `potential_fraud` (
    FraudID BIGINT NOT NULL AUTO_INCREMENT,
    UsageID1 BIGINT,
    UsageID2 BIGINT,
    Timestamp TIMESTAMP(6),
    SHARD KEY (FraudID)
);