"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import { SAMPLE_POSTING, SAMPLE_RESUME } from "@/lib/sample";
import ResultView from "./ResultView";

const textareaClass =
  "h-64 w-full resize-y rounded-xl border border-neutral-300 bg-white p-4 text-[15px] leading-relaxed outline-none " +
  "placeholder:text-neutral-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 " +
  "dark:border-neutral-700 dark:bg-neutral-900";

export default function AnalyzerForm() {
  const [jobPosting, setJobPosting] = useState("");
  const [resume, setResume] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPosting, resume }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "분석 중 문제가 생겼어요.");
        return;
      }
      setResult(data);
    } catch {
      setError("서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  function fillSample() {
    setJobPosting(SAMPLE_POSTING);
    setResume(SAMPLE_RESUME);
    setResult(null);
    setError(null);
  }

  const canSubmit = jobPosting.trim() !== "" && resume.trim() !== "" && !loading;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">채용공고</span>
          <textarea
            className={textareaClass}
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            placeholder="채용공고의 주요 업무, 자격요건, 우대사항을 붙여넣으세요"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">내 이력서</span>
          <textarea
            className={textareaClass}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="기술 스택과 프로젝트 경험을 붙여넣으세요"
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canSubmit}
          className="rounded-xl bg-emerald-700 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "분석 중..." : "분석하기"}
        </button>
        <button
          type="button"
          onClick={fillSample}
          className="rounded-xl border border-neutral-300 px-5 py-3 text-[15px] font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          예시 넣기
        </button>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {result && <ResultView result={result} />}
    </div>
  );
}
