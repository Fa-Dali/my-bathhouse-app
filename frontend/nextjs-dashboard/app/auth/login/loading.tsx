// frontend/nextjs-dashboard/app/auth/login/loading.tsx

export default function LoadingPage() {
  return (
    <div className="loading-page w-full h-full flex flex-col items-center justify-center">
      <img
        src="/static-images/logos/logo.png"
        width={200}
        height={100}
        alt="Logo"
        className="loading-image"
      />
      <p className="loading-text text-emerald-900 mt-4">Загрузка...</p>
    </div>
  );
}
