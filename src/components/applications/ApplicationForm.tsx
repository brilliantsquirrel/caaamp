"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, type ApplicationFormData } from "@/lib/validators";

interface ApplicationFormProps {
  eventId: string;
  eventName: string;
  userName?: string | null;
}

export default function ApplicationForm({
  eventId,
  eventName,
  userName,
}: ApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      eventId,
      applicantName: userName || "",
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || "Failed to submit application");
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("eventId")} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="applicantName" className="block text-sm font-medium mb-2">
          Full Name <span className="text-red-600">*</span>
        </label>
        <input
          id="applicantName"
          type="text"
          {...register("applicantName")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.applicantName && (
          <p className="text-red-600 text-sm mt-1">{errors.applicantName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
          Phone Number
        </label>
        <input
          id="phoneNumber"
          type="tel"
          {...register("phoneNumber")}
          placeholder="+1234567890"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.phoneNumber && (
          <p className="text-red-600 text-sm mt-1">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="emergencyContactName" className="block text-sm font-medium mb-2">
          Emergency Contact Name
        </label>
        <input
          id="emergencyContactName"
          type="text"
          {...register("emergencyContactName")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.emergencyContactName && (
          <p className="text-red-600 text-sm mt-1">{errors.emergencyContactName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="emergencyContactPhone" className="block text-sm font-medium mb-2">
          Emergency Contact Phone
        </label>
        <input
          id="emergencyContactPhone"
          type="tel"
          {...register("emergencyContactPhone")}
          placeholder="+1234567890"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.emergencyContactPhone && (
          <p className="text-red-600 text-sm mt-1">{errors.emergencyContactPhone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="dietaryRestrictions" className="block text-sm font-medium mb-2">
          Dietary Restrictions
        </label>
        <textarea
          id="dietaryRestrictions"
          {...register("dietaryRestrictions")}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.dietaryRestrictions && (
          <p className="text-red-600 text-sm mt-1">{errors.dietaryRestrictions.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="medicalConditions" className="block text-sm font-medium mb-2">
          Medical Conditions
        </label>
        <textarea
          id="medicalConditions"
          {...register("medicalConditions")}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.medicalConditions && (
          <p className="text-red-600 text-sm mt-1">{errors.medicalConditions.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="specialRequirements" className="block text-sm font-medium mb-2">
          Special Requirements
        </label>
        <textarea
          id="specialRequirements"
          {...register("specialRequirements")}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.specialRequirements && (
          <p className="text-red-600 text-sm mt-1">{errors.specialRequirements.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
