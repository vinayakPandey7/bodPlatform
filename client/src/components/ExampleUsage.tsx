// Example usage of TanStack Query hooks in a component

import { useJobs, useCreateJob, useLogin } from "@/lib/queries";
import { useState } from "react";

// Example 1: Fetching jobs with search params
export function JobsList() {
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data: jobs, isLoading, error, refetch } = useJobs(searchParams);

  if (isLoading) return <div>Loading jobs...</div>;
  if (error) return <div>Error loading jobs: {error.message}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search jobs..."
        value={searchParams.search}
        onChange={(e) =>
          setSearchParams((prev) => ({
            ...prev,
            search: e.target.value,
          }))
        }
      />

      {jobs?.data?.map((job: any) => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
          <p>{job.location}</p>
        </div>
      ))}

      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}

// Example 2: Creating a new job
export function CreateJobForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    jobType: "",
    salaryRange: "",
    company: "",
  });

  const createJobMutation = useCreateJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createJobMutation.mutateAsync(formData);
      // Reset form on success
      setFormData({
        title: "",
        description: "",
        requirements: "",
        location: "",
        jobType: "",
        salaryRange: "",
        company: "",
      });
      alert("Job created successfully!");
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Job Title"
        value={formData.title}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, title: e.target.value }))
        }
        required
      />

      <textarea
        placeholder="Job Description"
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
        required
      />

      <button type="submit" disabled={createJobMutation.isPending}>
        {createJobMutation.isPending ? "Creating..." : "Create Job"}
      </button>

      {createJobMutation.error && (
        <div>Error: {createJobMutation.error.message}</div>
      )}
    </form>
  );
}

// Example 3: Login form
export function LoginForm() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginMutation.mutateAsync(credentials);
      // Redirect will be handled by the mutation's onSuccess
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={credentials.email}
        onChange={(e) =>
          setCredentials((prev) => ({ ...prev, email: e.target.value }))
        }
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) =>
          setCredentials((prev) => ({ ...prev, password: e.target.value }))
        }
        required
      />

      <button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Logging in..." : "Login"}
      </button>

      {loginMutation.error && (
        <div>Login failed: {loginMutation.error.message}</div>
      )}
    </form>
  );
}
