import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/items/${id}`, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Item not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const itemData = await response.json();
        setItem(itemData);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        console.error("Error fetching item:", err);
        setError(err.message);

        if (err.message === "Item not found") {
          setTimeout(() => navigate("/"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItem();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="skeleton h-10 w-32 mb-4"></div>
        </div>
        <div className="card p-8">
          <div className="skeleton h-8 w-64 mb-6"></div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="skeleton h-4 w-20"></div>
              <div className="skeleton h-6 w-24"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="skeleton h-4 w-20"></div>
              <div className="skeleton h-6 w-32"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="skeleton h-4 w-20"></div>
              <div className="skeleton h-6 w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
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
              Error
            </h3>
            <p className="text-danger-700 mb-6">{error}</p>

            <div className="flex justify-center space-x-3">
              <button onClick={() => navigate("/")} className="btn-primary">
                Back to Items
              </button>

              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-600 mb-4">Item not found</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Items
        </button>
      </div>

      {/* Item details card */}
      <div className="card p-8">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 text-balance">
            {item.name}
          </h1>
          <span className="text-3xl font-bold text-success-600">
            ${item.price.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                Category
              </dt>
              <dd>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {item.category}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                Item ID
              </dt>
              <dd className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                {item.id}
              </dd>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Price</dt>
              <dd className="text-2xl font-bold text-success-600">
                ${item.price.toLocaleString()}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
