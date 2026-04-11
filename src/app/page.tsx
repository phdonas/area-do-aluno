import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="text-center space-y-6 max-w-2xl px-6 py-12 bg-surface rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] border border-border-custom">
        <div className="w-16 h-16 bg-primary rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Área do Aluno | LMS
          </h1>
          <p className="mt-2 text-lg text-text-secondary">
            Ecossistema Digital Prof. Paulo H. Donassolo
          </p>
        </div>
        
        <div className="pt-4 flex gap-4 justify-center">
          <Link 
            href="/login"
            className="px-8 py-4 bg-primary text-white font-black text-xs uppercase tracking-[.25em] rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
          >
            Acessar Plataforma
          </Link>
        </div>
      </div>
    </main>
  );
}
