import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../state/DataContext";

function AddItem() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
  });
  const [errors, setErrors] = useState({});
  const { addItem, loading } = useData();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = "Price must be a valid non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await addItem({
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
      });

      setFormData({ name: "", category: "", price: "" });
      navigate("/");
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

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

      <div className="card p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Item
          </h1>
          <p className="text-gray-600">
            Fill in the details below to add a new item to your inventory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? "input-error" : ""}`}
              placeholder="Enter item name"
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-2 text-sm text-danger-600">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`input-field ${errors.category ? "input-error" : ""}`}
              placeholder="e.g., Electronics, Furniture, Clothing"
              aria-describedby={errors.category ? "category-error" : undefined}
            />
            {errors.category && (
              <p id="category-error" className="mt-sm text-sm text-danger-600">
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Price <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`input-field pl-7 ${
                  errors.price ? "input-error" : ""
                }`}
                placeholder="0.00"
                aria-describedby={errors.price ? "price-error" : undefined}
              />
            </div>
            {errors.price && (
              <p id="price-error" className="mt-2 text-sm text-danger-600">
                {errors.price}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-success inline-flex items-center"
            >
              {loading && <div className="loading-spinner mr-2"></div>}
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItem;
