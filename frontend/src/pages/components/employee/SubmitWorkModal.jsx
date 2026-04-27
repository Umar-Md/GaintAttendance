import React, { useState } from "react";
import axios from "axios";
import { CLOUD_NAME, employeeTaskURI, preset } from "../../../mainApi";
import { X, Upload, CheckCircle2 } from "lucide-react";

const SubmitWorkModal = ({ task, close, reload }) => {
  const [description, setDescription] = useState(task.description || "");
  const [progress, setProgress] = useState(task.progress || 0);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const submitWork = async () => {
    try {
      setLoading(true);
      const uploadedFiles = [];

      for (let file of files) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", preset);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          data
        );

        uploadedFiles.push({
          url: res.data.secure_url,
          name: file.name,
          type: file.type,
        });
      }

      await axios.put(
        `${employeeTaskURI}/task/${task._id}/work`,
        {
          description,
          progress,
          attachments: uploadedFiles,
        },
        { withCredentials: true }
      );

      reload();
      close();
    } catch (err) {
      alert("Failed to submit work");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 transition-opacity"
        onClick={close}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Submit Work</h3>
              <p className="text-xs text-slate-500">Update your progress and attach files</p>
            </div>
            <button 
              onClick={close}
              className="p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700   mb-2">
                Work Description
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none resize-none bg-slate-50/30"
                rows="4"
                placeholder="Describe what you worked on today..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Progress Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-s font-bold text-slate-700  ">
                  Completion
                </label>
                <span className="text-m font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {progress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* File Upload UI */}
            <div className="space-y-2">
              <label className="block text-s font-bold text-slate-700  ">
                Attachments
              </label>
              <div className="relative group">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles([...e.target.files])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mb-2" />
                  <span className="text-[12px] font-medium text-slate-600 group-hover:text-indigo-600">
                    {files.length > 0 ? `${files.length} files selected` : "Click or drag to upload files"}
                  </span>
                </div>
              </div>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {files.slice(0, 3).map((f, i) => (
                    <span key={i} className="text-[12px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 truncate max-w-30">
                      {f.name}
                    </span>
                  ))}
                  {files.length > 3 && <span className="text-[12px] text-slate-400">+{files.length - 3} more</span>}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={close}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              onClick={submitWork}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Work</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitWorkModal;