from flask import Flask, render_template, request, redirect, url_for, jsonify
import sqlite3
import datetime
import os

app = Flask(__name__)

# Emotion categories with colors and icons
EMOTIONS = {
    'joy': {'name': '喜び', 'color': '#FFD700', 'icon': '😊'},
    'anger': {'name': '怒り', 'color': '#FF4444', 'icon': '😠'},
    'sadness': {'name': '悲しみ', 'color': '#4A90E2', 'icon': '😢'},
    'calm': {'name': '穏やか', 'color': '#90EE90', 'icon': '😌'},
    'excitement': {'name': '興奮', 'color': '#FF6B35', 'icon': '🤩'},
    'anxiety': {'name': '不安', 'color': '#9B59B6', 'icon': '😰'},
    'love': {'name': '愛情', 'color': '#FF1744', 'icon': '😍'}
}

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect('emoiro.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS emotions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            emotion_type TEXT NOT NULL,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect('emoiro.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Main page - dashboard with recent entries and quick stats"""
    conn = get_db_connection()
    
    # Get recent entries (last 7 days)
    recent_entries_raw = conn.execute('''
        SELECT date, emotion_type, note 
        FROM emotions 
        ORDER BY date DESC 
        LIMIT 7
    ''').fetchall()
    
    # Convert Row objects to dictionaries
    recent_entries = []
    for entry in recent_entries_raw:
        recent_entries.append({
            'date': entry['date'],
            'emotion_type': entry['emotion_type'],
            'note': entry['note']
        })
    
    # Get emotion count for current month
    current_month = datetime.datetime.now().strftime('%Y-%m')
    emotion_stats_raw = conn.execute('''
        SELECT emotion_type, COUNT(*) as count
        FROM emotions 
        WHERE date LIKE ?
        GROUP BY emotion_type
    ''', (current_month + '%',)).fetchall()
    
    # Convert Row objects to dictionaries
    emotion_stats = []
    for stat in emotion_stats_raw:
        emotion_stats.append({
            'emotion_type': stat['emotion_type'],
            'count': stat['count']
        })
    
    conn.close()
    
    return render_template('index.html', 
                         recent_entries=recent_entries,
                         emotion_stats=emotion_stats,
                         emotions=EMOTIONS)

@app.route('/record', methods=['GET', 'POST'])
def record():
    """Record emotion for a specific date"""
    if request.method == 'POST':
        date = request.form['date']
        emotion_type = request.form['emotion_type']
        note = request.form.get('note', '')
        
        if emotion_type not in EMOTIONS:
            return redirect(url_for('record'))
        
        conn = get_db_connection()
        
        # Check if entry already exists for this date
        existing = conn.execute('SELECT id FROM emotions WHERE date = ?', (date,)).fetchone()
        
        if existing:
            # Update existing entry
            conn.execute('''
                UPDATE emotions 
                SET emotion_type = ?, note = ?, created_at = CURRENT_TIMESTAMP
                WHERE date = ?
            ''', (emotion_type, note, date))
        else:
            # Create new entry
            conn.execute('''
                INSERT INTO emotions (date, emotion_type, note)
                VALUES (?, ?, ?)
            ''', (date, emotion_type, note))
        
        conn.commit()
        conn.close()
        
        # Redirect to home page to show updated emotion palette
        return redirect(url_for('index'))
    
    # GET request - show record form
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    
    # Check if there's already an entry for today
    conn = get_db_connection()
    existing_entry = conn.execute(
        'SELECT emotion_type, note FROM emotions WHERE date = ?', 
        (today,)
    ).fetchone()
    conn.close()
    
    return render_template('record.html', 
                         emotions=EMOTIONS,
                         today=today,
                         existing_entry=existing_entry)

@app.route('/history')
def history():
    """View emotion history with calendar and charts"""
    conn = get_db_connection()
    
    # Get all entries and convert to dict for JSON serialization
    entries_raw = conn.execute('''
        SELECT date, emotion_type, note
        FROM emotions
        ORDER BY date DESC
    ''').fetchall()
    
    # Convert Row objects to dictionaries
    entries = []
    for entry in entries_raw:
        entries.append({
            'date': entry['date'],
            'emotion_type': entry['emotion_type'],
            'note': entry['note']
        })
    
    # Get monthly stats for the last 6 months
    monthly_stats = []
    for i in range(6):
        month_date = datetime.datetime.now() - datetime.timedelta(days=30*i)
        month_str = month_date.strftime('%Y-%m')
        
        stats_raw = conn.execute('''
            SELECT emotion_type, COUNT(*) as count
            FROM emotions 
            WHERE date LIKE ?
            GROUP BY emotion_type
        ''', (month_str + '%',)).fetchall()
        
        if stats_raw:
            # Convert Row objects to dict
            stats_dict = {}
            for stat in stats_raw:
                stats_dict[stat['emotion_type']] = stat['count']
            
            monthly_stats.append({
                'month': month_str,
                'stats': stats_dict
            })
    
    conn.close()
    
    return render_template('history.html',
                         entries=entries,
                         monthly_stats=monthly_stats,
                         emotions=EMOTIONS)

@app.route('/api/calendar-data')
def calendar_data():
    """API endpoint for calendar data"""
    conn = get_db_connection()
    entries_raw = conn.execute('''
        SELECT date, emotion_type
        FROM emotions
        ORDER BY date
    ''').fetchall()
    conn.close()
    
    calendar_data_dict = {}
    for entry in entries_raw:
        calendar_data_dict[entry['date']] = {
            'emotion': entry['emotion_type'],
            'color': EMOTIONS[entry['emotion_type']]['color']
        }
    
    return jsonify(calendar_data_dict)

@app.route('/delete/<date>')
def delete_entry(date):
    """Delete an emotion entry"""
    conn = get_db_connection()
    conn.execute('DELETE FROM emotions WHERE date = ?', (date,))
    conn.commit()
    conn.close()
    
    return redirect(url_for('history'))

if __name__ == '__main__':
    # Initialize database on startup
    init_db()
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)