#!/usr/bin/env python3
"""PreToolUse 훅: 되돌리기 어려운 셸 명령을 차단한다. (.claude/settings.json의 PreToolUse 훅과 같은 규칙)

exit 2 + stderr → Codex가 해당 도구 호출을 막고 stderr를 사유로 보여 준다.
"""

import json
import re
import sys

DANGEROUS = re.compile(r"rm\s+-rf|git\s+push\s+--force|git\s+reset\s+--hard|DROP\s+TABLE", re.IGNORECASE)


def main():
    sys.stderr.reconfigure(encoding="utf-8")  # Windows 콘솔 기본 인코딩(cp949)에서 한글이 깨지지 않게
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0

    command = (payload.get("tool_input") or {}).get("command", "")
    if isinstance(command, list):
        command = " ".join(map(str, command))

    if DANGEROUS.search(str(command)):
        sys.stderr.write("BLOCKED: 위험한 명령어가 감지되었습니다.\n")
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
