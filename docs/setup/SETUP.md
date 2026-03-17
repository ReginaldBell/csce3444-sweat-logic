# SweatLogic Setup Guide

## Prerequisites

You must have the following installed before running the project:

| Tool       | Version   | Download                                                    |
|------------|-----------|-------------------------------------------------------------|
| Java JDK   | 17+       | https://adoptium.net/                                       |
| Apache Maven | 3.8+    | https://maven.apache.org/download.cgi                       |
| Python     | 3.x       | https://www.python.org/downloads/ (for frontend file server)|
| Git        | any       | https://git-scm.com/downloads                               |

### Verify installations

```bash
java -version
mvn -version
python --version
git --version
```

## Running the Backend

The backend is a Spring Boot application using Java 17, Maven, and SQLite.

```bash
cd backend
mvn spring-boot:run
```

This starts the API server on **http://localhost:8080**.

On first run, Maven will download all dependencies automatically. The SQLite database file (`sweat-logic.db`) is created automatically in the `backend/` directory.

## Running the Frontend

The frontend is plain HTML/CSS/JS with no build step. You just need a local file server.

**Option A -- Python (recommended):**
```bash
cd frontend
python -m http.server 3000
```

**Option B -- VS Code Live Server:**
1. Install the "Live Server" extension in VS Code.
2. Right-click `frontend/index.html` and select "Open with Live Server".

Then open **http://localhost:3000** in your browser.

## Running Both Together

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 (Frontend):**
```bash
cd frontend
python -m http.server 3000
```

## Project Structure

```
csce3444-sweat-logic/
  backend/          Spring Boot API (Java 17, Maven, SQLite)
  frontend/         Static HTML/CSS/JS frontend
    css/            Stylesheets
    js/             JavaScript files
    images/         Image assets
  docs/             Documentation
```

## Troubleshooting

- **Port 8080 already in use:** Another process is using the port. Stop it or change the backend port in `backend/src/main/resources/application.properties`.
- **Maven build fails:** Make sure you have Java 17+ and Maven 3.8+ installed. Run `mvn clean install` to rebuild from scratch.
- **Frontend can't reach backend:** Make sure the backend is running on port 8080 before loading the frontend.
