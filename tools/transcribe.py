from __future__ import annotations

import argparse
import datetime as dt
import json
import traceback
from pathlib import Path


BASE_DIR = Path.home() / "Documents" / "Takken-Learning"
VIDEO_DIR = BASE_DIR / "videos"
SUBTITLE_DIR = BASE_DIR / "subtitles"
GENERATED_DIR = BASE_DIR / "generated"
LOG_DIR = BASE_DIR / "logs"
LOG_FILE = LOG_DIR / "transcribe-log.txt"

MODEL_NAME = "small"
LANGUAGE = "Japanese"


def now_text() -> str:
    return dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def log(message: str) -> None:
    line = f"[{now_text()}] {message}"
    print(line)
    with LOG_FILE.open("a", encoding="utf-8") as file:
        file.write(line + "\n")


def format_timestamp(seconds: float) -> str:
    milliseconds = int(round(seconds * 1000))
    hours = milliseconds // 3_600_000
    milliseconds %= 3_600_000
    minutes = milliseconds // 60_000
    milliseconds %= 60_000
    secs = milliseconds // 1000
    millis = milliseconds % 1000
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"


def write_txt(result: dict, output_path: Path) -> None:
    text = (result.get("text") or "").strip()
    output_path.write_text(text + "\n", encoding="utf-8")


def write_srt(result: dict, output_path: Path) -> None:
    segments = result.get("segments") or []
    lines: list[str] = []

    for index, segment in enumerate(segments, start=1):
        start = format_timestamp(float(segment.get("start", 0)))
        end = format_timestamp(float(segment.get("end", 0)))
        text = (segment.get("text") or "").strip()
        lines.extend([str(index), f"{start} --> {end}", text, ""])

    output_path.write_text("\n".join(lines), encoding="utf-8")


def write_if_missing(path: Path, content: str) -> bool:
    if path.exists():
        log(f"SKIP {path.name}: already exists.")
        return False

    path.write_text(content, encoding="utf-8")
    log(f"OK generated template: {path.name}")
    return True


def find_videos() -> list[Path]:
    if not VIDEO_DIR.exists():
        return []
    return sorted(VIDEO_DIR.glob("*.mp4"))


def find_lesson_stems(videos: list[Path]) -> list[str]:
    stems = {video.stem for video in videos}

    if SUBTITLE_DIR.exists():
        stems.update(path.stem for path in SUBTITLE_DIR.glob("*.txt"))

    return sorted(stems)


def should_skip(txt_path: Path, srt_path: Path) -> bool:
    return txt_path.exists() and srt_path.exists()


def transcribe_video(model, video_path: Path) -> tuple[Path, Path]:
    txt_path = SUBTITLE_DIR / f"{video_path.stem}.txt"
    srt_path = SUBTITLE_DIR / f"{video_path.stem}.srt"

    if should_skip(txt_path, srt_path):
        log(f"SKIP {video_path.name}: txt and srt already exist.")
        return txt_path, srt_path

    result = model.transcribe(
        str(video_path),
        language=LANGUAGE,
        verbose=False,
    )
    write_txt(result, txt_path)
    write_srt(result, srt_path)
    log(f"OK {video_path.name}: generated {txt_path.name}, {srt_path.name}.")
    return txt_path, srt_path


def build_course_template(stem: str) -> str:
    generated_at = now_text()
    source_video = VIDEO_DIR / f"{stem}.mp4"
    source_subtitle = SUBTITLE_DIR / f"{stem}.txt"

    return f"""# {stem}

课程名称：

来源视频：{source_video}

来源字幕：{source_subtitle}

生成时间：{generated_at}

━━━━━━━━━━━━━━━━━━

## 本课重点

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 易错点

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 考试重点

（待AI填写）

━━━━━━━━━━━━━━━━━━

## Scan讲解

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 官方过去问关联

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 小吴提醒

（待AI填写）
"""


def build_memory_template(stem: str) -> str:
    return f"""# {stem} 记忆卡

来源字幕：{SUBTITLE_DIR / f"{stem}.txt"}

生成时间：{now_text()}

━━━━━━━━━━━━━━━━━━

## 一张记忆卡

正面：

（待AI填写）

背面：

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 小吴理解法

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 今天只记一句话

（待AI填写）
"""


def build_keywords_template() -> str:
    data = {
        "keywords": [],
        "laws": [],
        "numbers": [],
        "mistakes": []
    }
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"


def build_review_template(stem: str) -> str:
    return f"""# {stem} 复习模板

来源字幕：{SUBTITLE_DIR / f"{stem}.txt"}

生成时间：{now_text()}

━━━━━━━━━━━━━━━━━━

## 第1天复习

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 第3天复习

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 第7天复习

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 第14天复习

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 第30天复习

（待AI填写）

━━━━━━━━━━━━━━━━━━

## 小吴复习提醒

（待AI填写）
"""


def generate_templates(stems: list[str]) -> None:
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)

    if not stems:
        log("No lesson stems found for generated templates.")
        return

    log(f"Generating content templates for {len(stems)} lesson(s).")

    for stem in stems:
        write_if_missing(GENERATED_DIR / f"{stem}-course.md", build_course_template(stem))
        write_if_missing(GENERATED_DIR / f"{stem}-memory.md", build_memory_template(stem))
        write_if_missing(GENERATED_DIR / f"{stem}-keywords.json", build_keywords_template())
        write_if_missing(GENERATED_DIR / f"{stem}-review.md", build_review_template(stem))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="XiaoWu Import Engine")
    parser.add_argument(
        "--templates-only",
        action="store_true",
        help="Only create generated lesson templates. Do not run Whisper transcription.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    SUBTITLE_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    log("=" * 60)
    log("XiaoWu Import Engine V2 started.")
    log(f"Video directory: {VIDEO_DIR}")
    log(f"Subtitle directory: {SUBTITLE_DIR}")
    log(f"Generated directory: {GENERATED_DIR}")

    videos = find_videos()
    log(f"Detected {len(videos)} mp4 video(s).")
    lesson_stems = find_lesson_stems(videos)

    if args.templates_only:
        generate_templates(lesson_stems)
        log("Templates-only mode finished.")
        log("XiaoWu Import Engine V2 finished.")
        log("=" * 60)
        return

    if not videos:
        log("No mp4 videos found. Put videos into the videos directory and run again.")
        generate_templates(lesson_stems)
        log("XiaoWu Import Engine V2 finished.")
        return

    pending = [
        video for video in videos
        if not should_skip(SUBTITLE_DIR / f"{video.stem}.txt", SUBTITLE_DIR / f"{video.stem}.srt")
    ]

    if pending:
        log(f"Loading Whisper model: {MODEL_NAME}")
        import whisper
        model = whisper.load_model(MODEL_NAME)
    else:
        model = None
        log("All videos already have txt and srt subtitles. Nothing to transcribe.")

    failures: list[tuple[str, str]] = []

    for index, video_path in enumerate(videos, start=1):
        log(f"Processing {index} / {len(videos)}: {video_path.name}")
        print(f"正在处理 {index} / 当前视频总数 {len(videos)}：{video_path.name}")

        txt_path = SUBTITLE_DIR / f"{video_path.stem}.txt"
        srt_path = SUBTITLE_DIR / f"{video_path.stem}.srt"
        if should_skip(txt_path, srt_path):
            log(f"SKIP {video_path.name}: already completed.")
            continue

        try:
            transcribe_video(model, video_path)
        except Exception as error:
            reason = f"{type(error).__name__}: {error}"
            failures.append((video_path.name, reason))
            log(f"FAIL {video_path.name}: {reason}")
            log(traceback.format_exc())

    if failures:
        log(f"Finished with {len(failures)} failure(s).")
        for filename, reason in failures:
            log(f"FAILED FILE: {filename} / REASON: {reason}")
    else:
        log("Finished without failures.")

    generate_templates(find_lesson_stems(videos))
    log("XiaoWu Import Engine V2 finished.")
    log("=" * 60)


if __name__ == "__main__":
    main()
