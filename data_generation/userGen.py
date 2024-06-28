import csv
from faker import Faker
import pymongo
import os

mongoUser = os.environ.get('MONGO_USER')
mongoPassword = os.environ.get('MONGO_PASSWORD')
mongoHost = os.environ.get('MONGO_HOST')
mongoAppName = os.environ.get('MONGO_APP_NAME')
mongoDb = os.environ.get('MONGO_DB')
mongoCollection = os.environ.get('MONGO_COLLECTION')

fake = Faker()

mongo_uri = f"mongodb+srv://{mongoUser}:{mongoPassword}@{mongoHost}/?retryWrites=true&w=majority&appName={mongoAppName}"

client = pymongo.MongoClient(mongo_uri)
db = client[f"{mongoDb}"]
collection = db[f"{mongoCollection}"]

sim_ids = []
with open('sim_ids.csv', 'r') as file:
    reader = csv.reader(file)
    for row in reader:
        sim_ids.extend(row)

for sim_id in sim_ids:
    username = fake.user_name()
    email = fake.email()

    json_object = {
        "sim_id": sim_id.strip(),
        "username": username,
        "email": email
    }

    result = collection.insert_one(json_object)
    print(f"Inserted document with ID: {result.inserted_id}")

client.close()

print("Data generation and insertion complete.")