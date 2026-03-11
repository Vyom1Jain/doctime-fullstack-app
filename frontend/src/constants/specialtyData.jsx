// Specialty icons, colors, and common health concerns mapping
// Inline SVG paths — no external CDN dependency, always works offline

export const SPECIALTIES = [
  "GENERAL_PRACTITIONER",
  "CARDIOLOGIST",
  "DERMATOLOGIST",
  "NEUROLOGIST",
  "ORTHOPEDIST",
  "PEDIATRICIAN",
  "PSYCHIATRIST",
  "GYNECOLOGIST",
  "OPHTHALMOLOGIST",
  "ENT",
  "DENTIST",
  "ONCOLOGIST",
  "RADIOLOGIST",
  "OTHER",
];

export const SPECIALTY_DATA = {
  GENERAL_PRACTITIONER: {
    label: "General Physician",
    shortLabel: "GP",
    icon: "🩺",
    color: "#4A90E2",
    bgColor: "#EBF4FF",
    svgPath:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z",
    concerns: ["Fever", "Cough & Cold", "Headache"],
    concernImage: null,
  },
  CARDIOLOGIST: {
    label: "Cardiologist",
    shortLabel: "Heart",
    icon: "❤️",
    color: "#E74C3C",
    bgColor: "#FDEDEC",
    svgPath:
      "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    concerns: ["Chest Pain", "Heart Palpitations", "High BP"],
    concernImage: null,
  },
  DERMATOLOGIST: {
    label: "Dermatologist",
    shortLabel: "Skin",
    icon: "🧴",
    color: "#E67E22",
    bgColor: "#FEF5E7",
    svgPath:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
    concerns: ["Acne", "Skin Rashes", "Hair Loss"],
    concernImage: null,
  },
  NEUROLOGIST: {
    label: "Neurologist",
    shortLabel: "Brain",
    icon: "🧠",
    color: "#8E44AD",
    bgColor: "#F4ECF7",
    svgPath:
      "M13 1.07V9h7c0-4.08-3.05-7.44-7-7.93zM4 15c0 4.42 3.58 8 8 8s8-3.58 8-8v-4H4v4zm7-13.93C7.05 1.56 4 4.92 4 9h7V1.07z",
    concerns: ["Migraine", "Dizziness", "Numbness"],
    concernImage: null,
  },
  ORTHOPEDIST: {
    label: "Orthopedist",
    shortLabel: "Bones",
    icon: "🦴",
    color: "#2ECC71",
    bgColor: "#EAFAF1",
    svgPath:
      "M8 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm8 4c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-8 6c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 13.17 10.33 12 8 12zm-5 5.5c.22-.83 3.14-2 5-2s4.78 1.17 5 2H3zm13-5.5c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5C23 13.17 18.33 12 16 12z",
    concerns: ["Back Pain", "Joint Pain", "Fractures"],
    concernImage: null,
  },
  PEDIATRICIAN: {
    label: "Pediatrician",
    shortLabel: "Child",
    icon: "👶",
    color: "#3498DB",
    bgColor: "#EBF5FB",
    svgPath:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z",
    concerns: ["Child Fever", "Vaccinations", "Growth Issues"],
    concernImage: null,
  },
  PSYCHIATRIST: {
    label: "Psychiatrist",
    shortLabel: "Mental",
    icon: "🧘",
    color: "#1ABC9C",
    bgColor: "#E8F8F5",
    svgPath:
      "M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 2.48-.94 4.96-2.83 6.85-3.78 3.77-9.9 3.77-13.68 0-3.78-3.78-3.78-9.9 0-13.67 3.78-3.78 9.9-3.78 13.68 0l2.83-2.82V10.12z",
    concerns: ["Anxiety", "Depression", "Insomnia"],
    concernImage: null,
  },
  GYNECOLOGIST: {
    label: "Gynecologist",
    shortLabel: "Women",
    icon: "🤰",
    color: "#E91E63",
    bgColor: "#FCE4EC",
    svgPath:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z",
    concerns: ["Period Problems", "PCOS", "Pregnancy Care"],
    concernImage: null,
  },
  OPHTHALMOLOGIST: {
    label: "Ophthalmologist",
    shortLabel: "Eye",
    icon: "👁️",
    color: "#00BCD4",
    bgColor: "#E0F7FA",
    svgPath:
      "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
    concerns: ["Eye Pain", "Vision Issues", "Eye Infection"],
    concernImage: null,
  },
  ENT: {
    label: "ENT Specialist",
    shortLabel: "ENT",
    icon: "👂",
    color: "#FF9800",
    bgColor: "#FFF3E0",
    svgPath:
      "M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z",
    concerns: ["Ear Pain", "Sore Throat", "Sinusitis"],
    concernImage: null,
  },
  DENTIST: {
    label: "Dentist",
    shortLabel: "Dental",
    icon: "🦷",
    color: "#00ACC1",
    bgColor: "#E0F7FA",
    svgPath:
      "M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    concerns: ["Toothache", "Cavity", "Gum Problems"],
    concernImage: null,
  },
  ONCOLOGIST: {
    label: "Oncologist",
    shortLabel: "Cancer",
    icon: "🎗️",
    color: "#9C27B0",
    bgColor: "#F3E5F5",
    svgPath:
      "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z",
    concerns: ["Cancer Screening", "Tumor", "Chemotherapy"],
    concernImage: null,
  },
  RADIOLOGIST: {
    label: "Radiologist",
    shortLabel: "Imaging",
    icon: "🔬",
    color: "#607D8B",
    bgColor: "#ECEFF1",
    svgPath:
      "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-5.5-7c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
    concerns: ["X-Ray", "MRI", "CT Scan"],
    concernImage: null,
  },
  OTHER: {
    label: "Other Specialist",
    shortLabel: "Other",
    icon: "⚕️",
    color: "#78909C",
    bgColor: "#ECEFF1",
    svgPath:
      "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z",
    concerns: ["General Consultation"],
    concernImage: null,
  },
};

// Health concerns with images — for the dashboard horizontal scroll
export const HEALTH_CONCERNS = [
  {
    label: "Cough & Cold",
    specialty: "GENERAL_PRACTITIONER",
    icon: "🤧",
    color: "#4A90E2",
  },
  {
    label: "Skin Problems",
    specialty: "DERMATOLOGIST",
    icon: "🧴",
    color: "#E67E22",
  },
  {
    label: "Period Problems",
    specialty: "GYNECOLOGIST",
    icon: "🤰",
    color: "#E91E63",
  },
  {
    label: "Depression & Anxiety",
    specialty: "PSYCHIATRIST",
    icon: "🧘",
    color: "#1ABC9C",
  },
  {
    label: "Sick Kid",
    specialty: "PEDIATRICIAN",
    icon: "👶",
    color: "#3498DB",
  },
  {
    label: "Weight Management",
    specialty: "GENERAL_PRACTITIONER",
    icon: "🏃",
    color: "#2ECC71",
  },
];

// SVG icon component for specialties
export const SpecialtyIcon = ({ specialty, size = 32, className = "" }) => {
  const data = SPECIALTY_DATA[specialty] || SPECIALTY_DATA.OTHER;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={data.color}
      className={className}
      aria-label={data.label}>
      <path d={data.svgPath} />
    </svg>
  );
};

// Helper to format specialty enum to display name
export const formatSpecialty = (s) => {
  const data = SPECIALTY_DATA[s];
  if (data) return data.label;
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};
