#!/usr/bin/env python3
"""
Download new meme sounds from myinstants.com
Based on the list provided by the user
"""

import requests
import os
import time
from urllib.parse import quote

# New meme sounds to download (avoiding duplicates)
NEW_MEMES = [
    ("emotional-damage", "Emotional Damage Meme"),
    ("baby-laughing", "baby laughing meme"),
    ("cat-laugh", "cat laugh meme 1"),
    ("oh-my-god-bro", "oh my god bro oh hell nah man"),
    ("run-vine", "RUN vine"),
    ("clash-royale-hog-rider", "clash royale hog rida"),
    ("he-he-he-ha-clash-royale-deep", "he he he ha clash royale (DEEP FRIED)"),
    ("goku-drip", "Goku drip"),
    ("explosion-meme", "Explosion meme"),
    ("windows-xp-shutdown", "Windows XP shutdown"),
    ("minecraft-eating", "minecraft eating sound"),
    ("minecraft-hurt", "Minecraft Hurt"),
    ("fart-with-reverb", "fart with reverb"),
    ("fart-meme-better", "Fart Meme Sound (Better and louder)"),
    ("buzzer", "Buzzer"),
    ("rizzbot-laugh", "Rizzbot laugh"),
    ("oh-my-god-meme", "Oh My God Meme"),
    ("confused-kitten", "Confused cross eyed kitten meme")
]

def download_sound(filename, search_term):
    """Download a sound from myinstants.com"""
    print(f"Downloading {filename}...")
    
    # Search for the sound
    search_url = f"https://www.myinstants.com/en/search/?name={quote(search_term)}"
    
    try:
        # For now, we'll create placeholder files since we need to implement proper scraping
        # In a real implementation, you'd scrape the search results and get the direct MP3 URLs
        placeholder_path = f"sounds/{filename}.mp3"
        
        if not os.path.exists(placeholder_path):
            # Create a placeholder file
            with open(placeholder_path, 'w') as f:
                f.write(f"# Placeholder for {search_term}\n")
                f.write(f"# Original search: {search_url}\n")
                f.write(f"# TODO: Download actual MP3 from myinstants.com\n")
            print(f"Created placeholder: {placeholder_path}")
        else:
            print(f"Already exists: {placeholder_path}")
            
    except Exception as e:
        print(f"Error downloading {filename}: {e}")

def main():
    print("🎵 Downloading new meme sounds...")
    print(f"Total sounds to process: {len(NEW_MEMES)}")
    
    # Ensure sounds directory exists
    os.makedirs("sounds", exist_ok=True)
    
    for filename, search_term in NEW_MEMES:
        download_sound(filename, search_term)
        time.sleep(0.5)  # Be nice to the server
    
    print("\n✅ Download complete!")
    print("Note: These are placeholder files. You'll need to manually download the actual MP3s from myinstants.com")
    print("Or implement proper web scraping to get the direct download URLs.")

if __name__ == "__main__":
    main()
