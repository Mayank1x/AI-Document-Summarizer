from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai
from PyPDF2 import PdfReader
import docx
import psycopg2
from psycopg2.extras import RealDictCursor

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

# Create Flask app
app = Flask(__name__)
CORS(app)  # allow frontend to call backend

# Define upload folder
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    return conn

# Home route
@app.route("/")
def home():
    return jsonify({"message": "Backend is running 🚀"})

# Gemini test route
@app.route("/ask", methods=["POST"])
def ask_gemini():
    data = request.get_json()
    user_input = data.get("prompt", "")

    if not user_input:
        return jsonify({"error": "No prompt provided"}), 400

    # Call Gemini
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(user_input)

    return jsonify({"response": response.text})

# Upload & store file
@app.route("/summarize", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # Save the file temporarily
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Extract text based on file type
    text = ""
    if file.filename.endswith(".pdf"):
        reader = PdfReader(filepath)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    elif file.filename.endswith(".docx"):
        doc = docx.Document(filepath)
        for para in doc.paragraphs:
            text += para.text + "\n"
    elif file.filename.endswith(".txt"):
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        return jsonify({"error": "Unsupported file type"}), 400

    # ✅ Generate summary with Gemini
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(f"Summarize this document:\n\n{text[:3000]}")
    summary = response.text if response else "Summary not available"


    # ✅ Store in database (documents table)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO documents (filename, content, summary)
        VALUES (%s, %s, %s)
        RETURNING id;
        """,
        (file.filename, text, summary)
    )
    upload_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "message": "File uploaded, summarized, and stored successfully",
        "upload_id": upload_id,
        "preview_text": text[:500],
        "summary": summary
    })


# Get all uploaded files metadata
@app.route("/files", methods=["GET"])
def get_files():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, filename, uploaded_at FROM documents ORDER BY uploaded_at DESC;")
    files = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(files)

# Get specific file text
@app.route("/file/<int:file_id>", methods=["GET"])
def get_file(file_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, filename, content, summary, uploaded_at FROM documents WHERE id = %s;", (file_id,))
    file = cur.fetchone()
    cur.close()
    conn.close()

    if not file:
        return jsonify({"error": "File not found"}), 404

    return jsonify(file)

# Delete a specific document
@app.route("/file/<int:file_id>", methods=["DELETE"])
def delete_file(file_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # First get filename so we can delete the actual file too
    cur.execute("SELECT filename FROM documents WHERE id = %s;", (file_id,))
    result = cur.fetchone()

    if not result:
        cur.close()
        conn.close()
        return jsonify({"error": "File not found"}), 404

    filename = result[0]

    # Delete from DB
    cur.execute("DELETE FROM documents WHERE id = %s;", (file_id,))
    conn.commit()
    cur.close()
    conn.close()

    # Delete physical file if exists
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    return jsonify({"message": f"Document {file_id} deleted successfully"})

# Delete ALL documents
@app.route("/files", methods=["DELETE"])
def delete_all_files():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM documents;")
    conn.commit()
    cur.close()
    conn.close()

    # Clear uploads folder
    for f in os.listdir(UPLOAD_FOLDER):
        os.remove(os.path.join(UPLOAD_FOLDER, f))

    return jsonify({"message": "All documents deleted successfully"})

if __name__ == "__main__":
    app.run(debug=True)
