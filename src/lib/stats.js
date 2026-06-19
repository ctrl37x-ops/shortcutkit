const STREAK_KEY = 'shortcutkit_streak';

export function getStreak() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY)) ?? { lastDate: '', streak: 0, todayCount: 0 };
  } catch {
    return { lastDate: '', streak: 0, todayCount: 0 };
  }
}

export function recordActivity(count = 1) {
  if (count <= 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const data = getStreak();

  if (data.lastDate === today) {
    data.todayCount += count;
  } else if (data.lastDate === yesterday) {
    data.streak += 1;
    data.todayCount = count;
    data.lastDate = today;
  } else {
    data.streak = 1;
    data.todayCount = count;
    data.lastDate = today;
  }

  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  return data;
}
