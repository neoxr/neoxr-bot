import json
import time
import yt_dlp
import sys
from pathlib import Path

def get_available_formats(url):
    ydl_opts = {
        'quiet': True,
        'format': 'bestaudio/best',
        'noplaylist': True,
        'extract_flat': True
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=False)
            formats = info_dict.get('formats', [])
            format_list = [
                f"{fmt['format_id']}: {fmt['height']}p" if 'height' in fmt else f"{fmt['format_id']}: Audio"
                for fmt in formats
            ]
            return format_list, None
    except Exception as e:
        return None, str(e)

def download_video(url, output_path, quality='best', start_time=None):
    formats, error = get_available_formats(url)
    if error:
        return "Format check failed", error, None, 0, 0
    
    format_code = next((fmt.split(':')[0] for fmt in formats if quality in fmt), 'best')

    ydl_opts = {
        'outtmpl': str(output_path),
        'format': format_code,
        'quiet': True,
        'noprogress': True,
        'noplaylist': True,
        'concurrent_fragment_downloads': 4
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception as e:
        return "Download failed", str(e), None, 0, 0

    if not Path(output_path).exists():
        return "Download failed", "File not found after download", None, 0, 0

    file_size = Path(output_path).stat().st_size
    if start_time is None:
        start_time = time.time()
    download_speed = file_size / (time.time() - start_time)

    return None, None, output_path, download_speed, file_size

def main(url, output_dir, quality='best'):
    file_name = f"video_{int(time.time())}.mp4"  # Customize your file name logic here
    output_path = Path(output_dir) / file_name
    start_time = time.time()

    error, error_message, output_path, download_speed, file_size = download_video(url, output_path, quality, start_time)

    if error:
        print(json.dumps({"error": error, "message": error_message}))
        return

    print(json.dumps({"filePath": str(output_path), "downloadSpeed": download_speed, "fileSize": file_size}))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python downloader.py <url> <output_dir> [<quality>]"}))
        sys.exit(1)

    url = sys.argv[1]
    output_dir = sys.argv[2]
    quality = sys.argv[3] if len(sys.argv) > 3 else 'best'
    main(url, output_dir, quality)
