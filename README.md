# Sweat Logic

> **Note:** This project is currently in the planning phase. Development has not yet started. See [Project Status](#project-status) below.

A web-based fitness tracker designed specifically for UNT students, featuring rule-based workout recommendations, progress tracking, and an interactive recreation center map. Built as part of CSCE 3444 Software Engineering.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Status](#project-status)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Methodology](#development-methodology)
- [Team](#team)
- [Documentation](#documentation)
- [License](#license)

## Overview

Sweat Logic helps UNT students maintain consistent fitness routines by providing structured workout guidance and progress tracking. The application generates daily workout recommendations from a curated exercise database based on user-selected target body parts, tracks workout completion, and displays a static interactive map of the UNT recreation center to help users locate equipment.

### Target Users
- **Beginners**: Students new to structured fitness who need exercise guidance and equipment location assistance
- **Intermediate**: Students with some fitness experience seeking consistency and accountability
- **Advanced**: Experienced students who want progress tracking and workout logging

### Key Objectives
- Simplify workout planning with rule-based exercise recommendations
- Track progress through workout history and streak metrics
- Help students navigate the UNT recreation center efficiently
- Provide a clean, intuitive interface requiring minimal instruction

## Features

### Planned Features

> **Note:** Feature details are derived from the approved SRS and may be refined during system design.

#### Workout Management
- **Daily Workout Generation**: Rule-based exercise selection from a predefined database
- **Body Part Targeting**: Select specific muscle groups (chest, legs, back, arms, core)
- **Exercise Details**: View sets, reps, and instructions for each exercise
- **Workout Customization**: Add or remove exercises from recommended workouts
- **Completion Tracking**: Mark workouts as complete with date/time logging

#### Progress Tracking
- **Workout History**: Calendar view of all completed workouts
- **Streak Tracking**: Monitor current and longest workout streaks
- **Progress Metrics**: Total workouts completed and consistency statistics
- **Goal Display**: View user-defined fitness goals alongside progress

#### Recreation Center Map
- **Interactive Static Map**: Floor plan showing equipment zones and areas
- **Equipment Locations**: Labeled positions for bench press, squat racks, cardio machines, etc.
- **Area Identification**: Clear marking of cardio zone, free weights, stretching area, locker rooms

#### User Profile
- **Profile Setup**: Enter age, height, weight, gender, and fitness goals
- **Preference Management**: Update workout preferences and target body parts
- **Goal Setting**: Define personal fitness objectives (informational only)

## Tech Stack

> **Note:** The following technologies represent the team's proposed stack based on current requirements.

| Component | Technology |
|-----------|-----------|
| **Backend** | Java with Spring Boot |
| **Frontend** | HTML, CSS, JavaScript |
| **Database** | SQLite |
| **IDE** | Visual Studio Code |
| **Version Control** | Git & GitHub |
| **Hosting** | Render |
| **Modeling** | draw.io |
| **Communication** | Discord |
| **File Sharing** | Google Drive |

### Why This Stack?
- **Spring Boot**: Robust framework for building RESTful APIs with built-in dependency injection
- **SQLite**: Lightweight, zero-configuration database perfect for academic projects
- **HTML/CSS**: Standard web technologies ensuring cross-platform compatibility
- **Render**: Free hosting tier suitable for course demonstrations and testing

## Project Status

**Phase: Planning & Requirements**

- [x] Team formation and initial meetings
- [x] Software Requirements Specification (SRS) completed
- [ ] System design and architecture
- [ ] Development environment setup
- [ ] Database schema design
- [ ] Sprint planning
- [ ] Development (Sprint 1)
- [ ] Testing & QA
- [ ] Deployment to Render
- [ ] Final documentation and presentation

**Timeline**: 12-week semester project (Spring 2026)  
**Development Start**: TBD  
**Expected Completion**: End of semester

### Current Milestone
Finalizing project planning and preparing for system design phase.

## Getting Started

> **Note**: Setup instructions will be added once development begins.

### Prerequisites (Planned)
```bash
# Requirements for development
- Java JDK 11 or higher
- Node.js (for any potential frontend tooling)
- Git
- Visual Studio Code (recommended)
- SQLite
```

### Installation (Coming Soon)
Detailed installation and setup instructions will be provided once the project structure is established.

### Running the Application (Coming Soon)
Instructions for running the application locally and accessing the hosted version will be added during development.

## Project Structure

> **Note**: Project structure will be finalized during the design phase.

Expected structure:
```
csce3444-sweat-logic/
├── backend/              # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/    # Java source files
│   │   │   └── resources/
│   │   └── test/        # Unit tests
│   └── pom.xml          # Maven configuration
├── frontend/            # HTML/CSS/JS files
│   ├── css/
│   ├── js/
│   └── index.html
├── database/            # SQLite database files
├── docs/                # Documentation
│   ├── SRS.docx        # Requirements specification
│   ├── design/         # System design documents
│   └── diagrams/       # Architecture diagrams
├── tests/              # Integration tests
└── README.md
```

## Planned Development Methodology

We plan to use an **Agile SDLC** approach with the following structure:

### Sprint Structure
- Time-boxed sprints delivering incremental functionality
- 2-3 days buffer time per sprint for contingencies
- Continuous feedback and iteration

### Testing Philosophy
- Testing conducted in parallel with development
- Early detection and resolution of defects
- Emphasis on integration testing

### Team Roles & Ownership

| Team Member | Primary Phase Responsibility |
|-------------|------------------------------|
| **Demarcus Bell** | Requirements & SRS |
| **Alejandro Castro** | System Design |
| **Gerardo Martinez** | Environment & Setup |
| **Cash Quigley** | Development |
| **Shalom Tanyi** | Testing & QA |
| **All Members** | Release & Documentation |

### Communication Protocols
- **Primary Channel**: Discord server for ongoing coordination
- **Meetings**: Weekly in-person during class time
- **Documentation**: Google Drive for shared files
- **Code Review**: Through GitHub pull requests

### Team Expectations
- Maintain good communication, especially during roadblocks
- Hold each other accountable on deadlines
- Attend every class session
- Equal distribution of effort and quality work
- Address issues through open collaborative discussion

## Team

**Group 13** - CSCE 3444 Software Engineering  
University of North Texas, Spring 2026

- Alejandro Castro
- Cash Quigley
- Demarcus Bell
- Gerardo Martinez
- Shalom Tanyi

## Documentation

### Available Documents
- [Software Requirements Specification (SRS)](docs/SRS_Group_13_Modified__1_.docx) - Complete requirements document

### Planned Documentation
- System Design Document
- Database Schema Specification
- API Documentation
- User Manual
- Testing Plan & Results
- Deployment Guide

## Contributing

This is an academic project for CSCE 3444. Contributions are limited to team members.

### Workflow (When Development Starts)
1. Create a feature branch from `main`
2. Make your changes with clear, meaningful commits
3. Submit a pull request for review
4. Merge after team review and approval

## Design Constraints

- **Single-User Demonstration**: No authentication or multi-user support (focusing on core features)
- **Semester Timeline**: All features must be demonstrable within 12 weeks
- **Platform Constraints**: Must deploy on Render's free tier
- **Technology Requirements**: Java/Spring Boot backend, HTML/CSS frontend
- **Cross-Platform**: Must function on Windows, macOS, and Linux

## Assumptions & Dependencies

### Assumptions
- Users have basic computer literacy and web browser access
- Users have consistent internet connectivity
- UNT recreation center layout remains stable during development
- Users provide accurate personal information

### Dependencies
- Spring Boot framework availability
- SQLite database stability
- Render platform uptime for demonstrations
- Modern web browser support (Chrome, Firefox, Safari, Edge)
- Team member availability as per group agreement

## Known Limitations

- Single-user demonstration mode (no persistent multi-user accounts)
- Static recreation center map (no real-time positioning)
- Rule-based exercise selection (no AI/ML recommendations)
- Limited to 10 concurrent users during demonstrations
- Dependent on Render free tier availability

## License

This project is developed as coursework for CSCE 3444 at the University of North Texas.  
© 2026 Group 13. All rights reserved.

---

**Last Updated**: February 6, 2026  
**Version**: 1.0 (Planning Phase)  
**Course**: CSCE 3444 Software Engineering  
**Institution**: University of North Texas
