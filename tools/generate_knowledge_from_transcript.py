from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


BASE_DIR = Path.home() / "Documents" / "Takken-Learning"
SUBTITLE_DIR = BASE_DIR / "subtitles"
GENERATED_DIR = BASE_DIR / "generated"

KEYWORD_CANDIDATES = [
    "免許",
    "欠格事由",
    "免許取消",
    "暴力団員",
    "役員",
    "業務停止",
    "未成年者",
    "営業保証金",
    "保証協会",
    "弁済業務保証金分担金",
    "供託",
    "還付",
    "取戻し",
    "廃業",
    "合併",
    "執行猶予",
    "法定代理人",
    "事務所",
    "分担金",
    "公告",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate editable knowledge-point templates from a transcript."
    )
    parser.add_argument("lesson_id", help="Lesson id, for example: lesson-001")
    return parser.parse_args()


def normalize_lesson_id(value: str) -> str:
    cleaned = value.strip().lower()
    if cleaned.startswith("lesson-"):
        return cleaned
    if cleaned.isdigit():
        return f"lesson-{int(cleaned):03d}"
    raise ValueError("lesson_id must look like lesson-001 or 001")


def read_transcript(lesson_id: str) -> tuple[Path, str]:
    transcript_path = SUBTITLE_DIR / f"{lesson_id}.txt"
    if not transcript_path.exists():
        raise FileNotFoundError(f"Transcript not found: {transcript_path}")
    return transcript_path, transcript_path.read_text(encoding="utf-8").strip()


def output_path(base_name: str, suffix: str) -> Path:
    path = GENERATED_DIR / f"{base_name}{suffix}"
    if not path.exists():
        return path

    return GENERATED_DIR / f"{base_name}-new{suffix}"


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def find_keywords(transcript: str) -> list[str]:
    normalized = normalize_text(transcript)
    found = [keyword for keyword in KEYWORD_CANDIDATES if keyword in normalized]
    return found


def find_snippets(transcript: str, keyword: str, limit: int = 3, radius: int = 90) -> list[str]:
    normalized = normalize_text(transcript)
    snippets: list[str] = []

    for match in re.finditer(re.escape(keyword), normalized):
        start = max(0, match.start() - radius)
        end = min(len(normalized), match.end() + radius)
        snippet = normalized[start:end].strip()
        if snippet not in snippets:
            snippets.append(snippet)
        if len(snippets) >= limit:
            break

    return snippets


def category_for(keyword: str) -> str:
    if keyword in {"営業保証金", "保証協会", "弁済業務保証金分担金", "供託", "還付", "取戻し", "分担金", "公告"}:
        return "営業保証金・保証協会"
    if keyword in {"欠格事由", "免許取消", "暴力団員", "役員", "業務停止", "未成年者", "法定代理人", "執行猶予"}:
        return "免許の欠格・処分"
    return "免許制度"


def build_knowledge_points(transcript: str, keywords: list[str]) -> list[dict]:
    points = []

    for index, keyword in enumerate(keywords, start=1):
        points.append({
            "id": f"kp-{index:03d}",
            "title": keyword,
            "category": category_for(keyword),
            "importance": 3,
            "examFrequency": 3,
            "difficulty": 2,
            "keywords": [keyword],
            "sourceSnippets": find_snippets(transcript, keyword),
            "xiaoWuExplanation": "",
            "examTrap": "",
            "commonMistakes": [],
            "memoryTip": "",
            "relatedQuestions": [],
            "reviewPriority": 3,
            "status": "draft",
        })

    if points:
        return points

    return [{
        "id": "kp-001",
        "title": "",
        "category": "",
        "importance": 1,
        "examFrequency": 1,
        "difficulty": 1,
        "keywords": [],
        "sourceSnippets": [],
        "xiaoWuExplanation": "",
        "examTrap": "",
        "commonMistakes": [],
        "memoryTip": "",
        "relatedQuestions": [],
        "reviewPriority": 1,
        "status": "draft",
    }]


def build_json_data(lesson_id: str, transcript_path: Path, keywords: list[str], points: list[dict]) -> dict:
    return {
        "lessonId": lesson_id,
        "title": "",
        "subject": "",
        "sourceTranscript": str(transcript_path),
        "autoKeywords": keywords,
        "knowledgePoints": points,
    }


def build_markdown(lesson_id: str, keywords: list[str], points: list[dict]) -> str:
    lines = [
        f"# {lesson_id} 知识点整理",
        "",
        "## 本课自动识别关键词",
        "",
    ]

    if keywords:
        lines.extend([f"- {keyword}" for keyword in keywords])
    else:
        lines.append("（未自动识别关键词，待人工补充）")

    lines.extend(["", "## 建议知识点", ""])

    for point in points:
        snippets = point.get("sourceSnippets") or []
        lines.extend([
            f"### {point['id']}",
            "",
            f"知识点名称：{point.get('title', '')}",
            f"分类：{point.get('category', '')}",
            f"重要程度：{point.get('importance', 1)}",
            f"考试频率：{point.get('examFrequency', 1)}",
            f"难度：{point.get('difficulty', 1)}",
            f"相关关键词：{', '.join(point.get('keywords', []))}",
            "",
            "字幕原文片段：",
        ])

        if snippets:
            lines.extend([f"> {snippet}" for snippet in snippets])
        else:
            lines.append("（待补充）")

        lines.extend([
            "",
            "小吴讲解：",
            "",
            "（待填写）",
            "",
            "考试陷阱：",
            "",
            "（待填写）",
            "",
            "易错点：",
            "",
            "- （待填写）",
            "",
            "记忆法：",
            "",
            "（待填写）",
            "",
            "关联题目：",
            "",
            "- （待填写）",
            "",
            "━━━━━━━━━━━━━━━━━━",
            "",
        ])

    return "\n".join(lines)


def main() -> None:
    args = parse_args()
    lesson_id = normalize_lesson_id(args.lesson_id)
    transcript_path, transcript = read_transcript(lesson_id)

    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    keywords = find_keywords(transcript)
    points = build_knowledge_points(transcript, keywords)
    data = build_json_data(lesson_id, transcript_path, keywords, points)

    json_path = output_path(f"{lesson_id}-knowledge", ".json")
    md_path = output_path(f"{lesson_id}-knowledge", ".md")

    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(build_markdown(lesson_id, keywords, points), encoding="utf-8")

    print(f"Generated JSON: {json_path}")
    print(f"Generated Markdown: {md_path}")
    print("Auto keywords:")
    for keyword in keywords:
        print(f"- {keyword}")


if __name__ == "__main__":
    main()
