import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { prescriptionApi } from "../../services/api";

const PrescriptionPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      diagnosis: "",
      generalAdvice: "",
      nextVisit: "",
      medicines: [
        { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines",
  });

  const onSubmit = async (data) => {
    try {
      await prescriptionApi.create(appointmentId, data);
      alert("Prescription saved");
      navigate(`/doctor/dashboard`);
    } catch (e) {
      console.error(e);
      alert("Failed to save prescription");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">New prescription</h1>
        <p className="text-sm text-slate-500">Appointment #{appointmentId}</p>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <section className="card space-y-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Diagnosis
            </label>
            <textarea
              className="input-field min-h-[80px]"
              {...register("diagnosis", { required: true })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              General advice
            </label>
            <textarea
              className="input-field min-h-[80px]"
              {...register("generalAdvice")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Next visit
            </label>
            <input
              className="input-field"
              placeholder="In 2 weeks / On 15th Aug"
              {...register("nextVisit")}
            />
          </div>
        </section>

        <section className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Medicines</h2>
            <button
              type="button"
              onClick={() =>
                append({
                  name: "",
                  dosage: "",
                  frequency: "",
                  duration: "",
                  instructions: "",
                })
              }
              className="text-xs text-primary">
              + Add medicine
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">
                    Medicine {index + 1}
                  </p>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-[11px] text-red-500">
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <input
                      className={`input-field ${errors.medicines?.[index]?.name ? "border-red-400" : ""}`}
                      placeholder="Name *"
                      {...register(`medicines.${index}.name`, {
                        required: "Required",
                      })}
                    />
                  </div>
                  <div>
                    <input
                      className={`input-field ${errors.medicines?.[index]?.dosage ? "border-red-400" : ""}`}
                      placeholder="Dosage (e.g. 500mg) *"
                      {...register(`medicines.${index}.dosage`, {
                        required: "Required",
                      })}
                    />
                  </div>
                  <div>
                    <input
                      className={`input-field ${errors.medicines?.[index]?.frequency ? "border-red-400" : ""}`}
                      placeholder="Frequency *"
                      {...register(`medicines.${index}.frequency`, {
                        required: "Required",
                      })}
                    />
                  </div>
                  <div>
                    <input
                      className={`input-field ${errors.medicines?.[index]?.duration ? "border-red-400" : ""}`}
                      placeholder="Duration *"
                      {...register(`medicines.${index}.duration`, {
                        required: "Required",
                      })}
                    />
                  </div>
                </div>
                <textarea
                  className="input-field text-xs"
                  placeholder="Instructions (after food, morning, etc.)"
                  {...register(`medicines.${index}.instructions`)}
                />
              </div>
            ))}
          </div>
        </section>

        <button type="submit" className="btn-primary w-full mt-2">
          Save prescription
        </button>
      </form>
    </div>
  );
};

export default PrescriptionPage;
