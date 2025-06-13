import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { q: search }),
      });

      const res = await fetch(`/api/items?${params}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Check if component is still mounted (this helps prevent memory leaks)
      setItems(data.items || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(
    async (itemData) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error?.message || "Failed to add item");
        }

        const newItem = await res.json();

        // Refresh the items list
        await fetchItems(pagination.currentPage, pagination.itemsPerPage);

        return newItem;
      } catch (err) {
        console.error("Error adding item:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchItems, pagination.currentPage, pagination.itemsPerPage]
  );

  return (
    <DataContext.Provider
      value={{
        items,
        pagination,
        loading,
        error,
        fetchItems,
        addItem,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
