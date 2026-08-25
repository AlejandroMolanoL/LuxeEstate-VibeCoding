import Link from 'next/link';
import { FilterType } from '@/lib/properties';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  filter: FilterType;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  filter,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams();
    if (filter !== 'All') params.set('filter', filter);
    params.set('page', String(page));
    return `/?${params.toString()}`;
  }

  // Build page number range (show at most 5 pages centered around current)
  const delta = 2;
  const start = Math.max(1, currentPage - delta);
  const end = Math.min(totalPages, currentPage + delta);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      {/* Prev */}
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="flex items-center gap-1 px-4 py-2 bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all hover:shadow-md"
          aria-label="Previous page"
        >
          <span className="material-icons text-base">chevron_left</span>
          Prev
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-4 py-2 bg-white border border-nordic-dark/5 text-nordic-muted/40 text-sm font-medium rounded-lg cursor-not-allowed select-none">
          <span className="material-icons text-base">chevron_left</span>
          Prev
        </span>
      )}

      {/* Page numbers */}
      {start > 1 && (
        <>
          <Link
            href={buildHref(1)}
            className="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque transition-all"
          >
            1
          </Link>
          {start > 2 && (
            <span className="w-10 h-10 flex items-center justify-center text-nordic-muted text-sm">
              …
            </span>
          )}
        </>
      )}

      {pages.map((page) => {
        const isActive = page === currentPage;
        return isActive ? (
          <span
            key={page}
            aria-current="page"
            className="w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg bg-nordic-dark text-white shadow-sm"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque transition-all"
          >
            {page}
          </Link>
        );
      })}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="w-10 h-10 flex items-center justify-center text-nordic-muted text-sm">
              …
            </span>
          )}
          <Link
            href={buildHref(totalPages)}
            className="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque transition-all"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="flex items-center gap-1 px-4 py-2 bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all hover:shadow-md"
          aria-label="Next page"
        >
          Next
          <span className="material-icons text-base">chevron_right</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-4 py-2 bg-white border border-nordic-dark/5 text-nordic-muted/40 text-sm font-medium rounded-lg cursor-not-allowed select-none">
          Next
          <span className="material-icons text-base">chevron_right</span>
        </span>
      )}
    </div>
  );
}
