// 분석기 입력과 결과의 모양(타입)을 한곳에 정의한다.
// 규칙 기반 분석기(v0)와 나중에 만들 Claude 분석기(v1)가 같은 타입을 쓰므로,
// 화면 코드는 어떤 분석기를 쓰는지 몰라도 된다.

export type SkillCategory =
  | "언어"
  | "프론트엔드"
  | "백엔드"
  | "데이터베이스"
  | "인프라·클라우드"
  | "AI·데이터"
  | "협업·도구";

export interface AnalyzeInput {
  jobPosting: string;
  resume: string;
}

export interface SkillMatch {
  skill: string;
  category: SkillCategory;
  /** 이력서에 이 스킬이 있는지 */
  matched: boolean;
}

export interface AnalysisResult {
  /** 어떤 분석기가 만든 결과인지 (예: "rule-based-v0") */
  analyzer: string;
  /** 0~100 매칭 점수. 공고에서 스킬을 하나도 못 찾으면 null */
  score: number | null;
  /** 공고의 필수 스킬 */
  required: SkillMatch[];
  /** 공고의 우대 스킬 */
  preferred: SkillMatch[];
  /** 공고에는 없지만 이력서에 있는 스킬 (추가 강점) */
  resumeOnly: string[];
  summary: string;
  suggestions: string[];
  /** 분석에 걸린 시간(ms) */
  elapsedMs: number;
}

export interface Analyzer {
  name: string;
  analyze(input: AnalyzeInput): Promise<AnalysisResult>;
}
