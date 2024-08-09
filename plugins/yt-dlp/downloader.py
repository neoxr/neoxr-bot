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
            
            # Extract format IDs and heights
            format_list = []
            for fmt in formats:
                format_id = fmt.get('format_id')
                height = fmt.get('height')
                if height:
                    format_list.append(f"{format_id}: {height}p")
                else:
                    format_list.append(f"{format_id}: Audio")  # For formats with no height information

            return format_list, None
    except Exception as e:
        return None, str(e)

def download_video(url, output_path, quality='best', start_time=None):
    formats, error = get_available_formats(url)
    if error:
        return "Format check failed", error, None, 0, 0
    
    print(f"Available formats: {formats}")  # Debug log

    # Find the format ID that matches the desired quality
    format_code = next((fmt.split(':')[0] for fmt in formats if quality in fmt), 'best')

    # Construct yt-dlp options
    ydl_opts = {
        'outtmpl': output_path,
        'format': format_code,
        'quiet': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception as e:
        return "Download failed", str(e), None, 0, 0

    if not Path(output_path).exists():
        return "Download failed", "File not found after download", None, 0, 0

    file_size = Path(output_path).stat().st_size  # size in bytes
    if start_time is None:
        start_time = time.time()  # Default to current time if not provided
    download_speed = file_size / (time.time() - start_time)  # bytes per second

    return None, None, output_path, download_speed, file_size

def main(url, output_path, quality='best'):
    start_time = time.time()
    error, error_message, output_path, download_speed, file_size = download_video(url, output_path, quality, start_time)

    if error:
        print(f"Error: {error} - {error_message}")
        return

    upload_speed = download_speed
    estimated_upload_time = file_size / upload_speed  # seconds

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
