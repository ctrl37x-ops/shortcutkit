// 맥 단축키 데이터
// keys.key 값은 브라우저 KeyboardEvent.key.toLowerCase() 와 비교됨
// 화살표: "arrowleft" | "arrowright" | "arrowup" | "arrowdown"
// 백스페이스: "backspace"
// Shift+기호는 실제로 생성되는 문자 사용: Shift+[ → "{",  Shift+. → ">"
export const SHORTCUTS = [
  // ── 기본 조작 ────────────────────────────────────────────────────────────
  { id: 1,  description: "복사하기",           category: "기본 조작", emoji: "📋", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "c" },          display: "⌘C"   },
  { id: 2,  description: "붙여넣기",           category: "기본 조작", emoji: "📌", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "v" },          display: "⌘V"   },
  { id: 3,  description: "잘라내기",           category: "기본 조작", emoji: "✂️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "x" },          display: "⌘X"   },
  { id: 4,  description: "실행 취소",          category: "기본 조작", emoji: "↩️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "z" },          display: "⌘Z"   },
  { id: 5,  description: "다시 실행",          category: "기본 조작", emoji: "↪️", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "z" },          display: "⌘⇧Z"  },
  { id: 6,  description: "전체 선택",          category: "기본 조작", emoji: "🖱️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "a" },          display: "⌘A"   },
  { id: 7,  description: "저장하기",           category: "기본 조작", emoji: "💾", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "s" },          display: "⌘S"   },
  { id: 8,  description: "찾기",               category: "기본 조작", emoji: "🔍", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "f" },          display: "⌘F"   },
  { id: 9,  description: "프린트",             category: "기본 조작", emoji: "🖨️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "p" },          display: "⌘P"   },
  { id: 10, description: "환경설정 열기",      category: "기본 조작", emoji: "⚙️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "," },          display: "⌘,"   },
  { id: 29, description: "다른 이름으로 저장", category: "기본 조작", emoji: "💿", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "s" },          display: "⌘⇧S"  },
  { id: 31, description: "파일 열기",          category: "기본 조작", emoji: "📂", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "o" },          display: "⌘O"   },
  { id: 32, description: "같은 앱 다음 창",    category: "기본 조작", emoji: "🔀", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "`" },          display: "⌘`",   browserBlocked: true },

  // ── 창/앱 관리 ─────────────────────────────────────────────────────────
  { id: 11, description: "새 탭 열기",         category: "창/앱 관리", emoji: "📑", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "t" },         display: "⌘T",  browserBlocked: true },
  { id: 12, description: "탭 / 창 닫기",       category: "창/앱 관리", emoji: "❌", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "w" },         display: "⌘W",  browserBlocked: true },
  { id: 13, description: "새 창 열기",         category: "창/앱 관리", emoji: "🪟", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "n" },         display: "⌘N",  browserBlocked: true },
  // ⌘} = Cmd+Shift+] → e.key === "}", e.shiftKey === true (버그 수정)
  { id: 14, description: "다음 탭으로 이동",   category: "창/앱 관리", emoji: "▶️", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "}" },         display: "⌘}"   },
  // ⌘{ = Cmd+Shift+[ → e.key === "{", e.shiftKey === true (버그 수정)
  { id: 15, description: "이전 탭으로 이동",   category: "창/앱 관리", emoji: "◀️", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "{" },         display: "⌘{"   },
  { id: 30, description: "닫힌 탭 다시 열기",  category: "창/앱 관리", emoji: "🔓", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "t" },         display: "⌘⇧T", browserBlocked: true },

  // ── 브라우저 ───────────────────────────────────────────────────────────
  { id: 16, description: "페이지 새로고침",        category: "브라우저", emoji: "🔄", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "r" },        display: "⌘R"   },
  { id: 17, description: "주소창으로 이동",        category: "브라우저", emoji: "🌐", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "l" },        display: "⌘L"   },
  { id: 18, description: "뒤로 가기",              category: "브라우저", emoji: "⬅️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "[" },        display: "⌘["   },
  { id: 19, description: "앞으로 가기",            category: "브라우저", emoji: "➡️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "]" },        display: "⌘]"   },
  { id: 20, description: "북마크 추가",            category: "브라우저", emoji: "🔖", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "d" },        display: "⌘D"   },
  { id: 49, description: "페이지 확대",            category: "브라우저", emoji: "🔭", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "=" },        display: "⌘="   },
  { id: 50, description: "페이지 축소",            category: "브라우저", emoji: "🔬", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "-" },        display: "⌘-"   },
  { id: 51, description: "기본 배율로 초기화",     category: "브라우저", emoji: "🎯", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "0" },        display: "⌘0"   },
  { id: 52, description: "시크릿 창 열기",         category: "브라우저", emoji: "🕵️", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "n" },        display: "⌘⇧N", browserBlocked: true },
  { id: 53, description: "북마크 바 보기/숨기기",  category: "브라우저", emoji: "📚", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "b" },        display: "⌘⇧B"  },
  { id: 54, description: "다운로드 목록 열기",     category: "브라우저", emoji: "⬇️", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "j" },        display: "⌘⇧J"  },

  // ── 텍스트 편집 ───────────────────────────────────────────────────────
  { id: 21, description: "텍스트 굵게",    category: "텍스트 편집", emoji: "𝐁", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "b" }, display: "⌘B"  },
  { id: 22, description: "텍스트 기울임꼴", category: "텍스트 편집", emoji: "𝑰", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "i" }, display: "⌘I"  },
  { id: 23, description: "텍스트 밑줄",    category: "텍스트 편집", emoji: "U̲", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "u" }, display: "⌘U"  },
  { id: 24, description: "링크 삽입",      category: "텍스트 편집", emoji: "🔗", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "k" }, display: "⌘K"  },
  { id: 25, description: "다음 찾기",      category: "텍스트 편집", emoji: "🔎", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "g" }, display: "⌘G"  },

  // ── 커서 / 선택 (새 카테고리) ──────────────────────────────────────────
  // 커서 이동
  { id: 33, description: "줄 맨 앞으로",           category: "커서/선택", emoji: "⏮️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "arrowleft"  }, display: "⌘←"   },
  { id: 34, description: "줄 맨 끝으로",           category: "커서/선택", emoji: "⏭️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "arrowright" }, display: "⌘→"   },
  { id: 35, description: "문서 맨 위로",           category: "커서/선택", emoji: "⬆️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "arrowup"    }, display: "⌘↑"   },
  { id: 36, description: "문서 맨 아래로",         category: "커서/선택", emoji: "⬇️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "arrowdown"  }, display: "⌘↓"   },
  { id: 37, description: "이전 단어로 이동",       category: "커서/선택", emoji: "◀️", keys: { meta: false, shift: false, alt: true,  ctrl: false, key: "arrowleft"  }, display: "⌥←"   },
  { id: 38, description: "다음 단어로 이동",       category: "커서/선택", emoji: "▶️", keys: { meta: false, shift: false, alt: true,  ctrl: false, key: "arrowright" }, display: "⌥→"   },
  // 텍스트 선택
  { id: 39, description: "줄 시작까지 선택",       category: "커서/선택", emoji: "↖️", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "arrowleft"  }, display: "⌘⇧←"  },
  { id: 40, description: "줄 끝까지 선택",         category: "커서/선택", emoji: "↗️", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "arrowright" }, display: "⌘⇧→"  },
  { id: 41, description: "문서 맨 위까지 선택",    category: "커서/선택", emoji: "🔼", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "arrowup"    }, display: "⌘⇧↑"  },
  { id: 42, description: "문서 맨 아래까지 선택",  category: "커서/선택", emoji: "🔽", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "arrowdown"  }, display: "⌘⇧↓"  },
  // 삭제
  { id: 43, description: "이전 단어 삭제",         category: "커서/선택", emoji: "🗑️", keys: { meta: false, shift: false, alt: true,  ctrl: false, key: "backspace"  }, display: "⌥⌫"   },
  { id: 44, description: "줄 앞까지 삭제",         category: "커서/선택", emoji: "🧹", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "backspace"  }, display: "⌘⌫"   },

  // ── Finder ─────────────────────────────────────────────────────────────
  { id: 26, description: "새 폴더 만들기",          category: "Finder", emoji: "📁", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: "n" }, display: "⌘⇧N", browserBlocked: true },
  { id: 27, description: "항목 복제",              category: "Finder", emoji: "🗂️", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "d" }, display: "⌘D"   },
  // ⌘⇧. → Shift+Period → e.key === ">" (버그 수정)
  { id: 28, description: "숨김 파일 보기/숨기기",  category: "Finder", emoji: "👁️", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: ">" }, display: "⌘⇧."  },
  { id: 45, description: "폴더로 이동",            category: "Finder", emoji: "🗺️", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: "g" }, display: "⌘⇧G"  },
  { id: 46, description: "홈 폴더 열기",           category: "Finder", emoji: "🏠", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: "h" }, display: "⌘⇧H"  },
  { id: 47, description: "데스크탑 폴더 열기",     category: "Finder", emoji: "🖥️", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: "d" }, display: "⌘⇧D"  },
  { id: 48, description: "파일 훑어보기",          category: "Finder", emoji: "👀", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "y" }, display: "⌘Y"   },
];

export const CATEGORIES = ["전체", ...new Set(SHORTCUTS.map((s) => s.category))];
