import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import { Close, CloudUpload, Download } from '@mui/icons-material';
import { GenericTable, TableColumn } from '@/components/GenericTable';
import { createNameColumn, createEmailColumn } from '@/components/table/tableUtils';

interface Client {
  _id?: string;
  name: string;
  phone: string;
  email: string;
  salesPersonId?: string;
  salesPersonName?: string;
  status?: string;
  notes?: string;
  dateAdded?: string;
}

interface ClientsModalProps {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  onClientsUpdate?: (clients: Client[]) => void;
  salesPersons?: Array<{ _id: string; name: string }>;
}

const ClientsModal: React.FC<ClientsModalProps> = ({
  open,
  onClose,
  clients,
  onClientsUpdate,
  salesPersons = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV Upload Handler
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const newClients: Client[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length >= 3 && values[0]) {
          const nameIndex = headers.findIndex((h) => h.includes("name"));
          const phoneIndex = headers.findIndex((h) => h.includes("phone"));
          const emailIndex = headers.findIndex((h) => h.includes("email"));
          const salesPersonIndex = headers.findIndex((h) => h.includes("salesperson") || h.includes("sales_person"));
          const statusIndex = headers.findIndex((h) => h.includes("status"));
          const notesIndex = headers.findIndex((h) => h.includes("notes"));

          // Find sales person by name or assign to first sales person if no sales person specified
          let salesPersonId = "";
          let salesPersonName = "";
          const salesPersonNameValue = values[salesPersonIndex] || "";

          if (salesPersonNameValue && salesPersons.length > 0) {
            const foundSalesPerson = salesPersons.find((sp) =>
              sp.name.toLowerCase().includes(salesPersonNameValue.toLowerCase())
            );
            if (foundSalesPerson) {
              salesPersonId = foundSalesPerson._id;
              salesPersonName = foundSalesPerson.name;
            }
          }

          // If no sales person found or specified, assign to first available sales person
          if (!salesPersonId && salesPersons.length > 0) {
            salesPersonId = salesPersons[0]._id;
            salesPersonName = salesPersons[0].name;
          }

          newClients.push({
            _id: Date.now().toString() + i,
            name: values[nameIndex] || "",
            phone: values[phoneIndex] || "",
            email: values[emailIndex] || "",
            salesPersonId,
            salesPersonName,
            status: (values[statusIndex] as any) || "pending",
            notes: values[notesIndex] || "",
            dateAdded: new Date().toISOString(),
          });
        }
      }

      if (onClientsUpdate) {
        onClientsUpdate([...clients, ...newClients]);
      }

      // Show success message
      if (newClients.length > 0) {
        alert(`Successfully imported ${newClients.length} clients`);
      }
    };

    reader.readAsText(file);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // CSV Download Handler
  const handleCSVDownload = () => {
    const csvContent = [
      ["Name", "Phone", "Email", "Sales Person", "Status", "Notes", "Date Added"].join(","),
      ...clients.map((client) =>
        [
          client.name,
          client.phone,
          client.email,
          client.salesPersonName || "",
          client.status || "pending",
          client.notes || "",
          client.dateAdded ? new Date(client.dateAdded).toLocaleDateString() : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const clientColumns: TableColumn<Client>[] = [
    createNameColumn("name", "Client Name"),
    {
      key: "phone",
      label: "Phone",
      type: "text",
      responsive: "md",
      searchable: true,
    },
    createEmailColumn("email", "Email"),
    {
      key: "salesPersonName",
      label: "Sales Person",
      type: "text",
      responsive: "lg",
      searchable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value || "Unassigned"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "text",
      responsive: "lg",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value || 'pending'}
        </span>
      ),
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 0,
          maxHeight: '85vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Client Database
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#9ca3af',
            '&:hover': {
              color: '#6b7280',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ overflow: 'auto' }}>
        {/* CSV Upload/Download Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Client Management</h3>
              <p className="text-sm text-gray-600">
                Upload CSV files to bulk import clients or download existing client data
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  bgcolor: '#16a34a',
                  '&:hover': { bgcolor: '#15803d' },
                  textTransform: 'none',
                  fontWeight: 'medium',
                }}
              >
                Upload CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleCSVDownload}
                disabled={clients.length === 0}
                sx={{
                  bgcolor: '#2563eb',
                  '&:hover': { bgcolor: '#1d4ed8' },
                  textTransform: 'none',
                  fontWeight: 'medium',
                }}
              >
                Download CSV
              </Button>
            </div>
          </div>
          
          {/* CSV Format Info */}
          {clients.length === 0 && (
            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>CSV Format:</strong> Name, Phone, Email, Sales Person, Status, Notes
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Sales Person should match existing sales person names, Status can be: active, pending, inactive
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="hidden"
        />

        {/* Clients Table */}
        <GenericTable
          data={clients}
          columns={clientColumns}
          searchPlaceholder="Search clients..."
          emptyMessage="No clients found. Upload a CSV file to add clients."
          tableHeight="400px"
          enableTableScroll={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ClientsModal; 