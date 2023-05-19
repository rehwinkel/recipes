# recipes
This is a fairly simple web application for managing recipes. The frontend is writen in TypeScript using SolidJS. The backend is written in Rust.
I use SQLite as the database for this application. Starting the server can be done with the supplied start script (`./start.sh`). 
This will serve the webapp locally at `127.0.0.1:8080`. The API-Url is currently hard-coded in the frontend (`vite.config.ts`). 
Hosting the webapp under a different domain will require adjusting that, and starting the docker with the desired port.