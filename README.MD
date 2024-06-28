# Telco Fraud Detection Demo - Demothon 2024
## Description
Combining real-time BSS data with CDP data and 3-rd party data to prevent Roaming Fraud, International Revenue Share Fraud (IRSF).
Pipeline In -> Analytics + Search -> Push out to Kafka  -> Service action + Push out to Data Lake
## Architecture
* Cell Towers
  * Data generated from the towers - stored in an S3 bucket as 
    * DDL
      * SIM ID
      * Location
      * Usage Type (Call, Data, Text)
      * Data Transfer Amount
      * Call Duration
      * Timestamp
* Helios
  * Pipeline from Cell Tower S3 .csv files
  * Fraud Detection Algo
    * Notebook for Rapid Testing
    * Deploy using ideally a Procedure (simplest)
    * Cases
      * Impossible Travel - Same SIM ID within a short amount of time registered to Towers that are too far apart
    * New record in Fraud detected Table
  * Pipeline to Kafka
    * Detected Fraud
    * Trigger an eMail Notification to the End User or something similar
  * UI
    * Dashboard showing the detected Frauds on a Map
  * Not covered yet
    * Schema Pipeline Inference
    * DB Branching
    * Full text search v2 (JLucene + JSON full text index)
    * Ingest from Iceberg
    * Auto scaling / fast scaling

## Notebook
[Notebook Link]

## Demo
![Demo](./demo.gif)

## Docker
### Build
* Clone this repository
* Build Docker Container `docker buildx build --no-cache -f ./Dockerfile -t singlestore-demo/telco-fraud .`

### Run
* Create a `.env` file from `env.sample`
* Run the Container `docker run -p 3000:3000 --env-file .env -d --name telco-fraud singlestore-demo/telco-fraud`
* Open your browser and point it to [localhost:3000]

 [localhost:3000]: http://localhost:3000
 [Notebook Link]: https://portal.singlestore.com/organizations/1bf54b61-3069-436a-914c-7779003f0fbd/develop/notebook/d5580703-c940-4150-ba33-cc6ebdb0209f%2F(DMO)%20Telco%20Fraud%20Detection.ipynb
