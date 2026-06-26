from __future__ import annotations

import argparse
import datetime as dt
from pathlib import Path


BASE_DIR = Path.home() / "Documents" / "Takken-Learning"
SUBTITLE_DIR = BASE_DIR / "subtitles"
VIDEO_DIR = BASE_DIR / "videos"
GENERATED_DIR = BASE_DIR / "generated"


def now_text() -> str:
    return dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a XiaoWu course draft from a transcript."
    )
    parser.add_argument(
        "lesson_id",
        help="Lesson id, for example: lesson-001",
    )
    return parser.parse_args()


def normalize_lesson_id(value: str) -> str:
    cleaned = value.strip().lower()
    if cleaned.startswith("lesson-"):
        return cleaned

    if cleaned.isdigit():
        return f"lesson-{int(cleaned):03d}"

    raise ValueError("lesson_id must look like lesson-001 or 001")


def read_transcript(lesson_id: str) -> str:
    transcript_path = SUBTITLE_DIR / f"{lesson_id}.txt"
    if not transcript_path.exists():
        raise FileNotFoundError(f"Transcript not found: {transcript_path}")

    return transcript_path.read_text(encoding="utf-8").strip()


def build_draft(lesson_id: str, transcript: str) -> str:
    video_path = VIDEO_DIR / f"{lesson_id}.mp4"
    transcript_path = SUBTITLE_DIR / f"{lesson_id}.txt"
    transcript_chars = len(transcript)

    return f"""# {lesson_id} Course Draft

课程标题：

视频来源：{video_path}

字幕来源：{transcript_path}

生成时间：{now_text()}

字幕字数：约 {transcript_chars} 字符

> 说明：本文件是 XiaoWu Course Generator V1 生成的结构化草稿。
> V1 不调用 OpenAI API，不直接改网站课程文件。
> 请根据后面的字幕原文，把各部分整理成“小吴讲给小7听”的课程内容。

━━━━━━━━━━━━━━━━━━

## 1. 小吴开场故事

（待整理）

写法要求：
- 不要直接讲法律。
- 先用生活情境带小7进入这一课。
- 像小吴坐在小7旁边讲课。
- 约 300-500 字。

━━━━━━━━━━━━━━━━━━

## 2. 老师这一课真正讲了什么

（待整理）

请用自己的话总结老师讲课的主线，不要复制字幕原文。

━━━━━━━━━━━━━━━━━━

## 3. 本课核心知识点

（待整理）

- 知识点1：
- 知识点2：
- 知识点3：
- 知识点4：
- 知识点5：

━━━━━━━━━━━━━━━━━━

## 4. 考试重点

（待整理）

请写出考试真正喜欢考的判断点。

━━━━━━━━━━━━━━━━━━

## 5. 最容易错的地方

（待整理）

- 易错点1：
- 易错点2：
- 易错点3：

━━━━━━━━━━━━━━━━━━

## 6. 小吴这样理解

（待整理）

不要写死口诀。
请用“为什么这样规定”的方式帮助小7理解。

━━━━━━━━━━━━━━━━━━

## 7. 一张记忆卡

正面：

（待整理）

背面：

（待整理）

━━━━━━━━━━━━━━━━━━

## 8. 今天只记一句话

（待整理）

要求：
- 一句话。
- 不超过 20 字。
- 能在做题时立刻想起来。

━━━━━━━━━━━━━━━━━━

## 9. 如果我是出题老师，我会怎么考

（待整理）

请写出命题人可能如何把这个知识点藏进题干。

━━━━━━━━━━━━━━━━━━

## 10. 小吴给小7的温柔总结

（待整理）

不要只总结知识。
要告诉小7今天学到什么程度就已经很棒。

━━━━━━━━━━━━━━━━━━

## 11. 建议关联的官方过去问

（待整理）

- 年度：
- 题号：
- 关联理由：

━━━━━━━━━━━━━━━━━━

## 12. 建议生成的原创练习题方向

（待整理）

- 题型方向1：
- 题型方向2：
- 题型方向3：

━━━━━━━━━━━━━━━━━━

# 字幕原文

以下内容仅作为整理材料，不要直接复制进课程正文。

```text
{transcript}
```
"""


def main() -> None:
    args = parse_args()
    lesson_id = normalize_lesson_id(args.lesson_id)
    transcript = read_transcript(lesson_id)

    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    output_path = GENERATED_DIR / f"{lesson_id}-course-draft.md"
    output_path.write_text(build_draft(lesson_id, transcript), encoding="utf-8")

    print(f"Generated: {output_path}")


if __name__ == "__main__":
    main()
