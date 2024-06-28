import csv
import random
from datetime import datetime, timedelta
from geopy.distance import geodesic

# Configuration
TOTAL_EVENTS = 10000  # Total number of events to generate
EVENTS_PER_FILE = 5000  # Number of events per CSV file
USAGE_TYPES = ['Data', 'Call', 'Text']

# Load cities and their coordinates
CITIES = {}
with open('cities.csv', 'r') as f:
    csv_reader = csv.reader(f)
    for row in csv_reader:
        city = row[0]
        point = row[1].replace('POINT(', '').replace(')', '').split()
        CITIES[city] = (float(point[1]), float(point[0]))  # (latitude, longitude)

# Load SIM IDs
with open('sim_ids.csv', 'r') as f:
    SIM_IDS = [line.strip() for line in f]

def generate_event(sim_id, last_location, last_timestamp):
    current_timestamp = last_timestamp + timedelta(seconds=random.randint(1, 3600))
    
    if last_location:
        if SIM_IDS.index(sim_id) <= 4550:  # Normal users
            max_distance = 400  # km
        else:  # Special users
            max_distance = 10000  # km
        
        while True:
            new_city = random.choice(list(CITIES.keys()))
            new_location = CITIES[new_city]
            distance = geodesic(last_location, new_location).kilometers
            time_diff = (current_timestamp - last_timestamp).total_seconds() / 3600  # in hours
            if distance <= max_distance * time_diff:
                break
    else:
        new_city = random.choice(list(CITIES.keys()))
        new_location = CITIES[new_city]

    usage_type = random.choice(USAGE_TYPES)
    
    event = {
        'SIMID': sim_id,
        'Location': new_city,
        'UsageType': usage_type,
        'DataTransferAmount': round(random.uniform(1, 65535), 2) if usage_type == 'Data' else "NULL",
        'CallDuration': random.randint(1, 360) if usage_type == 'Call' else "NULL",
        'Timestamp': current_timestamp.strftime('%Y-%m-%d %H:%M:%S.%f'),
        'Geo': f'POINT({new_location[1]} {new_location[0]})'
    }
    
    return event, new_location, current_timestamp

def write_csv(filename, events):
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = ['SIMID', 'Location', 'UsageType', 'DataTransferAmount', 'CallDuration', 'Timestamp', 'Geo']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for event in events:
            writer.writerow(event)

def main():
    sim_locations = {sim_id: (None, datetime.now() - timedelta(hours=8)) for sim_id in SIM_IDS}
    events = []
    file_count = 1

    for i in range(TOTAL_EVENTS):
        sim_id = random.choice(SIM_IDS)
        last_location, last_timestamp = sim_locations[sim_id]
        event, new_location, new_timestamp = generate_event(sim_id, last_location, last_timestamp)
        sim_locations[sim_id] = (new_location, new_timestamp)
        events.append(event)

        if len(events) == EVENTS_PER_FILE:
            write_csv(f'usage_data_{file_count}.csv', events)
            events = []
            file_count += 1

    if events:
        write_csv(f'usage_data_{file_count}.csv', events)

if __name__ == "__main__":
    main()