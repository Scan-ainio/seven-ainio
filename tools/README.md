# XiaoWu Import Engine V2

这个工具把宅建课程 MP4 视频转成字幕，并准备后续课程生成用的内容工厂模板。

当前流程：

```text
MP4 视频
↓
Whisper 自动转写
↓
生成 .txt 和 .srt
↓
生成课程资料模板
```

## 安装依赖

建议先建立 Python 虚拟环境：

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r tools/requirements.txt
```

Whisper 还需要系统里能调用 `ffmpeg`。如果 Mac 上没有安装，可以用 Homebrew：

```bash
brew install ffmpeg
```

## 视频放在哪里

把视频放到：

```text
~/Documents/Takken-Learning/videos/
```

例如：

```text
~/Documents/Takken-Learning/videos/lesson-001.mp4
```

## 如何运行

在项目根目录运行：

```bash
python3 tools/transcribe.py
```

如果现在只想建立 `generated/` 模板，不想启动 Whisper 转写：

```bash
python3 tools/transcribe.py --templates-only
```

## 字幕保存在哪里

工具会自动创建：

```text
~/Documents/Takken-Learning/subtitles/
```

例如：

```text
~/Documents/Takken-Learning/subtitles/lesson-001.txt
~/Documents/Takken-Learning/subtitles/lesson-001.srt
```

## 课程资料模板保存在哪里

工具会自动创建：

```text
~/Documents/Takken-Learning/generated/
```

例如：

```text
~/Documents/Takken-Learning/generated/lesson-001-course.md
~/Documents/Takken-Learning/generated/lesson-001-memory.md
~/Documents/Takken-Learning/generated/lesson-001-keywords.json
~/Documents/Takken-Learning/generated/lesson-001-review.md
```

这些文件第二版只放模板，不调用 API，不自动填写课程内容。

第三版以后，AI 会读取：

```text
~/Documents/Takken-Learning/subtitles/lesson-001.txt
```

然后填写：

```text
~/Documents/Takken-Learning/generated/lesson-001-course.md
~/Documents/Takken-Learning/generated/lesson-001-memory.md
~/Documents/Takken-Learning/generated/lesson-001-keywords.json
~/Documents/Takken-Learning/generated/lesson-001-review.md
```

## 日志保存在哪里

工具会自动创建：

```text
~/Documents/Takken-Learning/logs/
```

日志文件：

```text
~/Documents/Takken-Learning/logs/transcribe-log.txt
```

## 断点续跑

如果某个视频已经生成：

```text
lesson-001.txt
lesson-001.srt
```

再次运行时会自动跳过它。

如果 `generated/` 里的模板文件已经存在，也会自动跳过，不会覆盖。

以后增加第 2 个、第 3 个视频，甚至增加到约 97 个视频，只要继续放进：

```text
~/Documents/Takken-Learning/videos/
```

然后重新运行：

```bash
python3 tools/transcribe.py
```

程序会自动扫描所有 `*.mp4`，跳过已完成的视频，只处理新视频。

## Whisper 设置

当前默认：

```text
model: medium
language: Japanese
```

如果某个视频失败，程序不会停止整个批次，会把失败文件名和原因写进日志。

## XiaoWu Knowledge Engine V1

Knowledge Engine 会把字幕先整理成“知识点结构”，后续课程、题目、错题、复习和学习地图都可以从这份结构继续生成。

第一版不调用 OpenAI API，只做半自动结构化：

```text
字幕 txt
↓
自动识别关键词
↓
生成可编辑 knowledge.json 和 knowledge.md
```

运行方式：

```bash
python3 tools/generate_knowledge_from_transcript.py lesson-001
```

输入：

```text
~/Documents/Takken-Learning/subtitles/lesson-001.txt
```

输出：

```text
~/Documents/Takken-Learning/generated/lesson-001-knowledge.json
~/Documents/Takken-Learning/generated/lesson-001-knowledge.md
```

如果文件已经存在，工具不会覆盖，会生成：

```text
lesson-001-knowledge-new.json
lesson-001-knowledge-new.md
```

`knowledge.json` 面向程序继续处理，`knowledge.md` 面向人工阅读和编辑。
