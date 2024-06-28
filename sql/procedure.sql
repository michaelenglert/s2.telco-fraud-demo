DELIMITER //
CREATE OR REPLACE PROCEDURE fraud (batch QUERY(
        UsageID VARCHAR(50),
        SIMID VARCHAR(50),
        Location VARCHAR(100),
        UsageType VARCHAR(255),
        DataTransferAmount NUMERIC(18,2),
        CallDuration INT,
        Timestamp TIMESTAMP(6),
        Geo GEOGRAPHYPOINT
        ))
RETURNS void
AS
BEGIN
    INSERT INTO `usage` (UsageID, SIMID, Location, Timestamp, Geo) select UsageID, SIMID, Location, Timestamp, Geo from batch;  
    INSERT INTO potential_fraud (UsageID1, UsageID2, Timestamp)
        (
            select UsageID1, UsageID2, Timestamp2
        from
            (SELECT UsageID as UsageID1, SIMID as ID1, Timestamp as Timestamp1, Geo as Geo1
            FROM `usage` 
            WHERE SIMID in (Select SIMID from batch)) as U
         join
            (Select UsageID as UsageID2, SIMID as ID2, Timestamp as Timestamp2, Geo as Geo2
            from batch) as F
            on U.ID1 = F.ID2
        where 
            (ROUND((GEOGRAPHY_DISTANCE(F.Geo2, U.Geo1)/1000),0)) > 2000
            AND MINUTE(TIMEDIFF(F.Timestamp2, U.Timestamp1)) < 20
        );
END //
DELIMITER;