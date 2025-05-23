# Billeasy Task

## Requirements

- **Node.js**: Version 22.15.0
- **PostgreSQL**: Ensure PostgreSQL is installed and running.
- **Redis**: A running Redis server is required.

## Setup Instructions

1. **Clone the Repository**:
  Clone the repository and navigate to the project directory:
   ```bash
   git clone <https://github.com/ganyavhad/billeasy-task.git>
   cd billeasy-task
   ```

2. **Create SQL Tables**:
  Ensure your PostgreSQL database is set up.
  The application will automatically synchronize the database schema based on the entities defined in the project.(Make sure to keep synchronize flag "true" in config/typeorm.config.ts)
  Or else need to import table from bin/sql folder

3. **Run Redis Server**:
  Start your Redis server.
  You can use the default configuration or update the .env file with your Redis host and port.

4. **Install Dependencies**:
  Install project dependencies:
  ```bash
   npm install
  ```

5. **Update .env file with DB and redis variables
  Refer .envexample file for variables

6. **Run the Project**:
  Start the application:
  ```bash
   npm run start
  ```
7. **Access Swagger Documentation**:
  Once the server is running, open your browser and visit:
  ```bash
    http://localhost:3000/api
  ```
  This will open the Swagger API documentation for exploring the available endpoints.

