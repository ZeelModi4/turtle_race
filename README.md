# 🐢 Turtle Race Betting: Full-Stack Web App

A modern, interactive betting application built with **Flask** and **Vanilla JavaScript**. This project demonstrates real-time Canvas API animations, RESTful API design, database persistence, and Web Audio synthesis.

![Project Screenshot](link-to-your-screenshot.png)

## 🚀 Features

* **Real-time Race Simulation:** Custom-built physics engine using HTML5 Canvas (60 FPS).
* **Persistent Data:** Uses SQLite and SQLAlchemy to track user balance and bet history across sessions.
* **Synthesized Audio:** Custom Web Audio API implementation for dynamic sound effects (no external assets).
* **Secure Backend:** Server-side validation for all bets and race outcomes.
* **Responsive UI:** Mobile-first design using Tailwind CSS and glassmorphism aesthetics.

## 🛠️ Tech Stack

* **Backend:** Python 3.10+, Flask, SQLAlchemy
* **Frontend:** JavaScript (ES6+), HTML5 Canvas, Tailwind CSS
* **Database:** SQLite

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/turtle-race-betting.git](https://github.com/yourusername/turtle-race-betting.git)
    cd turtle-race-betting
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

## 🧪 Running Tests

This project includes a unit testing suite to ensure financial logic reliability.
```bash
python tests.py