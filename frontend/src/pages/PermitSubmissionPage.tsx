import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, User, MapPin, Building2, Send } from "lucide-react";

// Form validation schema
const permitFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
  }),
  permitType: z.string().min(1, "Please select a permit type"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type PermitFormData = z.infer<typeof permitFormSchema>;

const permitTypes = [
  {
    id: "building",
    name: "Building Permit",
    description: "For new construction or major renovations",
  },
  {
    id: "resource",
    name: "Resource Consent",
    description: "For land use activities",
  },
  {
    id: "subdivision",
    name: "Subdivision Consent",
    description: "For dividing land into smaller lots",
  },
  {
    id: "demolition",
    name: "Demolition Permit",
    description: "For demolishing structures",
  },
  {
    id: "signage",
    name: "Signage Permit",
    description: "For installing signs or advertising",
  },
];

export const PermitSubmissionPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PermitFormData>({
    resolver: zodResolver(permitFormSchema),
  });

  const onSubmit = async (data: PermitFormData) => {
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/permits/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "temp-user-id", // TODO: Get from auth
          councilId: "kcdc-council-id", // TODO: Get from config
          permitTypeId: data.permitType,
          data: {
            ...data,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setApplicationId(result.data.id);
        setSubmitSuccess(true);
        reset();
      } else {
        throw new Error("Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting permit:", error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-4">
            Application Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your permit application has been submitted and is being processed.
            You will receive a confirmation email shortly.
          </p>
          {applicationId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Application Reference:
              </p>
              <p className="font-mono text-lg font-semibold text-gray-900">
                {applicationId}
              </p>
            </div>
          )}
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              <strong>Next steps:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• You'll receive an email confirmation</li>
              <li>• Our team will review your application</li>
              <li>• We'll contact you if additional information is needed</li>
              <li>• Track your application status online</li>
            </ul>
          </div>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="btn-primary mt-6"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Submit Permit Application
        </h1>
        <p className="text-gray-600">
          Complete the form below to submit your permit application to Kapiti
          Coast District Council.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Applicant Information */}
        <div className="card">
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold">Applicant Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">First Name</label>
              <input
                type="text"
                {...register("firstName")}
                className="form-input"
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="form-error">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Last Name</label>
              <input
                type="text"
                {...register("lastName")}
                className="form-input"
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="form-error">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                {...register("email")}
                className="form-input"
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                {...register("phone")}
                className="form-input"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="form-error">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Property Address */}
        <div className="card">
          <div className="flex items-center mb-6">
            <MapPin className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold">Property Address</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Street Address</label>
              <input
                type="text"
                {...register("address.street")}
                className="form-input"
                placeholder="Enter street address"
              />
              {errors.address?.street && (
                <p className="form-error">{errors.address.street.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  {...register("address.city")}
                  className="form-input"
                  placeholder="Enter city"
                />
                {errors.address?.city && (
                  <p className="form-error">{errors.address.city.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  {...register("address.postalCode")}
                  className="form-input"
                  placeholder="Enter postal code"
                />
                {errors.address?.postalCode && (
                  <p className="form-error">
                    {errors.address.postalCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Permit Details */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Building2 className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold">Permit Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Permit Type</label>
              <select {...register("permitType")} className="form-input">
                <option value="">Select a permit type</option>
                {permitTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.permitType && (
                <p className="form-error">{errors.permitType.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Project Description</label>
              <textarea
                {...register("description")}
                className="form-input"
                rows={4}
                placeholder="Describe your project in detail..."
              />
              {errors.description && (
                <p className="form-error">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary inline-flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                <span>Submit Application</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
