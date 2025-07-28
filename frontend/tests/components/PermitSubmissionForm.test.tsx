import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PermitSubmissionPage } from "../../src/pages/PermitSubmissionPage";

// Mock the API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PermitSubmissionPage", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("Form Validation", () => {
    it("should show errors for missing required fields", async () => {
      renderWithRouter(<PermitSubmissionPage />);

      // Try to submit without filling required fields
      const submitButton = screen.getByText("Submit Application");
      fireEvent.click(submitButton);

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText("First name is required")).toBeInTheDocument();
        expect(screen.getByText("Last name is required")).toBeInTheDocument();
        expect(screen.getByText("Valid email is required")).toBeInTheDocument();
        expect(
          screen.getByText("Phone number is required")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Street address is required")
        ).toBeInTheDocument();
        expect(screen.getByText("City is required")).toBeInTheDocument();
        expect(screen.getByText("Postal code is required")).toBeInTheDocument();
        expect(
          screen.getByText("Please select a permit type")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Description must be at least 10 characters")
        ).toBeInTheDocument();
      });
    });

    it("should validate email format", async () => {
      renderWithRouter(<PermitSubmissionPage />);

      const emailInput = screen.getByPlaceholderText(
        "Enter your email address"
      );
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText("Valid email is required")).toBeInTheDocument();
      });

      fireEvent.change(emailInput, { target: { value: "valid@email.com" } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(
          screen.queryByText("Valid email is required")
        ).not.toBeInTheDocument();
      });
    });

    it("should validate description length", async () => {
      renderWithRouter(<PermitSubmissionPage />);

      const descriptionInput = screen.getByPlaceholderText(
        "Describe your project in detail..."
      );
      fireEvent.change(descriptionInput, { target: { value: "Short" } });
      fireEvent.blur(descriptionInput);

      await waitFor(() => {
        expect(
          screen.getByText("Description must be at least 10 characters")
        ).toBeInTheDocument();
      });

      fireEvent.change(descriptionInput, {
        target: {
          value:
            "This is a longer description that meets the minimum length requirement.",
        },
      });
      fireEvent.blur(descriptionInput);

      await waitFor(() => {
        expect(
          screen.queryByText("Description must be at least 10 characters")
        ).not.toBeInTheDocument();
      });
    });

    it("should prevent submission with errors", async () => {
      renderWithRouter(<PermitSubmissionPage />);

      const submitButton = screen.getByText("Submit Application");
      fireEvent.click(submitButton);

      // Should not call API when there are validation errors
      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: "test-application-id",
            reference: "KCDC-2024-00001",
            status: "SUBMITTED",
            submittedAt: "2024-01-01T00:00:00Z",
          },
        }),
      });

      renderWithRouter(<PermitSubmissionPage />);

      // Fill in all required fields
      fireEvent.change(screen.getByPlaceholderText("Enter your first name"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your last name"), {
        target: { value: "Doe" },
      });
      fireEvent.change(
        screen.getByPlaceholderText("Enter your email address"),
        {
          target: { value: "john@example.com" },
        }
      );
      fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
        target: { value: "021123456" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter street address"), {
        target: { value: "123 Main St" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter city"), {
        target: { value: "Paraparaumu" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter postal code"), {
        target: { value: "5032" },
      });
      fireEvent.change(screen.getByDisplayValue("Select a permit type"), {
        target: { value: "building" },
      });
      fireEvent.change(
        screen.getByPlaceholderText("Describe your project in detail..."),
        {
          target: {
            value:
              "This is a detailed description of my building project that meets the minimum length requirement.",
          },
        }
      );

      // Submit the form
      const submitButton = screen.getByText("Submit Application");
      fireEvent.click(submitButton);

      // Check that API was called with correct data
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/permits/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "temp-user-id",
            councilId: "kcdc-council-id",
            permitTypeId: "building",
            data: expect.objectContaining({
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
              phone: "021123456",
              address: {
                street: "123 Main St",
                city: "Paraparaumu",
                postalCode: "5032",
              },
              permitType: "building",
              description:
                "This is a detailed description of my building project that meets the minimum length requirement.",
            }),
          }),
        });
      });

      // Check that success page is shown
      await waitFor(() => {
        expect(
          screen.getByText("Application Submitted Successfully!")
        ).toBeInTheDocument();
        expect(screen.getByText("KCDC-2024-00001")).toBeInTheDocument();
      });
    });

    it("should show loading state during submission", async () => {
      // Mock a slow API response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    success: true,
                    data: {
                      id: "test-id",
                      reference: "KCDC-2024-00001",
                      status: "SUBMITTED",
                    },
                  }),
                }),
              100
            )
          )
      );

      renderWithRouter(<PermitSubmissionPage />);

      // Fill in form and submit
      fireEvent.change(screen.getByPlaceholderText("Enter your first name"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your last name"), {
        target: { value: "Doe" },
      });
      fireEvent.change(
        screen.getByPlaceholderText("Enter your email address"),
        {
          target: { value: "john@example.com" },
        }
      );
      fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
        target: { value: "021123456" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter street address"), {
        target: { value: "123 Main St" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter city"), {
        target: { value: "Paraparaumu" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter postal code"), {
        target: { value: "5032" },
      });
      fireEvent.change(screen.getByDisplayValue("Select a permit type"), {
        target: { value: "building" },
      });
      fireEvent.change(
        screen.getByPlaceholderText("Describe your project in detail..."),
        {
          target: {
            value: "This is a detailed description of my building project.",
          },
        }
      );

      const submitButton = screen.getByText("Submit Application");
      fireEvent.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText("Submitting...")).toBeInTheDocument();
      });

      // Wait for submission to complete
      await waitFor(() => {
        expect(
          screen.getByText("Application Submitted Successfully!")
        ).toBeInTheDocument();
      });
    });

    it("should handle API errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      renderWithRouter(<PermitSubmissionPage />);

      // Fill in form and submit
      fireEvent.change(screen.getByPlaceholderText("Enter your first name"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your last name"), {
        target: { value: "Doe" },
      });
      fireEvent.change(
        screen.getByPlaceholderText("Enter your email address"),
        {
          target: { value: "john@example.com" },
        }
      );
      fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
        target: { value: "021123456" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter street address"), {
        target: { value: "123 Main St" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter city"), {
        target: { value: "Paraparaumu" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter postal code"), {
        target: { value: "5032" },
      });
      fireEvent.change(screen.getByDisplayValue("Select a permit type"), {
        target: { value: "building" },
      });
      fireEvent.change(
        screen.getByPlaceholderText("Describe your project in detail..."),
        {
          target: {
            value: "This is a detailed description of my building project.",
          },
        }
      );

      const submitButton = screen.getByText("Submit Application");
      fireEvent.click(submitButton);

      // Should not show success page on error
      await waitFor(() => {
        expect(
          screen.queryByText("Application Submitted Successfully!")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("User Experience", () => {
    it("should be accessible", () => {
      renderWithRouter(<PermitSubmissionPage />);

      // Check for proper labels
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
      expect(screen.getByLabelText("Street Address")).toBeInTheDocument();
      expect(screen.getByLabelText("City")).toBeInTheDocument();
      expect(screen.getByLabelText("Postal Code")).toBeInTheDocument();
      expect(screen.getByLabelText("Permit Type")).toBeInTheDocument();
      expect(screen.getByLabelText("Project Description")).toBeInTheDocument();
    });

    it("should provide clear feedback", () => {
      renderWithRouter(<PermitSubmissionPage />);

      // Check for clear section headers
      expect(screen.getByText("Applicant Information")).toBeInTheDocument();
      expect(screen.getByText("Property Address")).toBeInTheDocument();
      expect(screen.getByText("Permit Details")).toBeInTheDocument();

      // Check for helpful placeholder text
      expect(
        screen.getByPlaceholderText("Enter your first name")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Describe your project in detail...")
      ).toBeInTheDocument();
    });
  });
});
