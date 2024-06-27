FROM node:lts

# Set the working directory
WORKDIR /app/public

# Copy the package.json and package-lock.json files
COPY package*.json ../

# Install the dependencies
RUN npm install --prefix ..

# Copy the files file
COPY public .
COPY app ../


# Set the environment variables for the database connection
ENV DB_HOST=$dbHost
ENV DB_USER=$dbUser
ENV DB_PASSWORD=$dbPassword
ENV DB_DATABASE=$dbDatabase

# Expose the port for the server
EXPOSE 3000

# Start the server
CMD ["node", "../server.js"]