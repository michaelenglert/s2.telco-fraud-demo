-- Check Usage Data
SELECT COUNT(DISTINCT(SIMID)) FROM `usage`;

-- Check Fraud Data
SELECT * FROM potential_fraud LIMIT 5;

-- Check Users
SELECT _id:>JSON, BSON_EXTRACT_STRING(_more, 'username') AS username 
    FROM `telco-users` LIMIT 5;

SELECT _id:>JSON, _more:>JSON 
    FROM `telco-users` LIMIT 5;

-- Insert Data into new FTS Table
INSERT INTO `telco-users-fts`
    (SELECT _id, _more:>JSON FROM `telco-users`);

-- Check Users in new Table
SELECT id:>JSON 
    FROM `telco-users-fts` LIMIT 5;

-- Test the Full-Text Index
SELECT records, (
    MATCH (
    TABLE `telco-users-fts`) AGAINST ('records:julie*')) AS score
    FROM `telco-users-fts`
    WHERE score > 0
    ORDER BY score DESC;

SELECT 
    pf.FraudID as id, 
    CONCAT('Potential fraud for user ', JSON_EXTRACT_STRING(tuf.records, 'username')) as description,
    GREATEST(u1.Timestamp, u2.Timestamp) as date
    FROM potential_fraud pf
    JOIN `usage` u1 ON pf.UsageID1 = u1.UsageID
    JOIN `usage` u2 ON pf.UsageID2 = u2.UsageID
    JOIN `telco-users-fts` tuf ON JSON_EXTRACT_STRING(tuf.records, 'sim_id') = u1.SIMID
    WHERE MATCH (TABLE tuf) AGAINST ('records:julie88');