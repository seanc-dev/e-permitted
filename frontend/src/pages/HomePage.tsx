import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Building2,
  Clock,
  CheckCircle,
} from "lucide-react";

export const HomePage = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to E-Permitted
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Submit and track your permit applications with Kapiti Coast District
          Council. Our AI-powered system helps ensure your application is
          complete and accurate.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/submit"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <FileText className="h-5 w-5" />
            <span>Submit New Permit</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/council"
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <Building2 className="h-5 w-5" />
            <span>Council Information</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Easy Submission</h3>
          <p className="text-gray-600">
            Submit your permit applications online with our user-friendly forms.
            Save time and avoid paper-based processes.
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI-Powered Validation</h3>
          <p className="text-gray-600">
            Our AI system reviews your application and provides instant feedback
            to help ensure completeness and accuracy.
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
          <p className="text-gray-600">
            Track the status of your applications in real-time. Get
            notifications when your permit is processed.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-primary-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Kapiti Coast District Council
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-600">500+</div>
            <div className="text-gray-600">Permits Processed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">24hrs</div>
            <div className="text-gray-600">Average Response Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">95%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-4">
          Ready to submit your permit?
        </h2>
        <p className="text-gray-600 mb-6">
          Get started with your permit application today. Our AI system will
          guide you through the process.
        </p>
        <Link
          to="/submit"
          className="btn-primary inline-flex items-center space-x-2"
        >
          <FileText className="h-5 w-5" />
          <span>Start Application</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
};
