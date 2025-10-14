export const Logo = () => {
  return (
    <div className="flex items-center gap-2 font-bold">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <span className="text-xl">Calendr</span>
    </div>
  )
}