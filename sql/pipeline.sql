-- BASIC
CREATE OR REPLACE AGGREGATOR PIPELINE loadFrauds AS
LOAD DATA S3 's3://s2db-demos-pub-bucket/telco-fraud/'
CONFIG '{"region":"us-east-1"}'
INTO TABLE `usage`
IGNORE 1 LINES
FORMAT CSV
FIELDS TERMINATED BY ','
(
    SIMID,
    Location,
    UsageType,
    DataTransferAmount,
    CallDuration,
    Timestamp,
    Geo
);

TEST PIPELINE loadFrauds LIMIT 2;
START PIPELINE loadFrauds;

STOP PIPELINE loadFrauds;
DROP PIPELINE loadFrauds;