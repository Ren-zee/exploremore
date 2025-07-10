from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from better_profanity import profanity

app = Flask(__name__)

# Configure MySQL connection
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'yourpassword'  # <-- change this
app.config['MYSQL_DB'] = 'yourdbname'          # <-- change this

mysql = MySQL(app)

# Load profanity filter
profanity.load_censor_words()

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    data = request.get_json()
    user_id = data.get('user_id')
    original_text = data.get('feedback')
    filtered_text = profanity.censor(original_text)

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO feedback (user_id, feedback, filtered_feedback, is_verified)
        VALUES (%s, %s, %s, %s)
    """, (user_id, original_text, filtered_text, False))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Feedback submitted and filtered'})

# You can add more routes here, like get_feedback, admin_review, etc.

if __name__ == '__main__':
    app.run(debug=True)
