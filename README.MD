# Telco Fraud Detection Demo - Demothon 2024
## Description
Combining real-time BSS data with CDP data and 3-rd party data to prevent Roaming Fraud, International Revenue Share Fraud (IRSF).
Pipeline In -> Analytics + Search -> Push out to Kafka (future) -> Service action + Push out to Data Lake

## Architecture
**[Slides](https://docs.google.com/presentation/d/1OcaBLrUHHGbgjyruP0E2ScTpTkdvzNxCnEH5s8fz9HY/edit?usp=sharing)**
* Remarks
  * For simplicity currently there is no CDC-In from MySQL
  * CDC-In has been done for Mongo via Kai for User Info
  * CDC-Out has not been implemented due to time constraints
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
  * Pipeline from Cell Tower S3 `.csv` files
  * CDC-In (Mongo Kai) for User Table
  * Copy to new Table for new - Full text search v2 (JLucene + JSON full text index)
  * Fraud Detection Algo
    * Notebook for Rapid Testing
    * Deployed using a Procedure
    * Cases
      * Impossible Travel - Same SIM ID within a short amount of time registered to Towers that are too far apart
    * New record in Fraud detected Table
* UI
  * Dashboard showing the detected Frauds on a Map
  * Full text search v2 (JLucene + JSON full text index) Query
* Not covered yet
  * Schema Pipeline Inference
  * DB Branching
  * Ingest from Iceberg
  * Auto scaling / fast scaling
  * CDC-Out

## Notebook
* [Notebook Link]
* [Notebook Code](./notebook.ipynb)

## Demo
**Click the Demo for better quality**
![Demo](./demo.gif)
[Demo Workspace](https://portal.singlestore.com/organizations/1bf54b61-3069-436a-914c-7779003f0fbd/workspaces/26ca39e8-4438-44ac-837a-e47100978ae5)

## Data Generation
* [City Base Data](./data_generation/cities.csv)
* [SIM IDs Base Data](./data_generation/sim_ids.csv)
* [Data Generation Script to create .csv Files](./data_generation/dataGen.py)
* [Data Generation Script to create fake Users and write to Mongo](./data_generation/userGen.py)

## SQL Code
* [DDL](./sql/ddl.sql)
* [Pipelines](./sql/pipeline.sql)
* [Procedure](./sql/procedure.sql)
* [Queries](./sql/queries.sql)

## UI
* [Client Side](./public)
* [Server Side](./app)

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