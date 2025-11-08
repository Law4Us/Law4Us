export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#019FB7', borderTopColor: 'transparent' }}
      />
      <span className="text-neutral-dark">טוען מאמרים נוספים...</span>
    </div>
  )
}
