import AnalyzerForm from "@/components/AnalyzerForm";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Job Matcher</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">채용공고 매칭 분석기</h1>
        <p className="mt-2 text-[15px] text-neutral-600 dark:text-neutral-400">
          채용공고와 내 이력서를 붙여넣으면 필요한 기술 스택을 뽑아 매칭 점수와 부족한 역량을 알려드려요.
        </p>
      </header>
      <AnalyzerForm />
    </main>
  );
}
