import React, { useState, useEffect } from "react";
import {
  Upload,
  Eye,
  Download,
  Trash2,
  FileText,
  Search,
  Filter,
} from "lucide-react";

const STORAGE_KEY = "employee_documents";

const CATEGORIES = [
  "All",
  "Personal",
  "Payslip",
  "Legal",
  "Employment",
  "Benefits",
];

const EmployeeDocuments = () => {
  // 🔹 Load docs from localStorage
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [uploadCategory, setUploadCategory] = useState("Personal");
  const [uploading, setUploading] = useState(false);

  // 🔹 Persist docs
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  // 📤 Upload
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    setTimeout(() => {
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: file.type.split("/")[1]?.toUpperCase() || "FILE",
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        date: new Date().toLocaleDateString(),
        category: uploadCategory,
        url: URL.createObjectURL(file),
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setUploading(false);
    }, 800);
  };

  // 👁 View
  const handleView = (url) => {
    window.open(url, "_blank");
  };

  // ⬇ Download
  const handleDownload = (url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  // ❌ Delete
  const handleDelete = (id) => {
    if (!window.confirm("Delete this document?")) return;

    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === id);
      if (doc?.url) URL.revokeObjectURL(doc.url);
      return prev.filter((d) => d.id !== id);
    });
  };

  // 🔍 Filter + Search
  const filteredDocs = documents
    .filter(
      (doc) =>
        selectedCategory === "All" || doc.category === selectedCategory
    )
    .filter((doc) =>
      doc.name.toLowerCase().includes(searchText.toLowerCase())
    );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-white p-6 rounded-xl border">
        <div>
          <h2 className="text-2xl font-black text-black">Documents</h2>
          <p className="text-gray-500 text-sm">
            Categorized & persistent documents
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Upload Category */}
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            {CATEGORIES.filter((c) => c !== "All").map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          {/* Upload */}
          <label className="cursor-pointer">
            <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900">
              <Upload size={16} />
              Upload
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex gap-3 overflow-x-auto">
        <Filter className="text-gray-500 mt-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${
              selectedCategory === cat
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-4 py-3 text-left">File</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No documents found
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="border-t odd:bg-white even:bg-gray-50 transition hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center gap-2 font-semibold">
                    <FileText size={16} />
                    {doc.name}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {doc.category}
                  </td>
                  <td className="px-4 py-3 text-center">{doc.type}</td>
                  <td className="px-4 py-3 text-center">{doc.size}</td>
                  <td className="px-4 py-3 text-center">{doc.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleView(doc.url)}>
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDownload(doc.url, doc.name)}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* UPLOADING */}
      {uploading && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-xl shadow-xl">
          Uploading...
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
