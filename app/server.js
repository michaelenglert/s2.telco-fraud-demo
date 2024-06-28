require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbDatabase = process.env.DB_DATABASE;

const db = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Get potential frauds with pagination
app.get('/potential-frauds', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;
  const searchTerm = req.query.search || '';

  let query = `
    SELECT 
    pf.FraudID as id, 
    CONCAT('Potential fraud for user ', JSON_EXTRACT_STRING(tu.records, 'username')) as description,
    GREATEST(u1.Timestamp, u2.Timestamp) as date
    FROM potential_fraud pf
    JOIN \`usage\` u1 ON pf.UsageID1 = u1.UsageID
    JOIN \`usage\` u2 ON pf.UsageID2 = u2.UsageID
    LEFT JOIN \`telco-users-fts\` tu ON u1.SIMID = JSON_EXTRACT_STRING(tu.records, 'sim_id')
  `;

  const queryParams = [];

  if (searchTerm) {
    query += ` WHERE MATCH (TABLE tu) AGAINST (?)`;
    queryParams.push(`records:${searchTerm}*`);
  }

  query += ` ORDER BY GREATEST(u1.Timestamp, u2.Timestamp) DESC
    LIMIT ? OFFSET ?`;

  queryParams.push(limit, offset);

  db.query(query, queryParams, (err, results) => {
    if (err) throw err;
    res.json({
      page: page,
      frauds: results
    });
  });
});

// Get usage details for a specific potential fraud
app.get('/usage/:fraudId', (req, res) => {
  const query = `
    SELECT 
      pf.FraudID,
      pf.Timestamp AS DetectionTimestamp,
      u1.UsageID AS UsageID1,
      u1.SIMID AS SIMID1,
      u1.Location AS Location1,
      u1.UsageType AS UsageType1,
      u1.DataTransferAmount AS DataTransferAmount1,
      u1.CallDuration AS CallDuration1,
      u1.Timestamp AS Timestamp1,
      GEOGRAPHY_LONGITUDE(u1.Geo) AS Longitude1,
      GEOGRAPHY_LATITUDE(u1.Geo) AS Latitude1,
      u2.UsageID AS UsageID2,
      u2.SIMID AS SIMID2,
      u2.Location AS Location2,
      u2.UsageType AS UsageType2,
      u2.DataTransferAmount AS DataTransferAmount2,
      u2.CallDuration AS CallDuration2,
      u2.Timestamp AS Timestamp2,
      GEOGRAPHY_LONGITUDE(u2.Geo) AS Longitude2,
      GEOGRAPHY_LATITUDE(u2.Geo) AS Latitude2
    FROM potential_fraud pf
    JOIN \`usage\` u1 ON pf.UsageID1 = u1.UsageID
    JOIN \`usage\` u2 ON pf.UsageID2 = u2.UsageID
    WHERE pf.FraudID = ?
  `;
  db.query(query, [req.params.fraudId], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const result = results[0];
      res.json({
        fraudId: result.FraudID,
        detectionTimestamp: result.DetectionTimestamp,
        usage1: {
          usageId: result.UsageID1,
          simId: result.SIMID1,
          location: result.Location1,
          usageType: result.UsageType1,
          dataTransferAmount: result.DataTransferAmount1,
          callDuration: result.CallDuration1,
          timestamp: result.Timestamp1,
          longitude: result.Longitude1,
          latitude: result.Latitude1
        },
        usage2: {
          usageId: result.UsageID2,
          simId: result.SIMID2,
          location: result.Location2,
          usageType: result.UsageType2,
          dataTransferAmount: result.DataTransferAmount2,
          callDuration: result.CallDuration2,
          timestamp: result.Timestamp2,
          longitude: result.Longitude2,
          latitude: result.Latitude2
        }
      });
    } else {
      res.status(404).json({ message: 'Fraud record not found' });
    }
  });
});
app.get('/analytics/frauds', (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(Timestamp, '%Y-%m-%d %H:%i') as minute, 
      COUNT(*) as count
    FROM potential_fraud
    WHERE Timestamp >= (
      SELECT DATE_SUB(MAX(Timestamp), INTERVAL 8 HOUR)
      FROM potential_fraud
    )
    GROUP BY minute
    ORDER BY minute
  `;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/analytics/usage', (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(Timestamp, '%Y-%m-%d %H:%i') as minute, 
      COUNT(*) as count
    FROM \`usage\`
    WHERE Timestamp >= (
      SELECT DATE_SUB(MAX(Timestamp), INTERVAL 8 HOUR)
      FROM \`usage\`
    )
    GROUP BY minute
    ORDER BY minute
  `;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/mapbox-token', (req, res) => {
  res.json({ token: process.env.MB_ACCESS_TOKEN });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.use(express.static('.'));