import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaBoxOpen, FaSearch } from "react-icons/fa";
import "./stackmanager.css";

const sizeColorMap = [
  { micron: 36, meter: 20, size: '1/2"', color: "Transparent" },
  { micron: 38, meter: 25, size: '3/4"', color: "Brown" },
  { micron: 40, meter: 30, size: '1"', color: "Spl Brown" },
  { micron: 42, meter: 35, size: '1 1/2"', color: "Black" },
  { micron: 44, meter: 40, size: '2"', color: "Red" },
  { micron: 48, meter: 45, size: '2 1/2"', color: "Yellow" },
  { micron: 50, meter: 50, size: '3"', color: "Blue" },
  { micron: 52, meter: 55, size: '3 1/2"', color: "Green" },
  { micron: 54, meter: 60, size: '4"', color: "Orange" },
  { micron: null, meter: 65, size: '5"', color: "Milky White" },
];

const allMicrons = [
  36, 38, 40, 42, 44, 48, 50, 52, 54, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120,
  140, 150, 180, 200, 220, 250, 280, 300, 350, 400, 450, 480, 500, 750, 1000,
];

const allColors = [
  "Transparent",
  "Brown",
  "Spl Brown",
  "Black",
  "Red",
  "Yellow",
  "Blue",
  "Green",
  "Orange",
  "Milky White",
  "White",
  "Gray",
  "Pink",
  "Purple",
  "Violet",
  "Multi-color",
];

const allMeters = [
  20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120,
  140, 150, 180, 200, 220, 250, 280, 300, 350, 400, 450, 480, 500, 750, 1000,
];

const allSizes = [
  '1/2"',
  '3/4"',
  '1"',
  '1 1/2"',
  '2"',
  '2 1/2"',
  '3"',
  '3 1/2"',
  '4"',
  '5"',
  '6"',
  '8"',
  '10"',
  '12"',
];

const StackManager = ({
  title,
  initialData = [],
  fetchData,
  saveData,
  deleteData,
}) => {
  const [stacks, setStacks] = useState(initialData);
  const [formData, setFormData] = useState({
    id: null,
    micron: "",
    meter: "",
    size: "",
    color: "",
    stock: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);

  useEffect(() => {
    if (fetchData) {
      fetchData().then(setStacks).catch(console.error);
    }
  }, [fetchData]);

  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
  }, [showForm]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.micron) newErrors.micron = "Micron is required";
    if (!formData.meter) newErrors.meter = "Meter is required";
    if (!formData.size) newErrors.size = "Size is required";
    if (!formData.color) newErrors.color = "Color is required";
    if (!formData.stock || formData.stock <= 0)
      newErrors.stock = "Valid stock is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const stackData = {
      ...formData,
      micron: parseInt(formData.micron),
      meter: parseInt(formData.meter),
      stock: parseInt(formData.stock),
      last_updated: new Date().toISOString(),
    };

    try {
      if (saveData) {
        await saveData(stackData);
        const data = await fetchData();
        setStacks(data);
      } else {
        if (formData.id) {
          setStacks((prev) =>
            prev.map((s) => (s.id === formData.id ? stackData : s))
          );
        } else {
          stackData.id = stacks.length
            ? Math.max(...stacks.map((s) => s.id)) + 1
            : 1;
          setStacks((prev) => [...prev, stackData]);
        }
      }
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      micron: "",
      meter: "",
      size: "",
      color: "",
      stock: "",
    });
    setErrors({});
    setIsSubmitting(false);
    setShowForm(false);
  };

  const handleEdit = (stack) => {
    setFormData({ ...stack });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    if (deleteData) {
      await deleteData(id);
      const updated = await fetchData();
      setStacks(updated);
    } else {
      setStacks((prev) => prev.filter((stack) => stack.id !== id));
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredStacks = stacks.filter((stack) => {
    const term = searchTerm.toLowerCase();
    return (
      stack.color.toLowerCase().includes(term) ||
      stack.size.toLowerCase().includes(term) ||
      stack.micron?.toString().includes(searchTerm) ||
      stack.meter?.toString().includes(searchTerm) ||
      stack.stock?.toString().includes(searchTerm)
    );
  });

  return (
    <div className="main-content">
      <div className="content-header">
        <h1>
          <FaBoxOpen /> {title}
        </h1>
        <div className="header-actions">
          <div className={`search-container ${searchFocus ? "focused" : ""}`}>
            {/* <FaSearch className="search-icon" /> */}
            <input
              placeholder="Search stacks..."
              className="search-box input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FaPlus /> Add New
          </button>
        </div>
      </div>

      {showForm && (
        <>
          <div className="overlay" onClick={resetForm} />
          <div className="stack-form slide-down">
            <h2>{formData.id ? "Edit Stack" : "Add New Stack"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Size</label>
                  <select
                    className={errors.size ? "error" : ""}
                    value={formData.size}
                    onChange={(e) => handleFieldChange("size", e.target.value)}
                  >
                    <option value="">Select Size</option>
                    {allSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {errors.size && (
                    <div className="error-message">{errors.size}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <select
                    className={errors.color ? "error" : ""}
                    value={formData.color}
                    onChange={(e) => handleFieldChange("color", e.target.value)}
                  >
                    <option value="">Select Color</option>
                    {allColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                  {errors.color && (
                    <div className="error-message">{errors.color}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Micron</label>
                  <select
                    className={errors.micron ? "error" : ""}
                    value={formData.micron}
                    onChange={(e) =>
                      handleFieldChange("micron", e.target.value)
                    }
                  >
                    <option value="">Select Micron</option>
                    {allMicrons.map((micron) => (
                      <option key={micron} value={micron}>
                        {micron}
                      </option>
                    ))}
                  </select>
                  {errors.micron && (
                    <div className="error-message">{errors.micron}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Meter</label>
                  <select
                    className={errors.meter ? "error" : ""}
                    value={formData.meter}
                    onChange={(e) => handleFieldChange("meter", e.target.value)}
                  >
                    <option value="">Select Meter</option>
                    {allMeters.map((meter) => (
                      <option key={meter} value={meter}>
                        {meter}
                      </option>
                    ))}
                  </select>
                  {errors.meter && (
                    <div className="error-message">{errors.meter}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  className={errors.stock ? "error" : ""}
                  value={formData.stock}
                  onChange={(e) => handleFieldChange("stock", e.target.value)}
                />
                {errors.stock && (
                  <div className="error-message">{errors.stock}</div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <div className="table-container">
        {searchTerm && (
          <div className="search-results-info">
            Showing {filteredStacks.length} results for "{searchTerm}"
          </div>
        )}
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Micron</th>
              <th>Meter</th>
              <th>Size</th>
              <th>Color</th>
              <th>Stock</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStacks.length ? (
              filteredStacks.map((stack) => (
                <tr key={stack.id}>
                  <td>{stack.micron || "-"}</td>
                  <td>{stack.meter || "-"}</td>
                  <td>{stack.size || "-"}</td>
                  <td>{stack.color || "-"}</td>
                  <td className={stack.stock < 10 ? "low-stock" : "stock"}>
                    {stack.stock || 0}
                  </td>
                  <td>
                    {stack.last_updated
                      ? new Date(stack.last_updated).toLocaleString()
                      : "-"}
                  </td>
                  <td className="action-btns">
                    <button
                      className="btn btn-edit btn-sm"
                      onClick={() => handleEdit(stack)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(stack.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  {searchTerm
                    ? "No matching stacks found"
                    : "No stacks available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StackManager;
