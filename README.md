# RX Judge System - Live Tabulation System

A real-time judging and scoring system for the **RX Thanksgiving Retro Party** events:
- **Retro Dance Contest** (RX Dance Troupe)
- **Retro Outfit Competition** (RX Grand Mentors)

## Features

- **Real-time Score Updates** - Scores update instantly across all connected devices
- **Admin Panel** - Manage events, contestants, and control live display
- **Score Entry** - Dedicated interface for encoders to input judge scores
- **Live Display** - Projector-ready view for audience with rankings
- **4 Judges Support** - Each judge's score is tracked separately
- **Automatic Ranking** - Grand totals and rankings calculated automatically
- **Reveal Control** - Option to reveal Top 2, Top 3, Top 5, or all rankings

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Express.js + MongoDB + Socket.IO
- **Database**: MongoDB Atlas

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (connection string already configured)

### Installation

1. **Install Frontend Dependencies**
   ```bash
   cd rx_judge_system
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment**
   
   Create `server/.env` file with:
   ```
   MONGODB_URI=mongodb+srv://fanrx:rxjudge123@cluster102.pilzy.mongodb.net/?appName=Cluster102
   PORT=5000
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:5000

2. **Start the Frontend (in a new terminal)**
   ```bash
   cd rx_judge_system
   npm run dev
   ```
   Frontend will run on http://localhost:5173

### First Time Setup

1. Open http://localhost:5173
2. Go to **Admin Panel**
3. Click **"Initialize Default Events"** to create the two events with default contestants

## Usage Guide

### Event Day Flow

1. **Pre-Event**
   - Admin initializes events and contestants
   - Verify all contestants are listed correctly

2. **During Event**
   - Judges score contestants on paper
   - Judges submit TOTAL SCORES to marshal
   - Marshal forwards totals to encoder
   - Encoder inputs scores via **Score Entry** page

3. **Live Display**
   - Open **Live Display** on projector
   - Admin controls when to show rankings
   - Use "Reveal Top" to create suspense

### Pages

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Main navigation |
| Admin Panel | `/admin` | Manage events, contestants, controls |
| Score Entry | `/score-entry` | Input judge scores |
| Live Display | `/live` | Projector view for audience |

### Admin Controls

- **Go Live / Stop Live** - Toggle live status for event
- **Show/Hide Rankings** - Control ranking visibility
- **Reveal Top N** - Show only top 2, 3, 5, or all
- **Clear Scores** - Reset all scores for an event

## Events & Criteria

### Retro Dance Contest
| Criteria | Percentage |
|----------|------------|
| Retro Outfit Style | 30% |
| Dance Performance | 40% |
| Audience Impact | 20% |
| Overall Presentation | 10% |

### Retro Outfit Competition
| Criteria | Percentage |
|----------|------------|
| Retro Theme Accuracy | 50% |
| Creativity & Originality | 30% |
| Overall Impact | 20% |

## Default Contestants

### Dance Contest (RX Dance Troupe)
1. HAPPY FEET MOVERS
2. B.E DANCERS
3. SNEAKER RIDERS
4. D GOLDEN STEPS REVOLUTION
5. THE VINTAGE VIBES

### Outfit Competition (RX Grand Mentors)
1. BLACK EAGLES
2. ELITE FALCONS
3. WOLFGANG
4. BLACK PANTHERS
5. DOMINATORS

## Announcement Protocol

1. Announce Retro Outfit Top 2 (Queen & King Winners)
2. Announce Retro Dance Top 5 – Top 2 Winners
3. Announce Grand Champion (highest score)
4. Awarding and photo opportunity

---

**RX Thanksgiving Retro Party 2024** - *Groove Back in Time*
