from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import random
import os

app = Flask(__name__)
app.secret_key = 'turtle_power_secret_key'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///turtle.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    balance = db.Column(db.Float, default=100.00)
    total_winnings = db.Column(db.Float, default=0.0)
    total_losses = db.Column(db.Float, default=0.0)

class Bet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    amount = db.Column(db.Float, nullable=False)
    color = db.Column(db.String(20), nullable=False)
    outcome = db.Column(db.String(10)) 
    payout = db.Column(db.Float, default=0.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

TURTLES = [
    {"name": "violet", "hex": "#8b5cf6"},
    {"name": "indigo", "hex": "#6366f1"},
    {"name": "blue",   "hex": "#3b82f6"},
    {"name": "green",  "hex": "#10b981"},
    {"name": "yellow", "hex": "#eab308"},
    {"name": "orange", "hex": "#f97316"},
    {"name": "red",    "hex": "#ef4444"}
]
MAX_BET = 20
PAYOUT_MULTIPLIER = 3

def get_user_from_session():
    """Gets user based on session, or returns None"""
    if 'user_id' not in session:
        return None
    return User.query.get(session['user_id'])

def simulate_race():
    turtle_positions = {t['name']: 0 for t in TURTLES}
    finish_line = 500
    
    while True:
        for t in TURTLES:
            turtle_positions[t['name']] += random.randint(1, 10)

        finished_turtles = {name: pos for name, pos in turtle_positions.items() if pos >= finish_line}
        
        if finished_turtles:
            return max(finished_turtles, key=finished_turtles.get)


@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        username = request.form.get('username').strip()
        if not username:
            return render_template('home.html', error="Please enter a name!")
        
        user = User.query.filter_by(username=username).first()
        if not user:
            user = User(username=username, balance=100.00)
            db.session.add(user)
            db.session.commit()
        
        session['user_id'] = user.id
        session['username'] = user.username
        return redirect(url_for('game'))
    
    return render_template('home.html')

@app.route('/game')
def game():
    user = get_user_from_session()
    if not user:
        return redirect(url_for('home'))
        
    return render_template('game.html', 
                         turtles=TURTLES, 
                         max_bet=MAX_BET, 
                         initial_balance=user.balance,
                         initial_wins=user.total_winnings,
                         initial_losses=user.total_losses,
                         username=user.username)

@app.route('/bet', methods=['POST'])
def place_bet():
    user = get_user_from_session()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    data = request.json
    
    try:
        bet_amount = float(data.get('amount'))
        multiplier = float(data.get('multiplier', 3.0)) 
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid input"}), 400

    bet_color = data.get('color')

    if bet_amount <= 0 or bet_amount > MAX_BET:
        return jsonify({"success": False, "message": "Invalid bet range"}), 400
    if bet_amount > user.balance:
        return jsonify({"success": False, "message": "Insufficient funds"}), 400
    if multiplier < 1.0 or multiplier > 20.0:
         return jsonify({"success": False, "message": "Invalid multiplier"}), 400
    if bet_color not in [t['name'] for t in TURTLES]:
        return jsonify({"success": False, "message": "Invalid turtle"}), 400

    win_chance = 0.90 / multiplier
    
    rng = random.random()
    user_won = rng <= win_chance
    
    if user_won:
        winner = bet_color
        payout = bet_amount * multiplier
    else:
        losing_options = [t['name'] for t in TURTLES if t['name'] != bet_color]
        winner = random.choice(losing_options)
        payout = 0.0

    user.balance -= bet_amount
    user.balance += payout

    if user_won:
        user.total_winnings += payout
    else:
        user.total_losses += bet_amount

    new_bet = Bet(
        user_id=user.id,
        amount=bet_amount,
        color=bet_color,
        outcome="win" if user_won else "loss",
        payout=payout
    )
    db.session.add(new_bet)
    db.session.commit()

    return jsonify({
        "success": True,
        "winner": winner,
        "user_won": user_won,
        "payout": round(payout, 2),
        "bet_amount": bet_amount,
        "new_balance": round(user.balance, 2),
        "multiplier": multiplier
    })

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)