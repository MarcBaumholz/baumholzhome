#!/usr/bin/env python3
"""
Script to download missing sound files from Myinstants.com
This script will download the specific sounds that are not working
"""

import requests
import os
import time
from urllib.parse import urljoin

# Sound mappings for the missing/problematic sounds
MISSING_SOUNDS = {
    'fortnite': 'https://www.myinstants.com/media/sounds/fortnite-default-dance-bass-boost.mp3',
    'verrueckter-vogel': 'https://www.myinstants.com/media/sounds/verrckter-vogel.mp3',
    'neeeee': 'https://www.myinstants.com/media/sounds/neeeeeeeeeeeeeee.mp3',
    'katzenvieh': 'https://www.myinstants.com/media/sounds/schei-katzenvieh.mp3'
}

# Alternative URLs to try if the first ones fail
ALTERNATIVE_URLS = {
    'fortnite': [
        'https://www.myinstants.com/media/sounds/fortnite-default-dance.mp3',
        'https://www.myinstants.com/media/sounds/fortnite-dance.mp3'
    ],
    'verrueckter-vogel': [
        'https://www.myinstants.com/media/sounds/verrckter-vogel.mp3',
        'https://www.myinstants.com/media/sounds/verrckter-vogel-1.mp3'
    ],
    'neeeee': [
        'https://www.myinstants.com/media/sounds/neeeeeeeeeeeeeee.mp3',
        'https://www.myinstants.com/media/sounds/neeeee.mp3'
    ],
    'katzenvieh': [
        'https://www.myinstants.com/media/sounds/schei-katzenvieh.mp3',
        'https://www.myinstants.com/media/sounds/schei-katzenvieh-1.mp3'
    ]
}

def download_sound(sound_name, urls_to_try, sounds_dir):
    """Download a single sound file, trying multiple URLs"""
    for i, url in enumerate(urls_to_try):
        try:
            print(f"Trying to download {sound_name} from URL {i+1}...")
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # Check if we got actual audio content
            if len(response.content) < 1000:  # Less than 1KB is probably not a real audio file
                print(f"❌ URL {i+1} returned too small file ({len(response.content)} bytes)")
                continue
            
            file_path = os.path.join(sounds_dir, f"{sound_name}.mp3")
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Downloaded {sound_name}.mp3 ({len(response.content)} bytes)")
            return True
        except Exception as e:
            print(f"❌ Failed to download {sound_name} from URL {i+1}: {e}")
            continue
    
    print(f"❌ All URLs failed for {sound_name}")
    return False

def main():
    sounds_dir = "sounds"
    os.makedirs(sounds_dir, exist_ok=True)
    
    print("🎵 Downloading missing meme sounds from Myinstants.com...")
    print(f"📁 Saving to: {sounds_dir}/")
    print("-" * 50)
    
    successful_downloads = 0
    total_downloads = len(MISSING_SOUNDS)
    
    for sound_name in MISSING_SOUNDS:
        # Try the primary URL first, then alternatives
        urls_to_try = [MISSING_SOUNDS[sound_name]] + ALTERNATIVE_URLS.get(sound_name, [])
        
        if download_sound(sound_name, urls_to_try, sounds_dir):
            successful_downloads += 1
        
        # Be respectful - add a small delay between downloads
        time.sleep(1)
    
    print("-" * 50)
    print(f"🎉 Download complete!")
    print(f"✅ Successfully downloaded: {successful_downloads}/{total_downloads} sounds")
    
    if successful_downloads < total_downloads:
        print("⚠️  Some downloads failed. You may need to manually download those sounds.")
        print("💡 Visit https://www.myinstants.com/en/index/de/ to get the missing sounds.")

if __name__ == "__main__":
    main()
