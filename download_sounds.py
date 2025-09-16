#!/usr/bin/env python3
"""
Script to download sound files from Myinstants.com
This script will download the trending German meme sounds
"""

import requests
import os
import time
from urllib.parse import urljoin

# Sound mappings based on Myinstants.com trending sounds
SOUND_MAPPINGS = {
    'ralf-schumacher': 'https://www.myinstants.com/media/sounds/ralf-schumacher-mitten-in-die-fresse.mp3',
    'was-geht-yallah': 'https://www.myinstants.com/media/sounds/was-geht-yallah.mp3',
    'vine-boom': 'https://www.myinstants.com/media/sounds/vine-boom-sound.mp3',
    'sven': 'https://www.myinstants.com/media/sounds/sven.mp3',
    'neggaz': 'https://www.myinstants.com/media/sounds/neggaz.mp3',
    'clash-royale': 'https://www.myinstants.com/media/sounds/clash-royale-hog-rida.mp3',
    'wecker-laut': 'https://www.myinstants.com/media/sounds/wecker-sehr-laut.mp3',
    'ching-cheng': 'https://www.myinstants.com/media/sounds/ching-cheng-hanji.mp3',
    'handy-ran': 'https://www.myinstants.com/media/sounds/geh-jetzt-an-dein-handy-ran.mp3',
    'fart': 'https://www.myinstants.com/media/sounds/fart.mp3',
    'backfisch': 'https://www.myinstants.com/media/sounds/backfisch-zarbex.mp3',
    'helmut': 'https://www.myinstants.com/media/sounds/helmut.mp3',
    'klingelton': 'https://www.myinstants.com/media/sounds/der-beste-klingelton-der-welt.mp3',
    'garmin': 'https://www.myinstants.com/media/sounds/ok-garmin-video-speichern.mp3',
    'halts-maul': 'https://www.myinstants.com/media/sounds/halts-maul.mp3',
    'rizz': 'https://www.myinstants.com/media/sounds/rizz-sound-effect.mp3',
    'among-us': 'https://www.myinstants.com/media/sounds/among-us-role-reveal-sound.mp3',
    'nebenrisiken': 'https://www.myinstants.com/media/sounds/zu-nebenrisiken-und-wirkungen.mp3',
    'max-kacken': 'https://www.myinstants.com/media/sounds/max-muss-kacken.mp3',
    'aura-farming': 'https://www.myinstants.com/media/sounds/aura-farming.mp3',
    'schnitzel': 'https://www.myinstants.com/media/sounds/ich-bin-ein-schnitzel.mp3',
    'fortnite': 'https://www.myinstants.com/media/sounds/fortnite-default-dance-bass-boost.mp3',
    'brainrot': 'https://www.myinstants.com/media/sounds/italian-brainrot-ringtone.mp3',
    'spongebob': 'https://www.myinstants.com/media/sounds/spongebob-fail.mp3',
    'apple-pay': 'https://www.myinstants.com/media/sounds/apple-pay.mp3',
    'katzenvieh': 'https://www.myinstants.com/media/sounds/schei-katzenvieh.mp3',
    'phone-ringing': 'https://www.myinstants.com/media/sounds/your-phone-is-ringing-pick-it-up-now.mp3',
    'verrueckter-vogel': 'https://www.myinstants.com/media/sounds/verrckter-vogel.mp3',
    'eiermann': 'https://www.myinstants.com/media/sounds/bing-bong-der-eiermann-ist-da.mp3',
    'jet2': 'https://www.myinstants.com/media/sounds/nothing-beats-a-jet2-holiday.mp3',
    'mortis': 'https://www.myinstants.com/media/sounds/ich-bin-mortis-eine-kreatur-der-nacht.mp3',
    'galaxy': 'https://www.myinstants.com/media/sounds/galaxy-meme.mp3',
    'clash-royale-deep': 'https://www.myinstants.com/media/sounds/he-he-he-ha-clash-royale-deep-fried.mp3',
    'neeeee': 'https://www.myinstants.com/media/sounds/neeeeeeeeeeeeeee.mp3',
    'ralf-willst-du': 'https://www.myinstants.com/media/sounds/ralf-schuhmacher-willst-du-wissen.mp3',
    'bruh': 'https://www.myinstants.com/media/sounds/bruh.mp3'
}

def download_sound(sound_name, url, sounds_dir):
    """Download a single sound file"""
    try:
        print(f"Downloading {sound_name}...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        file_path = os.path.join(sounds_dir, f"{sound_name}.mp3")
        with open(file_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Downloaded {sound_name}.mp3 ({len(response.content)} bytes)")
        return True
    except Exception as e:
        print(f"❌ Failed to download {sound_name}: {e}")
        return False

def main():
    sounds_dir = "sounds"
    os.makedirs(sounds_dir, exist_ok=True)
    
    print("🎵 Downloading meme sounds from Myinstants.com...")
    print(f"📁 Saving to: {sounds_dir}/")
    print("-" * 50)
    
    successful_downloads = 0
    total_downloads = len(SOUND_MAPPINGS)
    
    for sound_name, url in SOUND_MAPPINGS.items():
        if download_sound(sound_name, url, sounds_dir):
            successful_downloads += 1
        
        # Be respectful - add a small delay between downloads
        time.sleep(0.5)
    
    print("-" * 50)
    print(f"🎉 Download complete!")
    print(f"✅ Successfully downloaded: {successful_downloads}/{total_downloads} sounds")
    
    if successful_downloads < total_downloads:
        print("⚠️  Some downloads failed. You may need to manually download those sounds.")
        print("💡 Visit https://www.myinstants.com/en/index/de/ to get the missing sounds.")

if __name__ == "__main__":
    main()
