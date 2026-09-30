import { SKILLS, type SkillDef } from "../skills";
import type { AnalysisResult, Analyzer, AnalyzeInput, SkillMatch } from "../types";

// 규칙 기반 분석기 (v0)
// AI API 없이 스킬 사전과 정규식만으로 공고와 이력서를 비교한다.
// 1) 공고를 한 줄씩 읽으며 "필수/우대" 구역을 판단하고
// 2) 각 줄에서 사전에 있는 스킬을 찾고
// 3) 이력서에서도 스킬을 찾아 비교해 점수를 낸다.

type Section = "required" | "preferred" | "ignore";

const PREFERRED_HEADING = /(우대|preferred|nice[\s-]to[\s-]have|bonus|plus)/i;
const REQUIRED_HEADING =
  /(자격\s*요건|필수|지원\s*자격|요구\s*(사항|역량)|필요\s*역량|주요\s*업무|담당\s*업무|업무\s*내용|기술\s*스택|requirements?|qualifications?|responsibilities|tech\s*stack)/i;
const IGNORE_HEADING = /(복지|혜택|채용\s*절차|전형\s*절차|근무\s*(조건|환경|형태)|회사\s*소개|benefits|perks|hiring\s*process)/i;

const LIST_ITEM = /^([-•*·∙◦]|\d+[.)])\s*/;

/**
 * 제목처럼 보이는 줄인지 (예: "[우대사항]", "■ 자격요건", "Preferred:")
 * 목록 항목("- Docker 우대")이나 스킬이 들어간 줄은 제목이 아니다.
 */
function isHeading(line: string): boolean {
  return line.length <= 30 && !LIST_ITEM.test(line) && extractSkills(line).size === 0;
}

/** 정규식 특수문자를 일반 문자로 바꾼다 (C++, Node.js 등) */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface AliasPattern {
  skill: SkillDef;
  regex: RegExp;
  length: number;
}

// 영문 표기는 단어 경계를 확인한다. ("Java"가 "JavaScript" 안에서 잡히지 않도록)
// 한글 표기는 조사가 붙기 때문에("리액트를") 경계를 확인하지 않는다.
function buildPattern(alias: string, caseSensitive: boolean): RegExp {
  const body = escapeRegExp(alias);
  const startsLatin = /^[A-Za-z0-9]/.test(alias);
  const endsLatin = /[A-Za-z0-9]$/.test(alias);
  const before = startsLatin ? "(?<![A-Za-z0-9_])" : "";
  const after = endsLatin ? "(?![A-Za-z0-9_])" : "";
  return new RegExp(`${before}${body}${after}`, caseSensitive ? "g" : "gi");
}

// 긴 표기부터 찾는다. "자바스크립트"를 먼저 찾아 지워야 "자바"로 잘못 잡히지 않는다.
const PATTERNS: AliasPattern[] = SKILLS.flatMap((skill) =>
  skill.aliases.map((alias) => ({
    skill,
    regex: buildPattern(alias, skill.caseSensitive ?? false),
    length: alias.length,
  })),
).sort((a, b) => b.length - a.length);

/** 텍스트에서 사전에 있는 스킬 이름들을 찾는다. */
export function extractSkills(text: string): Set<string> {
  const found = new Set<string>();
  let rest = text;
  for (const { skill, regex } of PATTERNS) {
    regex.lastIndex = 0;
    if (regex.test(rest)) {
      found.add(skill.name);
      // 찾은 부분을 공백으로 지워 짧은 표기가 다시 잡히지 않게 한다.
      regex.lastIndex = 0;
      rest = rest.replace(regex, (m) => " ".repeat(m.length));
    }
  }
  return found;
}

/** 공고를 필수/우대 스킬로 나눈다. 같은 스킬이 양쪽에 있으면 필수로 본다. */
export function classifyPosting(posting: string): { required: string[]; preferred: string[] } {
  const required = new Set<string>();
  const preferred = new Set<string>();
  let section: Section = "required";

  for (const raw of posting.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    if (isHeading(line)) {
      if (PREFERRED_HEADING.test(line)) section = "preferred";
      else if (REQUIRED_HEADING.test(line)) section = "required";
      else if (IGNORE_HEADING.test(line)) section = "ignore";
    }

    // "Docker 경험자 우대"처럼 줄 안에 '우대'가 있으면 그 줄은 우대로 본다.
    const lineSection: Section =
      section !== "ignore" && /(우대|preferred|is a plus)/i.test(line) ? "preferred" : section;
    if (lineSection === "ignore") continue;

    for (const skill of extractSkills(line)) {
      (lineSection === "required" ? required : preferred).add(skill);
    }
  }

  for (const skill of required) preferred.delete(skill);
  return { required: [...required], preferred: [...preferred] };
}

const categoryOf = (name: string) => SKILLS.find((s) => s.name === name)!.category;

function toMatches(skills: string[], resumeSkills: Set<string>): SkillMatch[] {
  return skills
    .map((skill) => ({ skill, category: categoryOf(skill), matched: resumeSkills.has(skill) }))
    .sort((a, b) => Number(b.matched) - Number(a.matched));
}

const REQUIRED_WEIGHT = 2;
const PREFERRED_WEIGHT = 1;

/** 필수 2점, 우대 1점으로 가중치를 둔 매칭 점수 (0~100) */
export function calcScore(required: SkillMatch[], preferred: SkillMatch[]): number | null {
  const total = required.length * REQUIRED_WEIGHT + preferred.length * PREFERRED_WEIGHT;
  if (total === 0) return null;
  const got =
    required.filter((s) => s.matched).length * REQUIRED_WEIGHT +
    preferred.filter((s) => s.matched).length * PREFERRED_WEIGHT;
  return Math.round((got / total) * 100);
}

function buildSuggestions(
  required: SkillMatch[],
  preferred: SkillMatch[],
  resumeOnly: string[],
  score: number | null,
): string[] {
  const suggestions: string[] = [];
  if (score === null) return suggestions;

  const missingRequired = required.filter((s) => !s.matched).map((s) => s.skill);
  const missingPreferred = preferred.filter((s) => !s.matched).map((s) => s.skill);
  const total = required.length * REQUIRED_WEIGHT + preferred.length * PREFERRED_WEIGHT;

  if (missingRequired.length > 0) {
    suggestions.push(
      `필수 스킬 중 ${missingRequired.join(", ")} 경험이 이력서에 보이지 않아요. 써 본 적이 있다면 이력서에 명시하고, 없다면 작은 기능이라도 직접 구현해 프로젝트에 추가해 보세요.`,
    );
  }
  if (missingPreferred.length > 0) {
    const gain = Math.round((PREFERRED_WEIGHT / total) * 100);
    suggestions.push(
      `우대 스킬(${missingPreferred.slice(0, 3).join(", ")}) 중 하나를 갖출 때마다 점수가 약 ${gain}점 올라가요.`,
    );
  }
  if (score >= 80) {
    suggestions.push("매칭도가 높아요. 필수 스킬을 사용한 프로젝트 경험을 수치와 함께 강조해 보세요.");
  }
  if (resumeOnly.length > 0) {
    suggestions.push(
      `공고에는 없지만 가진 스킬(${resumeOnly.slice(0, 4).join(", ")})은 자기소개서에서 차별점으로 활용할 수 있어요.`,
    );
  }
  return suggestions;
}

export const ruleBasedAnalyzer: Analyzer = {
  name: "rule-based-v0",

  async analyze({ jobPosting, resume }: AnalyzeInput): Promise<AnalysisResult> {
    const started = performance.now();

    const { required: req, preferred: pref } = classifyPosting(jobPosting);
    const resumeSkills = extractSkills(resume);

    const required = toMatches(req, resumeSkills);
    const preferred = toMatches(pref, resumeSkills);
    const postingSkills = new Set([...req, ...pref]);
    const resumeOnly = [...resumeSkills].filter((s) => !postingSkills.has(s));
    const score = calcScore(required, preferred);

    const summary =
      score === null
        ? "공고에서 기술 스택을 찾지 못했어요. 자격요건과 우대사항 부분을 붙여넣었는지 확인해 주세요."
        : `필수 스킬 ${required.length}개 중 ${required.filter((s) => s.matched).length}개, ` +
          `우대 스킬 ${preferred.length}개 중 ${preferred.filter((s) => s.matched).length}개를 이력서에서 찾았어요.`;

    return {
      analyzer: this.name,
      score,
      required,
      preferred,
      resumeOnly,
      summary,
      suggestions: buildSuggestions(required, preferred, resumeOnly, score),
      elapsedMs: Math.round((performance.now() - started) * 10) / 10,
    };
  },
};
