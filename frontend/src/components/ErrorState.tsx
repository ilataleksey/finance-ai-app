type ErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

export default function ErrorState({
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center"
      role="alert"
    >
      <p className="font-medium text-red-800">{title}</p>
      <p className="mt-1 text-sm text-red-700">{description}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white"
        >
          Повторить
        </button>
      )}
    </div>
  );
}