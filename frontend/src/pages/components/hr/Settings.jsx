import React, { useEffect, useState } from "react";
import axios from "axios";
import { hrURI } from "../../../mainApi";

const SettingsPage = () => {
  const [holidayData, setHolidayData] = useState({
    name: "",
    date: "",
    type: "PUBLIC",
  });

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(`${hrURI}/holidays`, {
        withCredentials: true,
      });
      setHolidays(res.data.data || []);
    } catch (err) {
      console.error("Fetch holidays failed", err);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      setLoading(true);
      const res = await axios.post(`${hrURI}/addHoliday`, holidayData, {
        withCredentials: true,
      });

      setMessage({ text: res.data.message, type: "success" });
      setHolidayData({ name: "", date: "", type: "PUBLIC" });
      fetchHolidays();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredHolidays = holidays.filter((h) =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-black text-slate-900">Settings</h2>
        <p className="text-slate-500 font-medium">Manage organization holidays and system preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* --- ADD HOLIDAY FORM --- */}
        <div className="lg:col-span-1 bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] transition-all duration-300">
          <h3 className="text-xl font-bold text-blue-900 mb-6">Add Holiday</h3>

          {message && (
            <div className={`p-3 rounded-xl mb-4 text-sm font-bold text-center border ${
              message.type === "success" 
                ? "bg-emerald-100 border-emerald-200 text-emerald-700" 
                : "bg-rose-100 border-rose-200 text-rose-700"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAddHoliday} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-blue-700 ml-1 mb-1 block">Holiday Name</label>
              <input
                type="text"
                placeholder="e.g. Annual Gala"
                value={holidayData.name}
                onChange={(e) => setHolidayData({ ...holidayData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-blue-700 ml-1 mb-1 block">Date</label>
              <input
                type="date"
                value={holidayData.date}
                onChange={(e) => setHolidayData({ ...holidayData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all font-medium text-slate-700"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-blue-700 ml-1 mb-1 block">Holiday Type</label>
              <select
                value={holidayData.type}
                onChange={(e) => setHolidayData({ ...holidayData, type: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all font-medium text-slate-700 appearance-none"
              >
                <option value="PUBLIC">Public Holiday</option>
                <option value="COMPANY">Company Holiday</option>
                <option value="OPTIONAL">Optional Holiday</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:bg-slate-300 disabled:shadow-none mt-2"
            >
              {loading ? "Processing..." : "Add Holiday"}
            </button>
          </form>
        </div>

        {/* --- HOLIDAY LIST --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* 🔍 Search Bar */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Search holidays by name..."
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-4xl shadow-sm group-hover:shadow-md transition-all outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] transition-all">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Holiday Directory</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500">
                    <th className="py-5 px-8 text-left text-sm font-bold">Holiday Name</th>
                    <th className="py-5 px-4 text-left text-sm font-bold">Scheduled Date</th>
                    <th className="py-5 px-8 text-left text-sm font-bold">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredHolidays.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-12 text-center text-slate-400 italic">
                        No holiday records found in system.
                      </td>
                    </tr>
                  ) : (
                    filteredHolidays.map((h, index) => (
                      <tr 
                        key={h._id} 
                        className={`transition-colors hover:bg-blue-50/40 group ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="py-5 px-8">
                          <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                            {h.name}
                          </span>
                        </td>
                        <td className="py-5 px-4">
                          <span className="text-slate-500 font-mono text-sm bg-slate-100 px-2 py-1 rounded-lg">
                            {new Date(h.date).toLocaleDateString(undefined, { 
                              year: 'numeric', month: 'short', day: 'numeric' 
                            })}
                          </span>
                        </td>
                        <td className="py-5 px-8">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wide ${
                            h.type === "PUBLIC" ? "bg-emerald-100 text-emerald-700" :
                            h.type === "COMPANY" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {h.type}
                          </span>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;