# TanStack Query Integration

This project now includes TanStack Query (React Query) for efficient server state management. The setup includes:

## File Structure

- `src/lib/api.ts` - Enhanced Axios client with interceptors and token management
- `src/lib/query-client.tsx` - QueryClient provider configuration
- `src/lib/fetchers.ts` - API fetcher functions for all entities
- `src/lib/queries.ts` - Custom React Query hooks
- `src/components/ExampleUsage.tsx` - Example usage patterns

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLIENT_ID=your-client-id
NEXT_PUBLIC_CLIENT_VERSION=1.0.0
NEXT_PUBLIC_CLIENT_TYPE=web
```

## Key Features

### 1. Enhanced API Client

- Automatic token injection
- Request/response interceptors
- UUID generation for tracking
- 401 error handling with automatic logout

### 2. Query Hooks

All entities have complete CRUD operation hooks:

#### Jobs

- `useJobs(params)` - List jobs with filtering
- `useJob(id)` - Get single job
- `useCreateJob()` - Create new job
- `useUpdateJob()` - Update existing job
- `useDeleteJob()` - Delete job
- `useJobApplications(jobId, params)` - Get job applications

#### Candidates

- `useCandidates(params)` - List candidates
- `useCandidate(id)` - Get single candidate
- `useUpdateCandidateProfile()` - Update profile
- `useUploadResume()` - Upload resume
- `useApplyToJob()` - Apply to job
- `useCandidateApplications(params)` - Get applications

#### Employers

- `useEmployers(params)` - List employers
- `useEmployer(id)` - Get single employer
- `useUpdateEmployerProfile()` - Update profile
- `useEmployerJobs(params)` - Get posted jobs
- `useSavedCandidates(params)` - Get saved candidates
- `useSaveCandidate()` - Save candidate
- `useUnsaveCandidate()` - Unsave candidate

#### Recruitment Partners

- `useRecruitmentPartners(params)` - List partners
- `useRecruitmentPartner(id)` - Get single partner
- `useUpdateRecruitmentPartnerProfile()` - Update profile
- `useAddCandidate()` - Add new candidate
- `useManagedCandidates(params)` - Get managed candidates
- `useAssignedJobs(params)` - Get assigned jobs

#### Admin

- `useAdminDashboard()` - Dashboard stats
- `useAdminUsers(params)` - All users
- `useUpdateUserStatus()` - Update user status
- `useDeleteUser()` - Delete user
- `useAdminJobs(params)` - All jobs
- `useUpdateJobStatus()` - Update job status

#### Notifications

- `useNotifications(params)` - List notifications
- `useMarkNotificationAsRead()` - Mark as read
- `useMarkAllNotificationsAsRead()` - Mark all as read
- `useDeleteNotification()` - Delete notification

#### Auth

- `useAuthMe()` - Get current user
- `useLogin()` - Login user
- `useRegister()` - Register user
- `useLogout()` - Logout user

### 3. Usage Examples

#### Basic Query

```tsx
function JobsList() {
  const { data, isLoading, error } = useJobs({
    page: 1,
    limit: 10,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data?.map((job) => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

#### Mutation

```tsx
function CreateJob() {
  const createJob = useCreateJob();

  const handleSubmit = async (formData) => {
    try {
      await createJob.mutateAsync(formData);
      alert("Job created!");
    } catch (error) {
      alert("Error creating job");
    }
  };

  return (
    <button onClick={() => handleSubmit(data)} disabled={createJob.isPending}>
      {createJob.isPending ? "Creating..." : "Create Job"}
    </button>
  );
}
```

#### Optimistic Updates

All mutations automatically invalidate related queries to keep the UI in sync.

### 4. Error Handling

- Automatic retry for failed requests (except 4xx errors)
- 401 errors trigger automatic logout
- Error states available in all hooks

### 5. Performance Features

- Automatic caching with 1-minute stale time
- Background refetching
- Request deduplication
- Optimistic updates

### 6. Development Tools

React Query DevTools are included for debugging queries and mutations in development.

## Migration from Old API

Replace direct API calls:

```tsx
// Old way
const response = await api.get("/jobs");

// New way
const { data } = useJobs();
```

Replace manual state management:

```tsx
// Old way
const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  api.get("/jobs").then((response) => {
    setJobs(response.data);
    setLoading(false);
  });
}, []);

// New way
const { data: jobs, isLoading } = useJobs();
```
