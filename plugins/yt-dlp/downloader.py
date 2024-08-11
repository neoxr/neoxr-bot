import yt_dlp
import sys
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

def is_youtube_url(url):
    return 'youtube.com' in url or 'youtu.be' in url

def get_available_formats(url):
    ydl_opts = {
        'quiet': True,
        'format': 'bestaudio/best',
        'noplaylist': True,
        'extract_flat': True
    }

    if is_youtube_url(url):
        ydl_opts['cookiefile'] = 'cookies.txt'
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=False)
            formats = info_dict.get('formats', [])
            
            format_list = []
            for fmt in formats:
                format_id = fmt.get('format_id')
                height = fmt.get('height')
                if height:
                    format_list.append(f"{format_id}: {height}p")
                else:
                    format_list.append(f"{format_id}: Audio")
            return format_list, None
    except Exception as e:
        return None, str(e)

def download_video(url, output_path, quality='best', start_time=None):
    formats, error = get_available_formats(url)
    if error:
        return "Format check failed", error, None, 0, 0
    
    print(f"Available formats: {formats}")

    format_code = next((fmt.split(':')[0] for fmt in formats if quality in fmt), 'best')

    ydl_opts = {
        'outtmpl': output_path,
        'format': format_code,
        'quiet': True
    }

    if is_youtube_url(url):
        ydl_opts['cookiefile'] = 'cookies.txt'

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

def main(url, output_path, quality='best'):
    start_time = time.time()
    
    with ThreadPoolExecutor() as executor:
        future_download = executor.submit(download_video, url, output_path, quality, start_time)
        error, error_message, output_path, download_speed, file_size = future_download.result()

    if error:
        print(f"Error: {error} - {error_message}")
        return

    upload_speed = download_speed
    estimated_upload_time = file_size / upload_speed

    print(f"File path: {output_path}")
    print(f"Estimated upload time: {estimated_upload_time}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python downloader.py <url> <output_path> [<quality>]")
        sys.exit(1)

    url = sys.argv[1]
    output_path = sys.argv[2]
    quality = sys.argv[3] if len(sys.argv) > 3 else 'best'
    main(url, output_path, quality)
