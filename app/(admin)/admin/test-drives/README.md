# Admin Test Drives Management

This section of the application provides administrators with the tools to manage and oversee all test drive requests.

## Overview

The test drive management interface allows administrators to:
- View a comprehensive list of all submitted test drive requests.
- Review details of individual test drives, including customer information, car details, and scheduled times.
- Update the status of test drives (e.g., pending, confirmed, completed, cancelled).
- Delete test drive entries.

## Architectural Flow

The data flow for the admin test drive section generally follows this path:

1.  **`app/(admin)/admin/test-drives/page.jsx`**: This is the entry point. It imports and renders the `TestDrivesList` component. Any initial data fetching or server-side operations for the page itself would happen here.

2.  **`app/(admin)/admin/test-drives/_components/test-drive-list.jsx`**: This component is responsible for fetching the actual test drive data. It likely uses a server action or an API route (e.g., in `actions/test-drive.js` or `app/api/test-drives/route.js`) to retrieve the list of test drives from the database. Once fetched, it manages the display of this data, handling pagination, filtering, and passing individual test drive data to the `TestDriveCard` component.

3.  **`components/test-drive-card.jsx`**: This component receives individual test drive data as props from `TestDrivesList`. It is responsible for rendering the details of a single test drive in a user-friendly format. It may also contain UI elements for actions like viewing more details, updating status, or deleting the test drive, which would then trigger server actions or API calls.

4.  **`actions/test-drive.js` (or similar API route)**: This file (or a corresponding API route) would contain the server-side logic for interacting with the database. This includes functions for fetching all test drives, fetching a single test drive, updating a test drive's status, and deleting a test drive. These actions are called by the frontend components.

## Key Components

### `app/(admin)/admin/test-drives/page.jsx`
This is the main page for the admin test drives section. It imports the `TestDrivesList` component and renders it. This page sets the metadata for the browser tab.

```javascript
import TestDrivesList from "./_components/test-drive-list";

export const metadata = {
  title: "Test Drives | Vehiql Admin",
  description: "Manage test drive bookings",
};

export default function TestDrivesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test Drive Management</h1>
      <TestDrivesList />
    </div>
  );
}
```

### `app/(admin)/admin/test-drives/_components/test-drive-list.jsx`
This component is responsible for rendering the list of test drive requests. It fetches data and displays it in a structured format, often utilizing pagination and filtering capabilities. It also passes individual test drive data to the `TestDriveCard` component.

```javascript
// ... example simplified structure of test-drive-list.jsx ...
import { useEffect, useState } from 'react';
import { TestDriveCard } from "@/components/test-drive-card";
// Assuming a server action or API call to fetch test drives
// import { getTestDrives } from "@/actions/test-drive"; 

function TestDriveList() {
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestDrives() {
      // Replace with actual data fetching logic (e.g., calling a server action)
      // const data = await getTestDrives(); 
      const dummyData = [
        { id: '1', customerName: 'John Doe', carModel: 'Honda Civic', date: '2024-08-01', status: 'Pending' },
        { id: '2', customerName: 'Jane Smith', carModel: 'BMW X5', date: '2024-08-05', status: 'Confirmed' },
      ];
      setTestDrives(dummyData);
      setLoading(false);
    }
    fetchTestDrives();
  }, []);

  if (loading) {
    return <div>Loading test drives...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {testDrives.map((testDrive) => (
        <TestDriveCard key={testDrive.id} testDrive={testDrive} />
      ))}
    </div>
  );
}

export default TestDriveList;
```

### `components/test-drive-card.jsx`
This component is used to display individual test drive details within the `TestDriveList`. It presents a concise summary of each test drive, allowing for quick review and access to more detailed actions.

```javascript
// ... example simplified structure of test-drive-card.jsx ...
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TestDriveCard({ testDrive }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{testDrive.carModel}</CardTitle>
        <p className="text-sm text-muted-foreground">{testDrive.customerName}</p>
      </CardHeader>
      <CardContent>
        <p>Date: {testDrive.date}</p>
        <p>Status: {testDrive.status}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline">View Details</Button>
          <Button>Update Status</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## How to Extend and Modify

### Adding New Features
To add new features, such as additional filtering options or new actions for test drives, you would typically modify the `test-drive-list.jsx` component to implement the filtering UI and logic. If new server-side operations are needed, you would add functions to `actions/test-drive.js` (or a new API route) and then call them from the frontend.

### Modifying Existing Logic
For changes to existing logic, such as how test drives are fetched or how their status is updated, you would look into the relevant components and the associated server actions or API routes (e.g., in `actions/test-drive.js` if applicable). For example, to change the data fetching mechanism, you would modify the `useEffect` hook in `test-drive-list.jsx` and the corresponding server action.

## Example Usage

```javascript
// Example of how a test drive might be rendered in test-drive-list.jsx
import { TestDriveCard } from "@/components/test-drive-card";

function TestDriveList({ testDrives }) {
  return (
    <div>
      {testDrives.map((testDrive) => (
        <TestDriveCard key={testDrive.id} testDrive={testDrive} />
      ))}
    </div>
  );
}
