export function normalizeToken(s: string): string {
  return s
    .toLowerCase()
    .replace(/[#\s]+/g, " ")
    .replace(/[^a-z0-9가-힣\s\-/]/g, "")
    .trim();
}

const categoryAliases: Record<string, string[]> = {
  "교육": ["education", "learning"],
  "안전": ["safety"],
  "환경": ["environment", "eco"],
  "복지": ["welfare"],
  "의료": ["health", "medical"],
  "아동": ["child", "kids"],
  "노인": ["senior", "elder"],
  "장애": ["disability", "accessibility", "a11y"],
};

export function generateMatchingTags(input: {
  type: "needs" | "gives";
  category?: string;
  title?: string;
  description?: string;
  skills?: string[];
  tags?: string[];
}): string[] {
  const tokens = new Set<string>();

  const add = (v?: string | string[]) => {
    if (!v) return;
    if (Array.isArray(v)) v.forEach((x) => add(x));
    else {
      const n = normalizeToken(v);
      if (n) tokens.add(n);
      // split words for english/korean basic tokenization
      n.split(/[\s/\-]+/).forEach((w) => {
        const ww = w.trim();
        if (ww.length >= 2) tokens.add(ww);
      });
    }
  };

  add(input.category);
  if (input.category) {
    const alias = categoryAliases[input.category] || [];
    alias.forEach((a) => add(a));
  }

  add(input.tags || []);
  add(input.skills || []);

  // From title/description pick a few longer words
  const pickKeywords = (text?: string) => {
    if (!text) return [] as string[];
    const words = normalizeToken(text).split(/\s+/);
    return words.filter((w) => w.length >= 3).slice(0, 5);
  };
  add(pickKeywords(input.title));
  add(pickKeywords(input.description));

  // add type marker lightly
  tokens.add(input.type);

  return Array.from(tokens);
}
