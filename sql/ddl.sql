CREATE TABLE `usage` (
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

CREATE TABLE `potential_fraud` (
    FraudID BIGINT NOT NULL AUTO_INCREMENT,
    UsageID1 VARCHAR(50),
    UsageID2 VARCHAR(50),
    Timestamp TIMESTAMP(6),
    SHARD KEY (FraudID)
);