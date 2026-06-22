import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Camera, CheckCircle, Fingerprint, Loader2, XCircle } from "lucide-react";
import { userURI } from "../../mainApi";
import { getFaceDescriptorFromImage, loadFaceModels } from "../../utils/faceRecognition";

const FaceEnrollment = ({ faceRegisteredAt, onRegistered }) => {
  const webcamRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const hasFace = Boolean(faceRegisteredAt);

  const handleOpen = async () => {
    setOpen(true);
    setMessage(null);

    try {
      setLoading(true);
      await loadFaceModels();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Face models could not be loaded.",
      });
    } finally {
      setLoading(false);
    }
  };

  const enrollFace = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const imageSrc = webcamRef.current?.getScreenshot();

      if (!imageSrc) {
        throw new Error("Camera capture failed");
      }

      const faceDescriptor = await getFaceDescriptorFromImage(imageSrc);

      const res = await axios.patch(
        `${userURI}/face-enrollment`,
        { faceDescriptor },
        { withCredentials: true }
      );

      setMessage({ type: "success", text: res.data.message });
      onRegistered?.();
      setTimeout(() => setOpen(false), 700);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Face registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${hasFace ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            <Fingerprint size={22} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">
              {hasFace ? "Face Registered" : "Face Not Registered"}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              {hasFace
                ? `Updated ${new Date(faceRegisteredAt).toLocaleDateString()}`
                : "Required before clock-in and clock-out"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-black"
        >
          <Camera size={16} />
          {hasFace ? "Update Face" : "Register Face"}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Face Enrollment</h3>
                <p className="text-sm font-semibold text-slate-500">
                  Keep your face centered with good lighting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <XCircle size={22} />
              </button>
            </div>

            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-950">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="h-full w-full object-cover scale-x-[-1]"
              />
              <div className="pointer-events-none absolute inset-6 rounded-full border-2 border-dashed border-white/40" />
            </div>

            {message && (
              <div
                className={`mt-4 rounded-2xl p-3 text-center text-sm font-bold ${
                  message.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="button"
              onClick={enrollFace}
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-black text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              Save Registered Face
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FaceEnrollment;
