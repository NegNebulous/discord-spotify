from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        # self.wfile.write(bytes("recieved", "utf-8"))
        # self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
        # self.wfile.write(bytes("<body>", "utf-8"))
        # self.wfile.write(bytes("<p>This is an example web server.</p>", "utf-8"))
        # self.wfile.write(bytes("</body></html>", "utf-8"))
    def do_POST(self):

        # print(self.request)
        # print(self.responses)
        # print(self.command)
        # self.rfile.read(int(self.headers['Content-Length']))
        req = str(self.rfile.read(int(self.headers['Content-Length'])))
        print(f'{req=}')
        req = json.loads(('{' + req.split('{')[1].split('}')[0] + '}'))

        play(req["name"], req["state"], req["time"])

        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        # self.wfile.write(bytes("recieved", "utf-8"))
        # self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
        # self.wfile.write(bytes("<body>", "utf-8"))
        # self.wfile.write(bytes("<p>This is an example web server.</p>", "utf-8"))
        # self.wfile.write(bytes("</body></html>", "utf-8"))

import random, time, os
import subprocess
# import pygame
# from playsound import playsound
from pytube import YouTube
from pygame import mixer
import urllib.request, re, urllib.parse
from copypaste import cleanFilename
# from pathlib import Path

# print(os.getcwd())
path_down = os.path.join(os.getcwd(), 'player\download')
path_song = os.path.join(os.getcwd(), 'player\songs')
ftype = 'mp3'
# print(path_down)
# print(path_song)

# .replace("'", '').replace(';','').replace('"','').replace('(','').replace(')','').replace('.','').replace('&','').replace('@','')
songName = lambda song, artist : f'{song} - {artist}'

def getSong(song, artist, down, final, timeStart=time.time()) -> str:
    """Takes in song, artist, down, and convert path, returns path to song. 
       Downloads song if it doesnt already exists
    """

    # last = time.time()
    last = timeStart

    finalPath = os.path.join(final, f'{cleanFilename(songName(song, artist))}.{ftype}')
    print(finalPath)
    if os.path.exists(finalPath):
        delay = time.time() - last
        print(f'Got song in {delay} seconds')
        # print(f'2Got song in {time.time() - timeStart} seconds')
        return finalPath, delay
    
    # .replace(' ', '+').replace("'", '').replace(';','').replace('"','').replace('(','').replace(')','').replace('.','').replace('&','').replace('@','')
    search = f'{song} by {artist}'
    print(f'{search=}')
    # search = songName(song, artist)
    url = f"https://www.youtube.com/results?{urllib.parse.urlencode({'search_query': search})}"
    html = urllib.request.urlopen(url)
    print(url)
    video_ids = re.findall(r"watch\?v=(\S{11})", html.read().decode())
    song_url = f"https://www.youtube.com/watch?v={video_ids[0]}"

    print(song_url)

    stream = YouTube(song_url).streams.get_audio_only()
    fname = f'{cleanFilename(songName(song, artist))}.{stream.default_filename.split(".")[-1]}'
    
    stream.download(output_path=down, filename=fname)

    # -ab 128k -ac 2 -ar 44100
    command = f'ffmpeg -hide_banner -loglevel error -i "{os.path.join(down, fname)}" -vn -ac 2 -ab 128k "{finalPath}"'
    subprocess.call(command, shell=True)

    delay = time.time() - last

    print(f'Got song in {delay} seconds')
    # print(f'2Got song in {time.time() - timeStart} seconds')

    return finalPath, delay

def play(song, artist, timeStart):

    song_dir, delay = getSong(song, artist, path_down, path_song, timeStart=timeStart)

    mixer.quit()
    mixer.init()

    # mixer.Sound()
    mixer.music.load(song_dir)
    if delay>0:
        mixer.music.play(start=delay)
    else:
        mixer.music.play()
    mixer.music.set_volume(0.085)
    # try:
    #     mixer.music.set_pos(delay)
    #     mixer.music.play()
    #     print(f'Skipped {delay} seconds ahead')
    # except:
    #     pass

    print('\n' + '-'*25)

def main():
    # hostName = "127.0.0.42"
    # serverPort = 3000
    # userId = 0
    hostName = None
    serverPort = None
    userId = None

    # load settings
    with open(os.path.join(os.getcwd(), 'settings.txt'), 'r') as f:
        lines = f.readlines()
        for l in lines:
            l = l.replace('\n','')
            
            args = l.split('=')
            if args[0] == 'address':
                hostName = str(args[1])
            elif args[0] == 'port':
                serverPort = int(args[1])
            elif args[0] == 'discord_id':
                userId = args[1]

    # remove files in download folder
    for f in os.listdir(path_down):
        try:
            os.remove(os.path.join(path_down, f))
        except:
            pass

    # start server
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")

if __name__ == "__main__":
    main()