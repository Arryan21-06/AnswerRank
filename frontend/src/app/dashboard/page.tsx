export default function DashboardPage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-black mb-2">Welcome to AnswerRank</h2>
      <p className="text-zinc-600 max-w-md">
        This is your dashboard shell. It&apos;s ready for data integration in the next phase. Select an option from the sidebar to get started.
      </p>
    </div>
  );
}
