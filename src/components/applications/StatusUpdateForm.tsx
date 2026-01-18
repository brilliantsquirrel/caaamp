"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateApplicationStatusSchema,
  type UpdateApplicationStatusData,
} from "@/lib/validators";

interface StatusUpdateFormProps {
  applicationId: string;
  currentStatus: string;
  currentNotes?: string | null;
}

export default function StatusUpdateForm({
  applicationId,
  currentStatus,
  currentNotes,
}: StatusUpdateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateApplicationStatusData>({
    resolver: zodResolver(updateApplicationStatusSchema),
    defaultValues: {
      status: currentStatus as any,
      adminNotes: currentNotes || "",
    },
  });

  const onSubmit = async (data: UpdateApplicationStatusData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || "Failed to update application");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Application updated successfully
        </div>
      )}

      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-2">
          Application Status <span className="text-red-600">*</span>
        </label>
        <select
          id="status"
          {...register("status")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="waitlist">Waitlist</option>
        </select>
        {errors.status && (
          <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="adminNotes" className="block text-sm font-medium mb-2">
          Admin Notes
        </label>
        <textarea
          id="adminNotes"
          {...register("adminNotes")}
          rows={5}
          placeholder="Add internal notes about this application..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.adminNotes && (
          <p className="text-red-600 text-sm mt-1">{errors.adminNotes.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Updating..." : "Update Application"}
      </button>
    </form>
  );
}
