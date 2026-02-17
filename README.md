# Ideal Course Mapping

## Overview

Ideal Course Mapping is a course-planning system designed to support academic pathway visualization and long-term curriculum mapping for Georgia Tech students.

Originally developed as part of the Georgia Tech VIP (Vertically Integrated Projects) program, this platform supported 1,000+ Georgia Tech students by improving academic planning accuracy.

The system consists of a Python-based backend for data ingestion and processing, and a React-based frontend for interactive visualization and planning.

---

## Impact

- Improved academic path planning for 1,000+ undergraduate students  
- Reduced manual course data entry time by 90%  
- Processed and normalized 500+ external course records  
- Automated extraction of 200+ major and concentration requirement sets  

---

## Tech Stack

### Frontend
- React (Next.js) – Web application  
- React Native (Expo) – Cross-platform mobile support  
- Dynamic course visualization interfaces  
- API-driven data rendering  

### Backend
- Python (Flask) – RESTful API architecture  
- Pandas – Data transformation and export generation  
- Matplotlib – Course graph visualizations  
- BeautifulSoup & Selenium – Automated data ingestion and scraping pipelines  

---

## Core Features

- Academic pathway visualization  
- Automated curriculum requirement normalization  
- Linked course graph generation  
- CSV export functionality for planning and analysis  
- RESTful APIs serving structured JSON data  
- Cross-platform support (Web + Mobile)  

---

## Architecture Overview

1. Data Ingestion Layer  
   - Scrapes and processes external course data using BeautifulSoup and Selenium  
   - Cleans and normalizes curriculum requirements  

2. Processing & Analytics Layer  
   - Uses Pandas for structured data manipulation  
   - Generates linked prerequisite mappings  
   - Produces exportable CSV datasets  

3. API Layer  
   - Flask-based REST endpoints  
   - Serves structured academic planning data  

4. Frontend Visualization Layer  
   - Interactive React interface  
   - Dynamic course dependency rendering  
   - Mobile support via React Native (Expo)  

---

## Prerequisites

Before running the project locally, ensure you have:

- Python 3.x  
- Node.js (v16+ recommended)  
- npm or yarn  
- pip (Python package manager)  

---

## Installation

### Backend Setup

```bash
cd backend
run RUN_ME_FOR_PACKAGE_INSTALLATION.py
run scripts_for_frontend\.main_script_for_backend.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
