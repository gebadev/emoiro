# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Emoiro - Claude Code Development Guide

## Application Overview

Emoiro (エモイロ) is a Japanese emotion tracking web application that allows users to record daily emotions and visualize them through beautiful color palettes and charts. The name combines "emotion" and "iro" (色, meaning color in Japanese). It's designed as a local-first application that runs entirely offline, prioritizing user privacy by keeping all emotional data on the user's device.

**Core Purpose**: Help users track and reflect on their emotional patterns through intuitive color-based visualization and analytics.

## Technology Stack

### Backend
- **Python 3.7+** with **Flask 2.3.3** web framework
- **SQLite** database (file: `emoiro.db`) for local data persistence
- **Werkzeug 2.3.7** for WSGI utilities

### Frontend
- **HTML5** with Jinja2 templating
- **CSS3** with CSS custom properties (CSS variables) for theming
- **Vanilla JavaScript (ES6+)** for interactivity
- **Chart.js** (loaded via CDN) for data visualization
- **Noto Sans JP** Google Fonts for Japanese typography

### Development Environment
- **Virtual environment** (`emoiro_env/`) for Python dependency isolation
- No build tools or package managers for frontend (vanilla approach)

## Architecture and Key Components

### Application Structure
```
emoiro/
├── app.py                 # Main Flask application (223 lines)
├── emoiro.db             # SQLite database (auto-created)
├── emoiro_env/           # Python virtual environment
├── requirements.txt      # Python dependencies (Flask, Werkzeug)
├── templates/            # Jinja2 HTML templates
│   ├── base.html         # Base template with nav and layout
│   ├── index.html        # Dashboard/home page
│   ├── record.html       # Emotion recording form
│   └── history.html      # History with calendar, timeline, analytics
├── static/               # Static assets
│   ├── style.css         # Main CSS with CSS variables
│   └── script.js         # Client-side JavaScript
├── LICENSE               # MIT License
└── README.md            # Comprehensive Japanese documentation
```

### Core Flask Routes
- `GET /` - Dashboard with recent entries and monthly emotion palette
- `GET/POST /record` - Emotion recording form (supports updating existing entries)
- `GET /history` - Multi-tab history view (calendar, timeline, analytics)
- `GET /api/calendar-data` - JSON API for calendar visualization
- `GET /delete/<date>` - Delete emotion entry

### Emotion System
The application defines 7 core emotions in the `EMOTIONS` dictionary:
```python
EMOTIONS = {
    'joy': {'name': '喜び', 'color': '#FFD700', 'icon': '😊'},      # Gold
    'anger': {'name': '怒り', 'color': '#FF4444', 'icon': '😠'},    # Red
    'sadness': {'name': '悲しみ', 'color': '#4A90E2', 'icon': '😢'}, # Blue
    'calm': {'name': '穏やか', 'color': '#90EE90', 'icon': '😌'},    # Light Green
    'excitement': {'name': '興奮', 'color': '#FF6B35', 'icon': '🤩'}, # Orange
    'anxiety': {'name': '不安', 'color': '#9B59B6', 'icon': '😰'},   # Purple
    'love': {'name': '愛情', 'color': '#FF1744', 'icon': '😍'}      # Pink/Red
}
```

## Database Structure

### `emotions` Table Schema
```sql
CREATE TABLE emotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,           -- YYYY-MM-DD format
    emotion_type TEXT NOT NULL,          -- Key from EMOTIONS dict
    note TEXT,                          -- Optional user note
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Constraints**:
- `date` field has UNIQUE constraint (one emotion per day)
- `emotion_type` must be valid key from EMOTIONS dictionary
- Updates to existing dates are handled via UPDATE queries

## Development Commands

### Setup and Activation
```bash
# Create and activate virtual environment
python -m venv emoiro_env
source emoiro_env/bin/activate    # Linux/macOS
# emoiro_env\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run application
python app.py
```

### Database Operations
- Database auto-initializes on first run via `init_db()`
- No migrations system - schema changes require manual handling
- SQLite file can be directly backed up: `cp emoiro.db backup_$(date +%Y%m%d).db`

### Development Server
- Runs on `http://localhost:5000` with `debug=True`
- Hot reloading enabled for development
- Accessible on all network interfaces (`host='0.0.0.0'`)

## Important Files and Their Roles

### `/home/user/work/emoiro/app.py` (Core Application)
- **Main Flask application**: All routes, database operations, emotion logic
- **Critical functions**:
  - `init_db()`: Database initialization
  - `get_db_connection()`: Database connection with Row factory
  - `EMOTIONS` dictionary: Single source of truth for emotion definitions
- **Security**: Uses parameterized queries to prevent SQL injection
- **Data handling**: Converts SQLite Row objects to dictionaries for JSON serialization

### `/home/user/work/emoiro/templates/base.html` (Layout Template)
- Defines consistent navigation structure
- Loads Google Fonts (Noto Sans JP) for Japanese text rendering
- Includes global CSS and JavaScript
- Japanese language meta tags (`lang="ja"`)

### `/home/user/work/emoiro/static/style.css` (Styling System)
- **CSS Custom Properties** for consistent theming:
  ```css
  :root {
      --primary-color: #6C63FF;    /* Main brand color */
      --secondary-color: #4ECDC4;  /* Secondary brand color */
      --background: #F7FAFC;       /* Main background */
      --border-radius: 12px;       /* Consistent border radius */
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  ```
- Responsive design with mobile-first approach
- Beautiful gradient backgrounds and card-based layouts

### `/home/user/work/emoiro/static/script.js` (Client Interactions)
- Page-specific initialization functions
- Smooth animations and interactive effects
- Calendar functionality and Chart.js integration
- Keyboard shortcuts support (Ctrl+N, Ctrl+H, Esc)

### `/home/user/work/emoiro/templates/history.html` (Analytics Page)
- Three-tab interface: Calendar, Timeline, Analytics
- Chart.js integration for data visualization
- Calendar grid generation with emotion color coding
- Monthly statistics aggregation

## Special Configuration and Setup Requirements

### Japanese Language Support
- All UI text is in Japanese
- Uses Noto Sans JP font for proper Japanese character rendering
- HTML lang attribute set to "ja"
- UTF-8 encoding throughout application

### Color System Integration
- Emotions are tightly coupled with specific hex colors
- Colors used for visual consistency across calendar, charts, and palette displays
- Emotion colors are defined once in Python and referenced in templates

### Local-First Architecture
- No external API dependencies (except Google Fonts and Chart.js CDN)
- SQLite database ensures data remains local
- No user authentication system (single-user application model)
- Designed to run entirely offline once assets are cached

### Data Visualization Features
- **Emotion Palette**: Monthly overview showing colored squares for each recorded emotion
- **Calendar View**: Month-by-month calendar with dates colored by recorded emotions
- **Timeline**: Chronological list of all entries with edit/delete capabilities
- **Analytics**: Chart.js donut charts and line graphs for emotion trends

## Development Best Practices for This Codebase

### Working with Emotions
- Always validate `emotion_type` against the `EMOTIONS` dictionary keys
- When adding new emotions, update both the Python dictionary and any related CSS/JavaScript
- Color values should be valid hex codes for consistency

### Database Operations
- Use the `get_db_connection()` helper for consistent Row factory setup
- Always close database connections with `conn.close()`
- Remember that dates use UNIQUE constraint - handle UPDATE vs INSERT appropriately

### Frontend Development
- CSS custom properties are extensively used - modify `:root` variables for theme changes
- JavaScript is organized by page-specific initialization functions
- Chart.js is loaded via CDN - ensure internet connectivity for initial load

### Template Development
- Jinja2 templates rely heavily on the `emotions` dictionary passed from Flask
- Base template handles navigation and consistent layout
- Use `url_for()` for all internal links to maintain Flask routing consistency

This codebase prioritizes simplicity, privacy, and beautiful user experience over complex architecture. The emotion tracking domain is well-encapsulated, making it straightforward to extend or modify emotion categories and visualization methods.