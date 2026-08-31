import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background-light px-4">
      <div className="text-center max-w-lg">
        <span className="material-icons text-mosque text-6xl mb-4">search_off</span>
        <h1 className="text-4xl font-display font-semibold text-nordic-dark mb-4">Propiedad no encontrada</h1>
        <p className="text-nordic-dark/70 text-lg mb-8">
          Probablemente ya se vendió, pero tenemos opciones similares por la zona que te encantarán.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-mosque hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <span className="material-icons text-sm">arrow_back</span>
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
