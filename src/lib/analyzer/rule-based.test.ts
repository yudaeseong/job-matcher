import { describe, expect, it } from "vitest";
import { calcScore, classifyPosting, extractSkills, ruleBasedAnalyzer } from "./rule-based";
import { SAMPLE_POSTING, SAMPLE_RESUME } from "../sample";

describe("extractSkills", () => {
  it("JavaScript 안의 Java를 따로 잡지 않는다", () => {
    expect([...extractSkills("JavaScript 개발자")]).toEqual(["JavaScript"]);
    expect([...extractSkills("자바스크립트 개발자")]).toEqual(["JavaScript"]);
  });

  it("한글 표기와 조사를 처리한다", () => {
    const found = extractSkills("리액트를 쓰고 파이썬으로 서버를 만들었어요");
    expect(found).toEqual(new Set(["React", "Python"]));
  });

  it("Git과 GitHub를 구분한다", () => {
    expect(extractSkills("GitHub 사용")).toEqual(new Set(["GitHub"]));
    expect(extractSkills("Git, GitHub 사용")).toEqual(new Set(["Git", "GitHub"]));
  });

  it("긴 표기를 먼저 찾는다 (React Native, Claude Code)", () => {
    expect(extractSkills("React Native 앱")).toEqual(new Set(["React Native"]));
    expect(extractSkills("Claude Code 활용")).toEqual(new Set(["AI 코딩 도구"]));
  });

  it("Go는 대소문자를 구분해 일반 단어와 헷갈리지 않는다", () => {
    expect(extractSkills("let's go")).toEqual(new Set());
    expect(extractSkills("Go 언어 경험")).toEqual(new Set(["Go"]));
  });
});

describe("classifyPosting", () => {
  it("우대사항 구역의 스킬은 우대로 분류한다", () => {
    const { required, preferred } = classifyPosting("자격요건\n- React\n\n우대사항\n- Docker");
    expect(required).toEqual(["React"]);
    expect(preferred).toEqual(["Docker"]);
  });

  it("목록 항목의 '우대'는 그 줄만 우대로 보고 구역을 바꾸지 않는다", () => {
    const { required, preferred } = classifyPosting("자격요건\n- React\n- Docker 우대\n- TypeScript");
    expect(required.sort()).toEqual(["React", "TypeScript"]);
    expect(preferred).toEqual(["Docker"]);
  });

  it("복지 구역은 무시한다", () => {
    const { required, preferred } = classifyPosting("자격요건\n- React\n복지\n- AWS 교육비 지원");
    expect(required).toEqual(["React"]);
    expect(preferred).toEqual([]);
  });
});

describe("calcScore", () => {
  it("필수 2점, 우대 1점으로 계산한다", () => {
    const m = (matched: boolean) => ({ skill: "x", category: "언어" as const, matched });
    // 필수 2개 중 1개(2점) + 우대 2개 중 2개(2점) = 4 / 6
    expect(calcScore([m(true), m(false)], [m(true), m(true)])).toBe(67);
  });

  it("스킬이 없으면 null", () => {
    expect(calcScore([], [])).toBeNull();
  });
});

describe("ruleBasedAnalyzer", () => {
  it("예시 공고와 이력서를 분석한다", async () => {
    const result = await ruleBasedAnalyzer.analyze({ jobPosting: SAMPLE_POSTING, resume: SAMPLE_RESUME });
    const names = (list: { skill: string }[]) => list.map((s) => s.skill).sort();

    expect(names(result.required)).toEqual(
      ["Git", "LLM", "Next.js", "Node.js", "PostgreSQL", "REST API", "React", "TypeScript", "프롬프트 엔지니어링"].sort(),
    );
    expect(names(result.preferred)).toEqual(["AI 에이전트", "AI 코딩 도구", "AWS", "Docker", "RAG", "테스트 코드"].sort());
    expect(result.score).not.toBeNull();
    expect(result.resumeOnly).toContain("Python");
  });
});
