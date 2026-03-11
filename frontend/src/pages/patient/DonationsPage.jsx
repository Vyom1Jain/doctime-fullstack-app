import React, { useEffect, useState } from "react";
import { donationApi, doctorApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const DonationsPage = () => {
  const { user } = useAuth();
  const isDoctor = user?.role === "DOCTOR";
  const isPatient = user?.role === "PATIENT";
  const [donations, setDonations] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active | pending (doctor only)
  const [donatingId, setDonatingId] = useState(null);
  const [donateAmount, setDonateAmount] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    type: "MONEY",
    urgency: "MEDIUM",
    targetAmount: "",
    bloodType: "",
    unitsNeeded: "",
    medicineList: "",
    requestedDoctorId: "",
  });

  useEffect(() => {
    fetchDonations();
    if (isDoctor) fetchPending();
    if (isPatient) fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await doctorApi.getAll();
      setDoctors(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await donationApi.getActive();
      setDonations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await donationApi.getPending();
      setPendingDonations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const openDonateModal = (id) => {
    setDonatingId(id);
    setDonateAmount("");
    setShowModal(true);
  };

  const handleDonate = async () => {
    const amount = Number(donateAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      const res = await donationApi.contribute(donatingId, amount);
      setDonations((prev) =>
        prev.map((d) =>
          d.id === donatingId
            ? {
                ...d,
                raisedAmount: res.data.raisedAmount,
                status: res.data.status,
              }
            : d,
        ),
      );
      alert(`Thank you! Your donation of ₹${amount} has been recorded.`);
      setShowModal(false);
      setDonatingId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to process donation. Please try again.");
    }
  };

  const handleVerify = async (id) => {
    try {
      await donationApi.verify(id);
      setPendingDonations((prev) => prev.filter((d) => d.id !== id));
      fetchDonations();
      alert("Donation request approved and is now visible to others!");
    } catch (e) {
      alert(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Failed to approve donation",
      );
    }
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    if (!createForm.title || !createForm.description) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      const payload = {
        title: createForm.title,
        description: createForm.description,
        type: createForm.type,
        urgency: createForm.urgency,
        targetAmount:
          createForm.type === "MONEY" && createForm.targetAmount
            ? Number(createForm.targetAmount)
            : null,
        bloodType: createForm.type === "BLOOD" ? createForm.bloodType : null,
        unitsNeeded:
          createForm.type === "BLOOD" && createForm.unitsNeeded
            ? Number(createForm.unitsNeeded)
            : null,
        medicineList:
          createForm.type === "MEDICINE" ? createForm.medicineList : null,
        requestedDoctorId: createForm.requestedDoctorId
          ? Number(createForm.requestedDoctorId)
          : null,
      };
      await donationApi.create(user.userId, payload);
      alert(
        "Donation request created! It will be visible to others once your doctor approves it.",
      );
      setShowCreateForm(false);
      setCreateForm({
        title: "",
        description: "",
        type: "MONEY",
        urgency: "MEDIUM",
        targetAmount: "",
        bloodType: "",
        unitsNeeded: "",
        medicineList: "",
        requestedDoctorId: "",
      });
      setLoading(true);
      fetchDonations();
    } catch (e) {
      console.error(e);
      alert(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Failed to create donation request.",
      );
    }
  };

  const renderTypeSpecificFields = () => {
    if (createForm.type === "MONEY") {
      return (
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Target Amount (₹) *
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g. 50000"
            value={createForm.targetAmount}
            onChange={(e) =>
              setCreateForm({ ...createForm, targetAmount: e.target.value })
            }
          />
        </div>
      );
    }
    if (createForm.type === "BLOOD") {
      return (
        <>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Blood Type *
            </label>
            <select
              className="input-field"
              value={createForm.bloodType}
              onChange={(e) =>
                setCreateForm({ ...createForm, bloodType: e.target.value })
              }>
              <option value="">Select blood type</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Units Needed
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 2"
              min="1"
              value={createForm.unitsNeeded}
              onChange={(e) =>
                setCreateForm({ ...createForm, unitsNeeded: e.target.value })
              }
            />
          </div>
        </>
      );
    }
    if (createForm.type === "MEDICINE") {
      return (
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Medicine List *
          </label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="List the medicines you need, one per line..."
            value={createForm.medicineList}
            onChange={(e) =>
              setCreateForm({ ...createForm, medicineList: e.target.value })
            }
          />
        </div>
      );
    }
    return null;
  };

  const renderDonationCard = (d, isPending = false) => {
    const isMoney = d.type === "MONEY";
    const isBlood = d.type === "BLOOD";
    const isMedicine = d.type === "MEDICINE";
    const progress =
      isMoney && d.targetAmount
        ? Math.min(100, ((d.raisedAmount || 0) / d.targetAmount) * 100)
        : 0;

    const typeIcons = { MONEY: "💰", BLOOD: "🩸", MEDICINE: "💊", OTHER: "🤝" };
    const typeColors = {
      MONEY: "bg-green-50 text-green-700",
      BLOOD: "bg-red-50 text-red-700",
      MEDICINE: "bg-blue-50 text-blue-700",
      OTHER: "bg-slate-50 text-slate-700",
    };

    return (
      <div key={d.id} className="card space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">{d.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[d.type]}`}>
                {typeIcons[d.type]} {d.type}
              </span>
              <span className="text-xs text-slate-500">
                Urgency: {d.urgency}
              </span>
            </div>
          </div>
          {isMoney && d.targetAmount && (
            <p className="text-xs text-slate-500 text-right">
              ₹{Number(d.raisedAmount || 0).toFixed(0)} / ₹
              {Number(d.targetAmount).toFixed(0)}
            </p>
          )}
        </div>

        {isMoney && d.targetAmount && (
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {isBlood && (
          <div className="flex gap-3 text-xs">
            {d.bloodType && (
              <span className="bg-red-50 text-red-700 px-2 py-1 rounded-lg font-medium">
                🩸 {d.bloodType}
              </span>
            )}
            {d.unitsNeeded && (
              <span className="text-slate-600">
                {d.unitsNeeded} unit(s) needed
              </span>
            )}
          </div>
        )}

        {isMedicine && d.medicineList && (
          <div className="bg-blue-50 rounded-lg p-2 text-xs text-slate-700">
            <p className="font-medium text-blue-700 mb-1">Medicines needed:</p>
            <p className="whitespace-pre-wrap">{d.medicineList}</p>
          </div>
        )}

        <p className="text-xs text-slate-600 line-clamp-3">{d.description}</p>

        {isPending && isDoctor && (
          <button
            onClick={() => handleVerify(d.id)}
            className="btn-primary w-full text-xs mt-1">
            ✓ Approve Request
          </button>
        )}

        {!isPending && d.status === "ACTIVE" && isMoney && (
          <button
            onClick={() => openDonateModal(d.id)}
            className="btn-secondary w-full text-xs mt-1">
            💰 Donate Money
          </button>
        )}

        {!isPending && d.status === "ACTIVE" && !isMoney && (
          <p className="text-xs text-primary text-center font-medium mt-1">
            Contact the patient to help with this {d.type.toLowerCase()} request
          </p>
        )}

        {d.status === "FULFILLED" && (
          <p className="text-xs text-green-600 font-medium text-center">
            ✅ Goal Reached
          </p>
        )}

        {d.verifiedByDoctorName && (
          <p className="text-[10px] text-green-700 bg-green-50 rounded-lg px-2 py-1 text-center">
            ✅ Approved by Dr. {d.verifiedByDoctorName}
          </p>
        )}

        {d.requestedDoctorName && d.status === "PENDING_VERIFICATION" && (
          <p className="text-[10px] text-blue-600 bg-blue-50 rounded-lg px-2 py-1 text-center">
            📋 Approval requested from Dr. {d.requestedDoctorName}
          </p>
        )}

        {isPending && !d.requestedDoctorName && (
          <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg px-2 py-1 text-center">
            ⏳ Awaiting doctor verification
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Support Patients</h1>
          <p className="text-sm text-slate-500">
            Browse verified cases and help patients in need.
          </p>
        </div>
        {isPatient && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary text-xs px-3 py-2">
            {showCreateForm ? "Cancel" : "+ Request Help"}
          </button>
        )}
      </header>

      {/* Tabs for Doctor */}
      {isDoctor && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`text-xs px-3 py-1.5 rounded-full border ${activeTab === "active" ? "border-primary bg-primary-50 text-primary font-medium" : "border-slate-200 text-slate-500"}`}>
            Active ({donations.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`text-xs px-3 py-1.5 rounded-full border ${activeTab === "pending" ? "border-primary bg-primary-50 text-primary font-medium" : "border-slate-200 text-slate-500"}`}>
            Pending Approval ({pendingDonations.length})
          </button>
        </div>
      )}

      {/* Create Donation Form (Patient Only) */}
      {showCreateForm && isPatient && (
        <form
          onSubmit={handleCreateDonation}
          className="card space-y-3 text-sm">
          <h3 className="font-semibold text-slate-900">
            Create Donation Request
          </h3>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Title *
            </label>
            <input
              className="input-field"
              placeholder="e.g. Help with surgery costs"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm({ ...createForm, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Description *
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Describe your situation and why you need help..."
              value={createForm.description}
              onChange={(e) =>
                setCreateForm({ ...createForm, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Type</label>
              <select
                className="input-field"
                value={createForm.type}
                onChange={(e) =>
                  setCreateForm({ ...createForm, type: e.target.value })
                }>
                <option value="MONEY">💰 Money</option>
                <option value="BLOOD">🩸 Blood</option>
                <option value="MEDICINE">💊 Medicine</option>
                <option value="OTHER">🤝 Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Urgency
              </label>
              <select
                className="input-field"
                value={createForm.urgency}
                onChange={(e) =>
                  setCreateForm({ ...createForm, urgency: e.target.value })
                }>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Approving Doctor
            </label>
            <select
              className="input-field"
              value={createForm.requestedDoctorId}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  requestedDoctorId: e.target.value,
                })
              }>
              <option value="">— Any of my treating doctors —</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.name} — {doc.specialty}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400">
              Choose which doctor should approve this request, or leave blank
              for any treating doctor.
            </p>
          </div>
          {renderTypeSpecificFields()}
          <button type="submit" className="btn-primary w-full text-sm">
            Submit Request
          </button>
          <p className="text-[10px] text-slate-400 text-center">
            Your request will be reviewed by your treating doctor before being
            visible to others.
          </p>
        </form>
      )}

      <main className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading cases…</p>}

        {/* Active donations */}
        {activeTab === "active" && (
          <>
            {!loading && donations.length === 0 && (
              <p className="text-sm text-slate-500">
                No active cases right now.
              </p>
            )}
            {donations.map((d) => renderDonationCard(d, false))}
          </>
        )}

        {/* Pending donations (Doctor only) */}
        {activeTab === "pending" && isDoctor && (
          <>
            {pendingDonations.length === 0 && (
              <div className="card text-center py-8">
                <p className="text-sm text-slate-500">
                  No pending donation requests from your patients.
                </p>
              </div>
            )}
            {pendingDonations.map((d) => renderDonationCard(d, true))}
          </>
        )}
      </main>

      {/* Donate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Make a donation
            </h3>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                className="input-field"
                placeholder="Enter amount"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDonateAmount(String(amt))}
                  className="border border-slate-200 rounded-lg py-2 text-sm hover:border-primary hover:text-primary transition-colors">
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
              <button
                onClick={handleDonate}
                className="btn-primary flex-1 text-sm">
                Donate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsPage;
