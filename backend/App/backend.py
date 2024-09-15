import mysql.connector
from flask import Flask, jsonify, redirect, request
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv
import time
import sys

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/")
def landing_page():
    return "<p>Welcome Noob</p>"

db_config = {
    'host': os.getenv('HOST'),
    'user': 'root',
    'password': os.getenv('PWD'),
    'database': os.getenv('DB')
}

try:
    connection = mysql.connector.connect(**db_config)
    print("connect successfull")
except mysql.connector.Error as e:
    print("failed to connect")    


def execute_qry(sql_cmd, params):
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(sql_cmd, params)
        if sql_cmd.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
            connection.commit()
            print("Changes committed to the database.")
            return cursor.lastrowid if cursor.lastrowid else None
        else:
            result = cursor.fetchall()
            return result
    except mysql.connector.Error as e:
        connection.rollback()  
        print(f"Error executing query: {e}")
    finally:
        cursor.close()


def insert_into_table(table_name, column1, column2, value1, value2):
    sql_cmd = f"INSERT INTO {table_name} ({column1}, {column2}) VALUES (%s, %s);"
    execute_qry(sql_cmd, (value1, value2))
    print("Insert Success")


def qry_table(table_name):
    sql_cmd = f"SELECT * FROM {table_name};"
    results = execute_qry(sql_cmd, ())  
    for result in results:
        print(result)

def truncate_table(table_name):
    sql_cmd = f"TRUNCATE TABLE {table_name};"
    execute_qry(sql_cmd, ())
    print(f"Table {table_name} has been DELETED!!.")

def get_song_by_id(song_id):
    sql_cmd = "SELECT * FROM spotify WHERE id = %s;"
    results = execute_qry(sql_cmd, (song_id,))
    return results[0] if results else None

# Use to get songs by a song id (or PK to be set up at later time)
@app.route('/songs/<int:song_id>', methods=['GET'])
def song(song_id):
    song_data = get_song_by_id(song_id)
    if song_data:
        return jsonify(song_data)  
    else:
        return jsonify({'error': 'Song not found'}), 404
    

def get_all_songs():
    sql_cmd = "SELECT * FROM spotify;"
    results = execute_qry(sql_cmd, ())
    return results if results else None

# Use to get all songs 
@app.route('/songs', methods=['GET'])
def all_songs():
    songs_data = get_all_songs()
    if songs_data:
        return jsonify(songs_data)
    else:
        return jsonify({'error': 'No songs found'}), 404

def get_song_features(id):
    sql_cmd = f"SELECT * FROM spotify WHERE id = '{id}';"
    return execute_qry(sql_cmd, ())

# -------------------SPOTIFY------------------------------- #

SCOPES = 'playlist-read-private playlist-read-collaborative'

# client <-> server auth for spotify to retrieve bearer
@app.route('/login')
def login():
    client_id = os.getenv('CLIENT_ID')
    redirect_uri = os.getenv('REDIRECT_URI')
    
    auth_url = (
        f"https://accounts.spotify.com/authorize?"
        f"client_id={client_id}&response_type=code&redirect_uri={redirect_uri}&scope={SCOPES}"
    )
    
    return redirect(auth_url)

# redirect login to endpoint: /audio_feature of song features
@app.route('/callback')
def callback():
    code = request.args.get('code')
    access_token = get_access_token(code)
    
    if access_token:
        return redirect(f'/audio_features?access_token={access_token}')
    else:
        return "Failed to retrieve access token", 400

def get_access_token(code):
    url = "https://accounts.spotify.com/api/token"
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': os.getenv('REDIRECT_URI'),
        'client_id': os.getenv('CLIENT_ID'),
        'client_secret': os.getenv('CLIENT_SECRET')
    }
    
    response = requests.post(url, data=data)
    
    if response.status_code == 200:
        return response.json().get('access_token')
    else:
        print(f"Failed to get access token: {response.status_code}")
        print(response.text)
        return None

# fetch spotify api for specific playlist <song ids, song name>
def get_playlist_details(access_token):
    url = "https://api.spotify.com/v1/playlists/5IxmFCOrcUEpV7LH1okaQy"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        playlist_data = response.json()  
        
        track_items = playlist_data['tracks']['items']
        track_info = {item['track']['id']: item['track']['name'] for item in track_items}  
        
        return track_info  
    else:
        print(f"Failed to fetch playlist details: {response.status_code}")
        print(response.text)
        return None

# use spotify api based on song id to get audio features
def get_audio_features_for_track(access_token, track_id):
    url = f"https://api.spotify.com/v1/audio-features/{track_id}"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()  
    else:
        print(f"Failed to fetch audio features for track {track_id}: {response.status_code}")
        print(response.text)
        return None

# return json blob of audio feature + song name to not lose any info bbbb    
# insert to sql table bbbbb
@app.route('/audio_features', methods=['GET'])
def fetch_audio_features():
    access_token = request.args.get('access_token')  
    
    track_info = get_playlist_details(access_token) 
    
    if not track_info:
        return jsonify({'error': 'Failed to fetch playlist details'}), 400
    
    for track_id, track_name in track_info.items():
        audio_features = get_audio_features_for_track(access_token, track_id)
        if audio_features:
            print(f"Inserting data for {track_name} (ID: {track_id})")
            print(audio_features)
            insert_into_spotify_table(track_id, track_name, audio_features)
    
    return jsonify({'message': 'Data inserted into the database'})


def insert_into_spotify_table(track_id, name, audio_features):
    values = (
        track_id,
        name,
        audio_features['acousticness'],
        audio_features['analysis_url'],
        audio_features['danceability'],
        audio_features['duration_ms'],
        audio_features['energy'],
        audio_features['instrumentalness'],
        audio_features['key'],
        audio_features['liveness'],
        audio_features['loudness'],
        audio_features['mode'],
        audio_features['speechiness'],
        audio_features['tempo'],
        audio_features['time_signature'],
        audio_features['track_href'],
        audio_features['uri'],
        audio_features['valence']
    )

    sql_cmd = """
    INSERT INTO spotify 
    (id, name, acousticness, analysis_url, danceability, duration_ms, energy, instrumentalness, track_key, liveness, loudness, mode, speechiness, tempo, time_signature, track_href, uri, valence)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
    name = VALUES(name), 
    acousticness = VALUES(acousticness), 
    analysis_url = VALUES(analysis_url), 
    danceability = VALUES(danceability), 
    duration_ms = VALUES(duration_ms),
    energy = VALUES(energy), 
    instrumentalness = VALUES(instrumentalness), 
    track_key = VALUES(track_key), 
    liveness = VALUES(liveness), 
    loudness = VALUES(loudness), 
    mode = VALUES(mode), 
    speechiness = VALUES(speechiness), 
    tempo = VALUES(tempo), 
    time_signature = VALUES(time_signature), 
    track_href = VALUES(track_href), 
    uri = VALUES(uri), 
    valence = VALUES(valence)
    """
    
    execute_qry(sql_cmd, values)
    print(f"Inserted or updated track {track_id} - {name}")

# ----------------- OpenAI ----------------------- #

# feed OpenAI a pre-prompt to get a response prompt to send to suno 
# idea is OpenAI will interpret song audio features and label an emotion to it
# alt prompt - "Label this song with 3 moods in only 3 words based on the parameters"
# we want to be as specific as possible to feed this prompt to suno
def generate_prompt_from_openai(song_id):
    song_data = get_song_features(song_id)[0]
    song_description = f"suggest the mood this song makes you feel in under 10 words {song_id} and data: Title - {song_data['name']}, acousticness - {song_data['acousticness']}, danceability - {song_data['danceability']}, energy - {song_data['energy']}, liveness - {song_data['liveness']}, loudness - {song_data['loudness']}, temp - {song_data['tempo']}."
    
    headers = {
        'Authorization': f"Bearer {os.getenv('OPENAI_API_KEY')}",
        'Content-Type': 'application/json',
    }

    data = {
        "model": "gpt-3.5-turbo",  
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": song_description}
        ]
    }

    response = requests.post('https://api.openai.com/v1/chat/completions', headers=headers, json=data)
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content'].strip()
    else:
        print(f"Failed to generate prompt from OpenAI: {response.status_code}")
        print(f"Response: {response.text}")  
        return None

    
@app.route('/generate_prompt/<song_id>', methods=['GET'])
def generate_prompt(song_id):
    song_data = get_song_by_id(song_id)
    if song_data:
        prompt = generate_prompt_from_openai(song_id)
        if prompt:
            return jsonify({'prompt': prompt})
        else:
            return jsonify({'error': 'Failed to generate prompt'}), 500
    else:
        return jsonify({'error': 'Song not found'}), 404


# ------------ SUNO API BABY ------------------ #

# generate song request based on openAI prompt.. check prompt log for gpt prompt
def generate_song_from_suno(topic, tags):
    url = 'https://studio-api.suno.ai/api/external/generate/'
    headers = {
        'Authorization': f'Bearer {os.getenv("SUNO_API_KEY")}',
        'Content-Type': 'application/json',
    }
    data = {"topic": topic, "tags": tags}
    
    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to generate song: {response.status_code} {response.text}")
        return None

# suno is async so need to get the mp3
@app.route('/generate_song_from_prompt/<song_id>', methods=['GET'])
def generate_song_from_prompt(song_id):
    song_data = get_song_by_id(song_id)
    if song_data:
        prompt = generate_prompt_from_openai(song_id)
        if prompt:
            tags = song_data.get('genre', 'pop')  
            result = generate_song_from_suno(prompt, tags)
            if result and result.get('status') == 'submitted':
                task_id = result.get('id')
                return jsonify({'message': 'Song generation in progress', 'task_id': task_id})
            else:
                return jsonify({'error': 'Failed to generate song'}), 500
        else:
            return jsonify({'error': 'Failed to generate prompt'}), 500
    else:
        return jsonify({'error': 'Song not found'}), 404


# retrieve song id (need to call the generate_song_prompt first) and then call this && pass the id
def retrieve_url(song_id):
    url = f'https://studio-api.suno.ai/api/external/clips/?ids={song_id}'
    headers = {
        'Authorization': f'Bearer {os.getenv("SUNO_API_KEY")}',
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        res = response.json()[0]
        audio_url = res.get("audio_url", "null")
        if "http" in audio_url:
            return audio_url
    else:
        print(f"Failed to retrieve url: {response.status_code} {response.text}")
        return None

@app.route('/retrieve_url/<song_id>', methods=['GET'])
def get_url(song_id):
    song_details = retrieve_url(song_id)
    if song_details:
        audio_url = song_details[0].get('audio_url') if len(song_details) > 0 else None
        if audio_url:
            return jsonify({'audio_url': audio_url})
        else:
            return jsonify({'error': 'Audio URL not found'}), 404
    else:
        return jsonify({'error': 'Failed to retrieve song'}), 500


@app.route("/get_next_song", methods=["GET"])
def get_next_song():
    emotion = request.args.get('emotion')
    prev_song_id = request.args.get('prev_song_id')
    prompt = generate_prompt_from_openai(prev_song_id)
    song_data = get_song_features(prev_song_id)[0]
    res = generate_song_from_suno(prompt + f" and also like {emotion}", song_data.get('genre', 'pop'))
    task_id = res.get("id", "null")
    audio_url = retrieve_url(task_id)
    max_timeout_count = 10
    while not audio_url:
        time.sleep(10)
        audio_url = retrieve_url(task_id)
        max_timeout_count -= 1
        print(max_timeout_count)

        if max_timeout_count <= 0:
            return jsonify({"error": "timeout"})        
    return jsonify({"audio_url": audio_url})

if __name__ == "__main__":
    app.run( port=5001)