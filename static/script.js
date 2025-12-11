let balance = INITIAL_BALANCE;
let totalWins = INITIAL_WINS;
let totalLosses = INITIAL_LOSSES;
let currentMultiplier = 3.0;
let currentSelection = null;
let isRacing = false;

const canvas = document.getElementById('raceTrack');
const ctx = canvas.getContext('2d');

const LANE_HEIGHT = canvas.height / 7; 
const FINISH_LINE = canvas.width - 70; 

let turtles = TURTLE_DATA.map((t, index) => ({
    name: t.name,
    hex: t.hex,
    x: 20,
    y: (index * LANE_HEIGHT) + (LANE_HEIGHT / 2)
}));

const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    if (type === 'whistle-start') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200, audioContext.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, audioContext.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        const now = audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.setValueAtTime(0.1, now + 0.3);
        gain.gain.linearRampToValueAtTime(0, now + 0.45);

        osc.start(now);
        osc.stop(now + 0.45);

    } else if (type === 'whistle-end') {
        [0, 0.4].forEach((delay) => {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2200, audioContext.currentTime);
                
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                const now = audioContext.currentTime;
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
                gain.gain.setValueAtTime(0.1, now + 0.2);
                gain.gain.linearRampToValueAtTime(0, now + 0.3);
                
                osc.start(now);
                osc.stop(now + 0.3);
            }, delay * 1000);
        });

    } else if (type === 'win') {
        const now = audioContext.currentTime;
        
        const notes = [
            { freq: 523.25, time: 0, dur: 0.1 },   
            { freq: 659.25, time: 0.1, dur: 0.1 }, 
            { freq: 783.99, time: 0.2, dur: 0.1 }, 
            { freq: 1046.50, time: 0.3, dur: 0.4 } 
        ];

        notes.forEach(note => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = 'triangle'; 
            osc.frequency.value = note.freq;
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            gain.gain.setValueAtTime(0.1, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);
            
            osc.start(now + note.time);
            osc.stop(now + note.time + note.dur);
        });

    } else if (type === 'lose') {
        const now = audioContext.currentTime;

        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(311.13, now); 
        osc1.frequency.linearRampToValueAtTime(293.66, now + 0.4); 
        
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        gain1.gain.setValueAtTime(0.1, now);
        gain1.gain.linearRampToValueAtTime(0, now + 0.4);
        
        osc1.start(now);
        osc1.stop(now + 0.4);

        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            const t = audioContext.currentTime;
            
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(277.18, t); 
            osc2.frequency.linearRampToValueAtTime(261.63, t + 0.8); 

            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            gain2.gain.setValueAtTime(0.1, t);
            gain2.gain.linearRampToValueAtTime(0, t + 0.8);

            osc2.start(t);
            osc2.stop(t + 0.8);
        }, 500); 
    }
};

function updateStats() {
    document.getElementById('displayBalance').innerText = `$${balance.toFixed(2)}`;
    document.getElementById('displayWins').innerText = `$${totalWins.toFixed(2)}`;
    document.getElementById('displayLosses').innerText = `$${totalLosses.toFixed(2)}`;
    
    const net = totalWins - totalLosses;
    const netEl = document.getElementById('displayNet');
    netEl.innerText = `$${net.toFixed(2)}`;
    netEl.className = `text-2xl font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`;
    
    const betAmount = parseFloat(document.getElementById('betAmount').value);
    const btn = document.getElementById('startBtn');
    
    if (currentSelection && betAmount > 0 && betAmount <= balance && !isRacing) {
        btn.disabled = false;
        btn.innerText = "🚀 Start Race!";
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        btn.disabled = true;
        btn.innerText = isRacing ? "🏁 Racing..." : "🚀 Start Race!";
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

function selectTurtle(name, hex) {
    if (isRacing) return;

    currentSelection = name;
    document.getElementById('selectedColor').value = name;

    document.querySelectorAll('.turtle-card').forEach(card => {
        card.style.backgroundColor = ''; 
        const ring = card.querySelector('[id^="ring-"]');
        const check = card.querySelector('[id^="check-"]');
        if(ring) ring.style.opacity = '0';
        if(check) check.classList.add('hidden');
        const turtleIcon = card.querySelector('.filter');
        if(turtleIcon) turtleIcon.style.filter = '';
    });

    const selectedBtn = document.getElementById(`btn-${name}`);
    if(selectedBtn) {
        selectedBtn.style.backgroundColor = selectedBtn.style.getPropertyValue('--turtle-color');
        document.getElementById(`ring-${name}`).style.opacity = '1';
        document.getElementById(`check-${name}`).classList.remove('hidden');
        const turtleIcon = selectedBtn.querySelector('.filter');
        if(turtleIcon) turtleIcon.style.filter = 'brightness(1.5)';
    }
    updateStats();
}

function setBet(amount) {
    if(!isRacing) {
        document.getElementById('betAmount').value = amount;
        document.getElementById('potentialWin').innerText = `$${(amount * 3).toFixed(2)}`;
        updateStats();
    }
}

document.getElementById('betAmount').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value) || 0;
    document.getElementById('potentialWin').innerText = `$${(val * 3).toFixed(2)}`;
    updateStats();
});

const slider = document.getElementById('riskSlider');
const multDisplay = document.getElementById('multiplierValue');
const chanceDisplay = document.getElementById('winChanceDisplay');
const riskLabel = document.getElementById('riskLabel');

if(slider) {
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        currentMultiplier = val;
        
        multDisplay.innerText = `${val.toFixed(1)}x`;
        
        const chance = Math.floor((0.90 / val) * 100);
        chanceDisplay.innerText = `Win Chance: ${chance}%`;
        
        if (val < 2.5) {
            riskLabel.innerText = "Safe Bet";
            riskLabel.className = "text-green-400 font-bold";
        } else if (val < 5.0) {
            riskLabel.innerText = "Normal Risk";
            riskLabel.className = "text-yellow-400 font-bold";
        } else {
            riskLabel.innerText = "High Risk 🔥";
            riskLabel.className = "text-red-500 font-bold";
        }

        const amount = parseFloat(document.getElementById('betAmount').value) || 0;
        document.getElementById('potentialWin').innerText = `$${(amount * val).toFixed(2)}`;
    });
}

function drawTrack() {
    ctx.fillStyle = '#0f172a'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(FINISH_LINE, 0);
    ctx.lineTo(FINISH_LINE, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#1e293b'; 
    for(let i=0; i<=7; i++) {
        let y = i * LANE_HEIGHT; 
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    turtles.forEach(t => {
        ctx.fillStyle = t.hex;
        ctx.beginPath();
        ctx.arc(t.x + 10, t.y, 12, 0, Math.PI * 2); 
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(t.x + 10, t.y, 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = t.hex;
        ctx.filter = 'brightness(1.2)'; 
        ctx.beginPath();
        ctx.arc(t.x + 22, t.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(t.x + 24, t.y - 3, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

async function placeBet() {
    const amount = parseFloat(document.getElementById('betAmount').value);
    const color = currentSelection;

    if (!color) {
        alert("Please select a turtle first!");
        return;
    }
    if (amount > balance) {
        alert("Insufficient funds!");
        return;
    }

    playSound('whistle-start');

    isRacing = true;
    updateStats();
    
    const btn = document.getElementById('startBtn');
    btn.innerText = "🏁 Racing...";
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    
    document.getElementById('statusMsg').classList.add('hidden');
    
    turtles.forEach(t => t.x = 20);

    try {
        const response = await fetch('/bet', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                amount: amount, 
                color: color,
                multiplier: currentMultiplier 
            })
        });
        const result = await response.json();

        if (!result.success) {
            alert(result.message);
            isRacing = false;
            updateStats();
            return;
        }

        animateRace(result.winner, result);

    } catch (error) {
        console.error("Error placing bet:", error);
        alert("Something went wrong with the server.");
        isRacing = false;
        updateStats();
    }
}

function animateRace(winnerColor, resultData) {
    let raceOver = false;
    let winnerCrossed = false; 

    function step() {
        raceOver = true; 

        const serverWinnerTurtle = turtles.find(t => t.name === winnerColor);

        turtles.forEach(t => {
            let speed = Math.random() * 3 + 1;
            
            if (t.name === winnerColor) {
                speed += 0.5; 
            }

            if (t.x < FINISH_LINE) {
                t.x += speed;
                raceOver = false; 
            } else {
                t.x = FINISH_LINE; 
            }
        });

        if (serverWinnerTurtle && serverWinnerTurtle.x >= FINISH_LINE) {
            winnerCrossed = true;
        }

        const visualLeader = turtles.reduce((prev, current) => (prev.x > current.x) ? prev : current);
        if (!winnerCrossed && visualLeader.x > FINISH_LINE - 50 && visualLeader.name !== winnerColor) {
             visualLeader.x -= 2; 
             if (serverWinnerTurtle) serverWinnerTurtle.x += 1;
        }

        drawTrack();

        if (!winnerCrossed) { 
            requestAnimationFrame(step);
        } else {
            finishRace(resultData);
        }
    }
    requestAnimationFrame(step);
}

function finishRace(data) {
    isRacing = false;
    
    playSound('whistle-end');

    if (data.user_won) {
        balance += (data.payout - data.bet_amount); 
        totalWins += data.payout;
        
        setTimeout(() => {
            playSound('win');
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: [getHex(data.winner), '#ffffff', '#FFD700']
            });
        }, 600);

    } else {
        balance -= data.bet_amount;
        totalLosses += data.bet_amount;

        setTimeout(() => {
            playSound('lose');
        }, 600);
    }

    updateStats();

    const msgDiv = document.getElementById('statusMsg');
    msgDiv.classList.remove('hidden');
    
    if (data.user_won) {
        msgDiv.className = "mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500 animate-bounce";
        msgDiv.innerHTML = `
            <div class="text-2xl">🎉 YOU WON!</div>
            <div class="text-green-400 font-bold text-xl">+$${data.payout.toFixed(2)}</div>
            <div class="text-sm text-gray-300">The <span style="color:${getHex(data.winner)}">${data.winner}</span> turtle won!</div>
        `;
    } else {
        msgDiv.className = "mt-4 p-4 rounded-lg bg-red-500/20 border border-red-500";
        msgDiv.innerHTML = `
            <div class="text-2xl">😢 YOU LOST</div>
            <div class="text-red-400 font-bold text-xl">-$${data.bet_amount.toFixed(2)}</div>
            <div class="text-sm text-gray-300">The <span style="color:${getHex(data.winner)}">${data.winner}</span> turtle won.</div>
        `;
    }
}

function getHex(name) {
    const t = TURTLE_DATA.find(t => t.name === name);
    return t ? t.hex : '#fff';
}

drawTrack();
updateStats();