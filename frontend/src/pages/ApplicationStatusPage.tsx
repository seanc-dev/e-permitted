import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  MapPin,
} from "lucide-react";

interface ApplicationStatus {
  id: string;
  reference: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";
  submittedAt: string;
  processedAt?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  permitType: {
    name: string;
  };
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
    };
    permitType: string;
    description: string;
  };
  aiAnalysis?: {
    analysis: string;
    analyzedAt: string;
  };
}

const statusConfig = {
  DRAFT: { label: "Draft", color: "text-gray-500", icon: FileText },
  SUBMITTED: { label: "Submitted", color: "text-blue-600", icon: Clock },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "text-yellow-600",
    icon: AlertCircle,
  },
  APPROVED: { label: "Approved", color: "text-green-600", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "text-red-600", icon: XCircle },
  CANCELLED: { label: "Cancelled", color: "text-gray-600", icon: XCircle },
};

export const ApplicationStatusPage = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const response = await fetch(`/api/permits/${id}`);

        if (response.ok) {
          const result = await response.json();
          setApplication(result.data);
        } else {
          setError("Application not found");
        }
      } catch (err) {
        setError("Failed to load application");
        console.error("Error fetching application:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplication();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner" />
        <span className="ml-3 text-gray-600">Loading application...</span>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Application Not Found</h2>
          <p className="text-gray-600">
            {error || "The application you are looking for could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[application.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Application Status
        </h1>
        <p className="text-gray-600">
          Track the progress of your permit application
        </p>
      </div>

      {/* Status Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
            <div>
              <h2 className="text-xl font-semibold">Application Status</h2>
              <p className={`text-lg font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Reference</p>
            <p className="font-mono font-semibold text-gray-900">
              {application.reference}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="border-l-2 border-gray-200 pl-6 space-y-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
            <div>
              <p className="font-medium">Application Submitted</p>
              <p className="text-sm text-gray-500">
                {new Date(application.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {application.status !== "DRAFT" && (
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-4 ${
                  application.status === "SUBMITTED"
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              ></div>
              <div>
                <p className="font-medium">Under Review</p>
                <p className="text-sm text-gray-500">
                  {application.status === "SUBMITTED"
                    ? "Currently being reviewed"
                    : "Review completed"}
                </p>
              </div>
            </div>
          )}

          {application.status === "APPROVED" && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
              <div>
                <p className="font-medium">Approved</p>
                <p className="text-sm text-gray-500">
                  {application.processedAt &&
                    new Date(application.processedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {application.status === "REJECTED" && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-4"></div>
              <div>
                <p className="font-medium">Rejected</p>
                <p className="text-sm text-gray-500">
                  {application.processedAt &&
                    new Date(application.processedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Details */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Applicant Information */}
        <div className="card">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold">Applicant Information</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">
                {application.data.firstName} {application.data.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{application.data.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{application.data.phone}</p>
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="card">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold">Property Information</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{application.data.address.street}</p>
              <p className="text-gray-600">
                {application.data.address.city},{" "}
                {application.data.address.postalCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Permit Type</p>
              <p className="font-medium">{application.permitType.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Description */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Project Description</h3>
        <p className="text-gray-700 whitespace-pre-wrap">
          {application.data.description}
        </p>
      </div>

      {/* AI Analysis */}
      {application.aiAnalysis && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-2">
              Analyzed on{" "}
              {new Date(application.aiAnalysis.analyzedAt).toLocaleDateString()}
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">
              {application.aiAnalysis.analysis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
