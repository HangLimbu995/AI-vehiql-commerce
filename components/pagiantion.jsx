import React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function createRange(start, end) {
  const range = [];
  for (let i = start; i <= end; i += 1) range.push(i);
  return range;
}

// Props: currentPage, totalPages, onPageChange(page), siblingCount (default 2)
const Pagiantion = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 2,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const firstPage = 1;
  const lastPage = totalPages;

  const startPage = Math.max(firstPage + 1, currentPage - siblingCount);
  const endPage = Math.min(lastPage - 1, currentPage + siblingCount);

  const showLeftEllipsis = startPage > firstPage + 1;
  const showRightEllipsis = endPage < lastPage - 1;

  const middlePages = startPage <= endPage ? createRange(startPage, endPage) : [];

  const handleNavigate = (e, page) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (page < firstPage || page > lastPage || page === currentPage) return;
    onPageChange?.(page);
  };

  const clickableClass = "cursor-pointer";
  const disabledClass = "cursor-default pointer-events-none opacity-50";
  const canGoPrev = currentPage > firstPage;
  const canGoNext = currentPage < lastPage;

  return (
    <div className="mt-8 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={!canGoPrev}
              className={canGoPrev ? clickableClass : disabledClass}
              onClick={(e) => handleNavigate(e, currentPage - 1)}
            />
          </PaginationItem>

          {/* First page */}
          <PaginationItem>
            <PaginationLink
              className={
                currentPage === firstPage ? disabledClass : clickableClass
              }
              isActive={currentPage === firstPage}
              aria-disabled={currentPage === firstPage}
              onClick={(e) => handleNavigate(e, firstPage)}
            >
              {firstPage}
            </PaginationLink>
          </PaginationItem>

          {/* Left ellipsis */}
          {showLeftEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Middle window */}
          {middlePages.map((page) => {
            const isActive = currentPage === page;
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  className={isActive ? disabledClass : clickableClass}
                  isActive={isActive}
                  aria-disabled={isActive}
                  onClick={(e) => handleNavigate(e, page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Right ellipsis */}
          {showRightEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Last page (avoid duplicate when only one page) */}
          {lastPage > firstPage && (
            <PaginationItem>
              <PaginationLink
                className={
                  currentPage === lastPage ? disabledClass : clickableClass
                }
                isActive={currentPage === lastPage}
                aria-disabled={currentPage === lastPage}
                onClick={(e) => handleNavigate(e, lastPage)}
              >
                {lastPage}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              aria-disabled={!canGoNext}
              className={canGoNext ? clickableClass : disabledClass}
              onClick={(e) => handleNavigate(e, currentPage + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Pagiantion;
