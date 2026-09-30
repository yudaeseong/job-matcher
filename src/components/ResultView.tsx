import type { AnalysisResult, SkillMatch } from "@/lib/types";

function scoreTone(score: number) {
  if (score >= 80) return { label: "잘 맞아요", bar: "bg-emerald-600", text: "text-emerald-700 dark:text-emerald-400" };
  if (score >= 50) return { label: "보완하면 좋아요", bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" };
  return { label: "준비가 더 필요해요", bar: "bg-rose-500", text: "text-rose-700 dark:text-rose-400" };
}

function SkillList({ title, weight, items }: { title: string; weight: string; items: SkillMatch[] }) {
  const matched = items.filter((s) => s.matched).length;
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-semibold">
          {title} <span className="text-sm font-normal text-neutral-500">({weight})</span>
        </h3>
        <span className="text-sm text-neutral-500">
          {matched} / {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">공고에서 찾은 스킬이 없어요.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.skill} className="flex items-center justify-between gap-3 text-[15px]">
              <span>
                {s.skill} <span className="text-xs text-neutral-500">{s.category}</span>
              </span>
              <span
                className={
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                  (s.matched
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300")
                }
              >
                {s.matched ? "보유" : "부족"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ResultView({ result }: { result: AnalysisResult }) {
  const tone = result.score === null ? null : scoreTone(result.score);

  return (
    <section aria-live="polite" className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        {result.score === null || !tone ? (
          <p className="text-[15px]">{result.summary}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
              <p className="text-5xl font-bold tabular-nums">{result.score}</p>
              <p className="pb-1.5 text-neutral-500">/ 100점</p>
              <p className={`pb-1.5 font-semibold ${tone.text}`}>{tone.label}</p>
            </div>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${result.score}%` }} />
            </div>
            <p className="mt-4 text-[15px]">{result.summary}</p>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SkillList title="필수 스킬" weight="2점" items={result.required} />
        <SkillList title="우대 스킬" weight="1점" items={result.preferred} />
      </div>

      {result.resumeOnly.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-3 font-semibold">공고에 없는 내 강점</h3>
          <div className="flex flex-wrap gap-2">
            {result.resumeOnly.map((s) => (
              <span key={s} className="rounded-full bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.suggestions.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-3 font-semibold">이렇게 보완해 보세요</h3>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
            {result.suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-right text-xs text-neutral-500">
        분석 방식: {result.analyzer} · {result.elapsedMs}ms
      </p>
    </section>
  );
}
