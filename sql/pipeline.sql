-- Get CSV Data
CREATE OR REPLACE PIPELINE loadFrauds AS
LOAD DATA S3 's3://menglert-us/telco-fraud/'
CONFIG '{"region":"us-east-1"}'
INTO PROCEDURE fraud
IGNORE 1 LINES
FORMAT CSV
FIELDS TERMINATED BY ','
(
    UsageID,
    SIMID,
    Location,
    UsageType,
    DataTransferAmount,
    CallDuration,
    Timestamp,
    Geo
);

TEST PIPELINE loadFrauds LIMIT 2;

-- Get Mongo Data
CREATE LINK mongoTelcoUsers AS MONGODB
CONFIG '{"mongodb.hosts":"<redacted>:27017",
"collection.include.list": "telco.telco-users",
"mongodb.ssl.enabled":"true",
"mongodb.authsource":"admin"}'
CREDENTIALS '{"mongodb.user":"me",
"mongodb.password":"<redacted>"}';

CREATE TABLES AS INFER PIPELINE AS LOAD DATA LINK mongoTelcoUsers '*' FORMAT AVRO;

-- Run Pipelines
START ALL PIPELINES;