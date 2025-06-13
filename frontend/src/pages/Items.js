import React, { useEffect, useState, useRef, useMemo } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";

// Loading skeleton component
function ItemSkeleton() {
  return (
    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
      <div className="skeleton h-5 w-48"></div>
      <div className="flex space-x-4">
        <div className="skeleton h-4 w-20"></div>
        <div className="skeleton h-4 w-16"></div>
      </div>
    </div>
  );
}

// Virtual list item component
function ItemRow({ index, style, data }) {
  const item = data[index];

  return (
    <div style={style}>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150">
        <Link
          to={`/items/${item.id}`}
          className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 hover:underline"
        >
          {item.name}
        </Link>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
            {item.category}
          </span>
          <span className="font-semibold text-success-600">
            ${item.price.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function Items() {
  const { items, pagination, loading, error, fetchItems } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchItems(1, itemsPerPage, searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, itemsPerPage, fetchItems]);

  // Initial load and page changes
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    if (!searchTerm) {
      fetchItems(currentPage, itemsPerPage, searchTerm);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentPage, fetchItems]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Memoize pagination buttons
  const paginationButtons = useMemo(() => {
    const buttons = [];
    const {
      currentPage: page,
      totalPages,
      hasPrevPage,
      hasNextPage,
    } = pagination;

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={!hasPrevPage}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Previous
      </button>
    );

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b transition-colors duration-200 ${
            i === page
              ? "bg-primary-50 border-primary-500 text-primary-600 z-10"
              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={!hasNextPage}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Next
      </button>
    );

    return buttons;
  }, [pagination]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-danger-100 rounded-full">
            <svg
              className="w-6 h-6 text-danger-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-danger-900 mb-2">
            Error loading items
          </h3>
          <p className="text-danger-700 mb-4">{error}</p>
          <button
            onClick={() => fetchItems(currentPage, itemsPerPage, searchTerm)}
            className="btn-danger"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Items</h1>
        <Link to="/add" className="btn-primary">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Item
        </Link>
      </div>

      {/* Search and controls */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="input-field w-auto"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            {pagination.totalItems > 0 && (
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card">
          {Array.from({ length: 5 }).map((_, index) => (
            <ItemSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Items list */}
      {!loading && items.length > 0 && (
        <div className="card overflow-hidden">
          <List
            height={Math.min(600, items.length * 72)}
            itemCount={items.length}
            itemSize={72}
            itemData={items}
          >
            {ItemRow}
          </List>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          {searchTerm ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No items found
              </h3>
              <p className="text-gray-600 mb-4">
                No items match your search for "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="btn-secondary"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No items yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first item
              </p>
              <Link to="/add" className="btn-primary">
                Add Item
              </Link>
            </>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center">
          <nav
            className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            {paginationButtons}
          </nav>
        </div>
      )}
    </div>
  );
}

export default Items;
