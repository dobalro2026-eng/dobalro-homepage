// 두발로 분류체계 v3. 대표 카테고리만 스탬프와 카테고리 통계에 사용한다.
export const CATEGORIES = {
  "자연": { key: "cat_nature", hex: "#4C7A3F", icon: "nature", description: "본래 자연 그대로의 공간" },
  "식음": { key: "cat_dining", hex: "#C97B2D", icon: "dining", description: "먹고 마시는 것이 방문 목적인 공간" },
  "문화·예술": { key: "cat_culture", hex: "#7B5EA7", icon: "culture", description: "감상·전시·창작이 목적인 공간" },
  "역사·전통": { key: "cat_heritage", hex: "#8A5A3B", icon: "heritage", description: "역사성·전통성이 핵심 가치인 공간" },
  "시장·상권": { key: "cat_market", hex: "#B84A4A", icon: "market", description: "상업 공간 자체가 목적지인 공간" },
  "생활·동네": { key: "cat_neighborhood", hex: "#3E8E8E", icon: "neighborhood", description: "동네 분위기와 일상의 재발견이 중심인 공간" },
  "산업·구조물": { key: "cat_industrial", hex: "#5E6B77", icon: "industrial", description: "기능 시설이 명소화된 공간" },
  "안내소": { key: "cat_info", hex: "#2F6DB5", icon: "info", description: "관광정보와 편의를 제공하는 독립 목적지" },
};

export const TAG_VALUES = {
  functionTags: Object.keys(CATEGORIES),
  senses: ["시각", "청각", "후각", "미각", "촉각"],
  experiences: ["엔터테인먼트", "교육", "심미", "일탈"],
  difficulty: ["Easy", "Normal", "Hard", "Extreme"],
  storyTypes: ["설화", "역사", "인물", "지명유래", "자연사", "민속·의례", "생업·근현대", "미디어"],
  seasons: ["봄", "여름", "가을", "겨울", "사계절무관"],
};

function tagList(value, allowed) {
  const values = Array.isArray(value) ? value : [];
  return [...new Set(values.filter((tag) => typeof tag === "string" && tag.trim() && (!allowed || allowed.includes(tag))))];
}

export function normalizePlace(place) {
  const name = place.name || place.placeName || "";
  let category = place.category;
  const functionTags = tagList(place.functionTags, TAG_VALUES.functionTags);
  // 도서관 주변 공원은 그대로 두고, 도서관 자체인 문화·예술 항목만 재배정한다.
  if (category === "문화·예술" && name.trim().endsWith("도서관")) {
    category = "생활·동네";
    if (!functionTags.includes("문화·예술")) functionTags.push("문화·예술");
  }
  const seasons = tagList(place.seasons, TAG_VALUES.seasons);
  if (!seasons.length) {
    if (category === "자연" && name.trim().endsWith("해수욕장")) seasons.push("여름");
    else if (category === "시장·상권" || name.trim().endsWith("등산로")) seasons.push("사계절무관");
  }
  // 미확인 속성은 빈 값과 검토 상태로 남겨 사실로 추정하지 않는다.
  return {
    ...place,
    category,
    taxonomyVersion: 3,
    functionTags,
    senses: tagList(place.senses, TAG_VALUES.senses),
    experiences: tagList(place.experiences, TAG_VALUES.experiences),
    moods: tagList(place.moods),
    region: { sido: place.region?.sido || null, sigungu: place.region?.sigungu || null },
    difficulty: TAG_VALUES.difficulty.includes(place.difficulty) ? place.difficulty : null,
    // 첫 항목이 주 유형이고 이후 최대 두 항목이 부 유형이다.
    storyTypes: tagList(place.storyTypes, TAG_VALUES.storyTypes).slice(0, 3),
    seasons,
    toneWarning: place.toneWarning === true,
    taxonomyReviewRequired: place.taxonomyReviewRequired !== false || !CATEGORIES[category],
  };
}
