const SettingsPage = () => {
  const company = {
    name: "Gaint Clout Technologies",
    email: "info@gaintclout.com",
    phone: "+91 88972 38849",
    website: "https://gaintclout.com",
    attendance: "https://attendance.gaintclout.com",
    location: "Awfis Elite 4th Floor, Orbit Building, Knowledge City, Hyderabad",
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Company profile and application information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Company Details
          </h2>

          <div className="space-y-4">
            <Info label="Company Name" value={company.name} />
            <Info label="Official Email" value={company.email} />
            <Info label="Phone Number" value={company.phone} />
            <Info label="Office Location" value={company.location} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Platform Links
          </h2>

          <div className="space-y-4">
            <Info label="Website" value={company.website} isLink />
            <Info label="Attendance Portal" value={company.attendance} isLink />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Application Information
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <StatusCard title="App Name" value="GAINT Attendance" />
          <StatusCard title="Status" value="Active" />
          <StatusCard title="Managed By" value="Gaint Clout Technologies" />
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value, isLink = false }) => {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>

      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-base font-semibold text-blue-600 hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="text-base font-semibold text-slate-800">{value}</p>
      )}
    </div>
  );
};

const StatusCard = ({ title, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
};

export default SettingsPage;
