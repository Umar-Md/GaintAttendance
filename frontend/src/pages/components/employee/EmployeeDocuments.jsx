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
  /* LOCAL STORAGE */
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved ? JSON.parse(saved) : [];
  });

  const [searchText, setSearchText] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [uploadCategory, setUploadCategory] =
    useState("Personal");

  const [uploading, setUploading] = useState(false);

  /* SAVE TO LOCAL STORAGE */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(documents)
    );
  }, [documents]);

  /* UPLOAD */
  const handleUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);

    setTimeout(() => {
      const newDoc = {
        id: Date.now(),

        name: file.name,

        type:
          file.type.split("/")[1]?.toUpperCase() ||
          "FILE",

        size: `${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)} MB`,

        date: new Date().toLocaleDateString(),

        category: uploadCategory,

        url: URL.createObjectURL(file),
      };

      setDocuments((prev) => [newDoc, ...prev]);

      setUploading(false);
    }, 800);
  };

  /* VIEW */
  const handleView = (url) => {
    window.open(url, "_blank");
  };

  /* DOWNLOAD */
  const handleDownload = (url, name) => {
    const a = document.createElement("a");

    a.href = url;

    a.download = name;

    a.click();
  };

  /* DELETE */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this document?"))
      return;

    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === id);

      if (doc?.url)
        URL.revokeObjectURL(doc.url);

      return prev.filter((d) => d.id !== id);
    });
  };

  /* FILTER */
  const filteredDocs = documents
    .filter(
      (doc) =>
        selectedCategory === "All" ||
        doc.category === selectedCategory
    )
    .filter((doc) =>
      doc.name
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );

  return (
    <div className="space-y-6 p-3 sm:p-5 lg:p-8">

      {/* HEADER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
        
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

          {/* LEFT */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Documents
            </h2>

            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Categorized & persistent documents
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">

            {/* SEARCH */}
            <div className="relative w-full sm:w-auto">
              
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />

              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
                className="w-full sm:w-64 pl-10 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:border-black text-sm"
              />
            </div>

            {/* CATEGORY */}
            <select
              value={uploadCategory}
              onChange={(e) =>
                setUploadCategory(e.target.value)
              }
              className="w-full sm:w-auto border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:border-black"
            >
              {CATEGORIES.filter(
                (c) => c !== "All"
              ).map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            {/* UPLOAD */}
            <label className="cursor-pointer w-full sm:w-auto">
              
              <div className="flex items-center justify-center gap-2 bg-black hover:bg-slate-800 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all">
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
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
        
        <div className="shrink-0 text-slate-500">
          <Filter size={18} />
        </div>

        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setSelectedCategory(cat)
            }
            className={`shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              selectedCategory === cat
                ? "bg-black text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* MOBILE CARDS */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        
        {filteredDocs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
            No documents found
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm"
            >
              
              {/* TOP */}
              <div className="flex items-start gap-3">
                
                <div className="p-3 rounded-2xl bg-slate-100 text-slate-700 shrink-0">
                  <FileText size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  
                  <h3 className="font-black text-slate-800 wrap-break-word">
                    {doc.name}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {doc.category}
                  </p>
                </div>
              </div>

              {/* INFO */}
              <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
                
                <div>
                  <p className="text-slate-400 font-semibold">
                    Type
                  </p>

                  <p className="font-bold text-slate-700">
                    {doc.type}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 font-semibold">
                    Size
                  </p>

                  <p className="font-bold text-slate-700">
                    {doc.size}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-slate-400 font-semibold">
                    Date
                  </p>

                  <p className="font-bold text-slate-700">
                    {doc.date}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-2 mt-5">
                
                <button
                  onClick={() =>
                    handleView(doc.url)
                  }
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() =>
                    handleDownload(
                      doc.url,
                      doc.name
                    )
                  }
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
                >
                  <Download size={18} />
                </button>

                <button
                  onClick={() =>
                    handleDelete(doc.id)
                  }
                  className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        
        <div className="overflow-x-auto">
          
          <table className="w-full min-w-200 text-sm">
            
            <thead className="bg-black text-white">
              <tr>
                <th className="px-6 py-4 text-left font-black">
                  File
                </th>

                <th className="px-6 py-4 text-center font-black">
                  Category
                </th>

                <th className="px-6 py-4 text-center font-black">
                  Type
                </th>

                <th className="px-6 py-4 text-center font-black">
                  Size
                </th>

                <th className="px-6 py-4 text-center font-black">
                  Date
                </th>

                <th className="px-6 py-4 text-right font-black">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-16 text-slate-500"
                  >
                    No documents found
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >
                    
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        
                        <div className="p-2 rounded-xl bg-slate-100">
                          <FileText
                            size={18}
                            className="text-slate-700"
                          />
                        </div>

                        <span className="font-bold text-slate-800 break-all">
                          {doc.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center font-semibold text-slate-700">
                      {doc.category}
                    </td>

                    <td className="px-6 py-5 text-center text-slate-700">
                      {doc.type}
                    </td>

                    <td className="px-6 py-5 text-center text-slate-700">
                      {doc.size}
                    </td>

                    <td className="px-6 py-5 text-center text-slate-700">
                      {doc.date}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        
                        <button
                          onClick={() =>
                            handleView(doc.url)
                          }
                          className="p-2 rounded-xl hover:bg-slate-100 transition"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleDownload(
                              doc.url,
                              doc.name
                            )
                          }
                          className="p-2 rounded-xl hover:bg-slate-100 transition"
                        >
                          <Download size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(doc.id)
                          }
                          className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPLOADING */}
      {uploading && (
        <div className="fixed bottom-5 right-5 bg-black text-white px-5 py-3 rounded-2xl shadow-2xl font-bold z-50">
          Uploading...
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;