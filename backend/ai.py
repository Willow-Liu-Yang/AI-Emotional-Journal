# 一个临时的 mock AI 模块，让项目先能跑起来
def analyze_emotion_and_reply(text: str):
    # 返回模拟结果，让后端不崩
    return {
        "emotion": "neutral",
        "score": 0.0,
        "reply": None
    }
