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
  // ⌘} = Cmd+Shift+] → Chrome이 탭 전환을 처리해 keydown이 발생하지 않음
  { id: 14, description: "다음 탭으로 이동",   category: "창/앱 관리", emoji: "▶️", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "}" },         display: "⌘}",  browserBlocked: true },
  // ⌘{ = Cmd+Shift+[ → 동일하게 Chrome이 가로챔
  { id: 15, description: "이전 탭으로 이동",   category: "창/앱 관리", emoji: "◀️", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "{" },         display: "⌘{",  browserBlocked: true },
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
  { id: 54, description: "다운로드 목록 열기",     category: "브라우저", emoji: "⬇️", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "j" },        display: "⌘⇧J", browserBlocked: true },

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

  // ── 기본 조작 (추가) ──────────────────────────────────────────────────────
  { id: 55, description: "앱 종료",       category: "기본 조작", emoji: "🚪", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "q"   }, display: "⌘Q",    browserBlocked: true },
  { id: 56, description: "앱 숨기기",     category: "기본 조작", emoji: "🙈", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "h"   }, display: "⌘H",    browserBlocked: true },
  { id: 57, description: "창 최소화",     category: "기본 조작", emoji: "⬇️", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "m"   }, display: "⌘M",    browserBlocked: true },
  { id: 58, description: "앱 전환",       category: "기본 조작", emoji: "⇄",  keys: { meta: true,  shift: false, alt: false, ctrl: false, key: "tab" }, display: "⌘Tab",  browserBlocked: true },
  { id: 59, description: "역순 앱 전환",  category: "기본 조작", emoji: "⇆",  keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "tab" }, display: "⌘⇧Tab", browserBlocked: true },

  // ── 스크린샷 ──────────────────────────────────────────────────────────────
  // macOS 가 OS 레벨에서 인터셉트 → keydown 이벤트 미발생
  { id: 60, description: "전체 화면 캡처",             category: "스크린샷", emoji: "📸", keys: { meta: true, shift: true, alt: false, ctrl: false, key: "3" }, display: "⌘⇧3",  browserBlocked: true },
  { id: 61, description: "영역 선택 캡처",             category: "스크린샷", emoji: "✂️", keys: { meta: true, shift: true, alt: false, ctrl: false, key: "4" }, display: "⌘⇧4",  browserBlocked: true },
  { id: 62, description: "스크린샷 도구 모음",         category: "스크린샷", emoji: "🎛️", keys: { meta: true, shift: true, alt: false, ctrl: false, key: "5" }, display: "⌘⇧5",  browserBlocked: true },
  { id: 63, description: "클립보드에 전체 화면 캡처",  category: "스크린샷", emoji: "📋", keys: { meta: true, shift: true, alt: false, ctrl: true,  key: "3" }, display: "⌘⌃⇧3", browserBlocked: true },
  { id: 64, description: "클립보드에 영역 선택 캡처",  category: "스크린샷", emoji: "📐", keys: { meta: true, shift: true, alt: false, ctrl: true,  key: "4" }, display: "⌘⌃⇧4", browserBlocked: true },

  // ── 커서 / 선택 (추가) ────────────────────────────────────────────────────
  { id: 65, description: "이전 단어까지 선택",    category: "커서/선택", emoji: "🔙", keys: { meta: false, shift: true,  alt: true,  ctrl: false, key: "arrowleft"  }, display: "⌥⇧←" },
  { id: 66, description: "다음 단어까지 선택",    category: "커서/선택", emoji: "🔜", keys: { meta: false, shift: true,  alt: true,  ctrl: false, key: "arrowright" }, display: "⌥⇧→" },
  // macOS 텍스트 필드 전역 Emacs 단축키
  { id: 67, description: "줄 맨 앞으로 (Emacs)", category: "커서/선택", emoji: "⏮️", keys: { meta: false, shift: false, alt: false, ctrl: true,  key: "a" }, display: "⌃A" },
  { id: 68, description: "줄 맨 끝으로 (Emacs)", category: "커서/선택", emoji: "⏭️", keys: { meta: false, shift: false, alt: false, ctrl: true,  key: "e" }, display: "⌃E" },
  { id: 69, description: "커서 이후 줄 삭제",    category: "커서/선택", emoji: "🔪", keys: { meta: false, shift: false, alt: false, ctrl: true,  key: "k" }, display: "⌃K" },
  { id: 70, description: "앞 글자 삭제",         category: "커서/선택", emoji: "⌦",  keys: { meta: false, shift: false, alt: false, ctrl: true,  key: "d" }, display: "⌃D" },
  { id: 71, description: "두 글자 자리 교체",    category: "커서/선택", emoji: "🔀", keys: { meta: false, shift: false, alt: false, ctrl: true,  key: "t" }, display: "⌃T" },

  // ── Finder (추가) ─────────────────────────────────────────────────────────
  { id: 72, description: "정보 가져오기",   category: "Finder", emoji: "ℹ️", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "i"         }, display: "⌘I"   },
  // ⌘⌫: 텍스트 편집(id:44)과 동일 키이지만 Finder 맥락에서는 휴지통 이동
  { id: 73, description: "휴지통으로 이동", category: "Finder", emoji: "🗑️", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "backspace" }, display: "⌘⌫"  },
  { id: 74, description: "휴지통 비우기",   category: "Finder", emoji: "🔴", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: "backspace" }, display: "⌘⇧⌫", browserBlocked: true },
  // ⌘↑/↓: 커서/선택(id:35/36)과 동일 키이지만 Finder 맥락에서 폴더 탐색
  { id: 75, description: "상위 폴더 열기",  category: "Finder", emoji: "📁", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "arrowup"   }, display: "⌘↑"  },
  { id: 76, description: "선택 항목 열기",  category: "Finder", emoji: "📂", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "arrowdown" }, display: "⌘↓"  },
  // ⌘1~4: Chrome 탭 전환 단축키와 겹쳐 browserBlocked
  { id: 77, description: "아이콘 보기",     category: "Finder", emoji: "🔲", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "1"         }, display: "⌘1",  browserBlocked: true },
  { id: 78, description: "목록 보기",       category: "Finder", emoji: "📋", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "2"         }, display: "⌘2",  browserBlocked: true },
  { id: 79, description: "열 보기",         category: "Finder", emoji: "📊", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "3"         }, display: "⌘3",  browserBlocked: true },
  { id: 80, description: "갤러리 보기",     category: "Finder", emoji: "🖼️", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "4"         }, display: "⌘4",  browserBlocked: true },

  // ── 브라우저 (추가) ───────────────────────────────────────────────────────
  // ⌘⇧R: 페이지 즉시 새로고침으로 browserBlocked
  { id: 81,  description: "강제 새로고침",      category: "브라우저", emoji: "🔃", keys: { meta: true,  shift: true,  alt: false, ctrl: false, key: "r" }, display: "⌘⇧R",    browserBlocked: true },
  // DevTools 계열: Chrome이 인터셉트 → browserBlocked
  { id: 95,  description: "개발자 도구 열기",   category: "브라우저", emoji: "🛠️", keys: { meta: true,  shift: false, alt: true,  ctrl: false, key: "i" }, display: "⌘⌥I",    browserBlocked: true },
  { id: 96,  description: "JavaScript 콘솔",   category: "브라우저", emoji: "💻", keys: { meta: true,  shift: false, alt: true,  ctrl: false, key: "j" }, display: "⌘⌥J",    browserBlocked: true },
  { id: 97,  description: "페이지 소스 보기",   category: "브라우저", emoji: "📄", keys: { meta: true,  shift: false, alt: true,  ctrl: false, key: "u" }, display: "⌘⌥U",    browserBlocked: true },
  { id: 98,  description: "요소 검사",          category: "브라우저", emoji: "🔎", keys: { meta: true,  shift: false, alt: true,  ctrl: false, key: "c" }, display: "⌘⌥C",    browserBlocked: true },
  { id: 99,  description: "북마크 관리자",      category: "브라우저", emoji: "📚", keys: { meta: true,  shift: false, alt: true,  ctrl: false, key: "b" }, display: "⌘⌥B",    browserBlocked: true },

  // ── 텍스트 편집 (추가) ────────────────────────────────────────────────────
  { id: 100, description: "서식 없이 붙여넣기", category: "텍스트 편집", emoji: "📋", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: "v" }, display: "⌘⇧V" },
  { id: 101, description: "주석 토글",          category: "텍스트 편집", emoji: "💬", keys: { meta: true, shift: false, alt: false, ctrl: false, key: "/" }, display: "⌘/" },

  // ── Finder (추가) ─────────────────────────────────────────────────────────
  { id: 102, description: "응용 프로그램 폴더 열기", category: "Finder", emoji: "🧩", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: "a" }, display: "⌘⇧A" },
  { id: 103, description: "최근 사용 폴더 열기",    category: "Finder", emoji: "🕒", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: "f" }, display: "⌘⇧F" },
  { id: 104, description: "iCloud Drive 열기",     category: "Finder", emoji: "☁️", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: "i" }, display: "⌘⇧I" },
  { id: 105, description: "네트워크 폴더 열기",    category: "Finder", emoji: "🌐", keys: { meta: true, shift: true,  alt: false, ctrl: false, key: "k" }, display: "⌘⇧K" },
  // ⌘⌥V: Finder에서 복사한 항목을 잘라내기처럼 이동
  { id: 106, description: "이 위치로 이동",         category: "Finder", emoji: "🚚", keys: { meta: true, shift: false, alt: true,  ctrl: false, key: "v" }, display: "⌘⌥V" },

  // ── 창/앱 관리 (추가) ────────────────────────────────────────────────────
  { id: 92,  description: "전체 화면 전환",       category: "창/앱 관리", emoji: "⛶",  keys: { meta: true, shift: false, alt: false, ctrl: true,  key: "f" }, display: "⌘⌃F", browserBlocked: true },
  { id: 93,  description: "다른 앱 모두 숨기기",  category: "창/앱 관리", emoji: "🙈", keys: { meta: true, shift: false, alt: true,  ctrl: false, key: "h" }, display: "⌘⌥H", browserBlocked: true },
  { id: 94,  description: "현재 앱 창 모두 닫기", category: "창/앱 관리", emoji: "❎", keys: { meta: true, shift: false, alt: true,  ctrl: false, key: "w" }, display: "⌘⌥W", browserBlocked: true },

  // ── 시스템 ────────────────────────────────────────────────────────────────
  // 모두 macOS OS 레벨 인터셉트 → keydown 미발생
  { id: 82,  description: "Spotlight 검색",          category: "시스템", emoji: "🔦", keys: { meta: true,  shift: false, alt: false, ctrl: false, key: " "         }, display: "⌘Space",  browserBlocked: true },
  { id: 83,  description: "Finder에서 검색",         category: "시스템", emoji: "📁", keys: { meta: true,  shift: false, alt: true,  ctrl: false, key: " "         }, display: "⌘⌥Space", browserBlocked: true },
  { id: 84,  description: "이모지 및 기호 뷰어",    category: "시스템", emoji: "😊", keys: { meta: true,  shift: false, alt: false, ctrl: true,  key: " "         }, display: "⌘⌃Space", browserBlocked: true },
  { id: 85,  description: "화면 잠금",              category: "시스템", emoji: "🔒", keys: { meta: true,  shift: false, alt: false, ctrl: true,  key: "q"         }, display: "⌘⌃Q",    browserBlocked: true },
  { id: 86,  description: "Dock 보이기/숨기기",     category: "시스템", emoji: "🪄", keys: { meta: true,  shift: false, alt: true,  ctrl: false, key: "d"         }, display: "⌘⌥D",    browserBlocked: true },
  { id: 87,  description: "강제 종료 대화상자",     category: "시스템", emoji: "💥", keys: { meta: true,  shift: false, alt: true,  ctrl: false, key: "escape"    }, display: "⌘⌥⎋",    browserBlocked: true },
  { id: 88,  description: "Mission Control",        category: "시스템", emoji: "🗂️", keys: { meta: false, shift: false, alt: false, ctrl: true,  key: "arrowup"   }, display: "⌃↑",     browserBlocked: true },
  { id: 89,  description: "현재 앱의 모든 창 보기", category: "시스템", emoji: "🪟", keys: { meta: false, shift: false, alt: false, ctrl: true,  key: "arrowdown" }, display: "⌃↓",     browserBlocked: true },
  { id: 90,  description: "다음 Space로 이동",      category: "시스템", emoji: "➡️", keys: { meta: false, shift: false, alt: false, ctrl: true,  key: "arrowright"}, display: "⌃→",     browserBlocked: true },
  { id: 91,  description: "이전 Space로 이동",      category: "시스템", emoji: "⬅️", keys: { meta: false, shift: false, alt: false, ctrl: true,  key: "arrowleft" }, display: "⌃←",     browserBlocked: true },
];

export const CATEGORIES = ["전체", ...new Set(SHORTCUTS.map((s) => s.category))];
