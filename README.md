# 🐢 Turtle Race Betting: Full-Stack Web App

![Python](https://img.shields.io/badge/Python-Flask-blue?style=for-the-badge&logo=python)
![JavaScript](https://img.shields.io/badge/Frontend-Canvas_API-yellow?style=for-the-badge&logo=javascript)
![Database](https://img.shields.io/badge/Database-SQLite-lightgrey?style=for-the-badge&logo=sqlite)

A modern, interactive betting application built with **Flask** and **Vanilla JavaScript**. This project demonstrates real-time Canvas API animations, RESTful API design, database persistence, and Web Audio synthesis.

## 🚀 Key Features

* **Provably Fair Algorithm:** Implements a **weighted probability engine** where win rates are mathematically tied to the user's chosen risk multiplier (e.g., 9x payout = 10% win chance), enforcing a consistent House Edge.
* **Real-time Race Simulation:** Custom-built physics engine using HTML5 Canvas (60 FPS) that visualizes the server-side outcome.
* **Persistent Banking:** Uses **SQLite** and **SQLAlchemy** to track user balance, wins, and losses across different sessions.
* **Synthesized Audio:** Custom Web Audio API implementation for dynamic sound effects (whistles, victory fanfares) without external assets.
* **Risk Control:** Dynamic slider allowing users to adjust their risk/reward ratio from **1.5x (Safe)** to **10.0x (High Risk)**.

## 🛠️ Tech Stack

* **Backend:** Python 3, Flask, SQLAlchemy
* **Frontend:** JavaScript (ES6+), HTML5 Canvas, Tailwind CSS
* **Database:** SQLite (Relational DB)

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/ZeelModi4/turtle_race.git](https://github.com/ZeelModi4/turtle_race.git)
    cd turtle_race
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the Application**
    ```bash
    python app.py
    ```
    The app will start at `http://127.0.0.1:5000`.

## 📸 Project Context
This project was developed to demonstrate full-stack proficiency, specifically focusing on the integration between a Python backend logic layer and a reactive JavaScript frontend. It handles state management, user authentication simulation, and mathematical probability logic.

---
**Author:** Zeel Modi
