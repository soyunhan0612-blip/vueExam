#!/usr/bin/env python3
"""Stop 훅: 턴이 끝날 때 `npm run build`를 돌리고, 실패하면 Codex가 한 번 더 고치도록 되돌려 보낸다.

- package.json이 아직 없으면(프로젝트 초기) 아무것도 하지 않는다.
- 빌드 실패 시 {"decision": "block", "reason": ...}를 출력 → reason이 다음 프롬프트가 된다.
- 이미 Stop 훅으로 이어진 턴(stop_hook_active)에서는 다시 막지 않아 무한 반복을 피한다.
"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TAIL_CHARS = 3000


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # Windows 콘솔 기본 인코딩(cp949)에서 한글이 깨지지 않게
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        payload = {}

    if not (ROOT / "package.json").exists():
        return 0

    npm = shutil.which("npm") or "npm"
    r = subprocess.run(
        [npm, "run", "build"], cwd=ROOT, capture_output=True,
        text=True, encoding="utf-8", errors="replace",
    )
    if r.returncode == 0 or payload.get("stop_hook_active"):
        return 0

    log = (r.stdout + r.stderr)[-TAIL_CHARS:]
    print(json.dumps({
        "decision": "block",
        "reason": f"`npm run build`가 실패했습니다. 아래 에러를 고친 뒤 다시 빌드하세요.\n\n{log}",
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
