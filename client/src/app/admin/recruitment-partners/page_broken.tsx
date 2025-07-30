// "use client";
// import { useEffect, useState } from "react";
// import DashboardLayout from "@/components/DashboardLayout";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import { adminFetchers } from "@/lib/fetchers";
// import { toast } from "sonner";

// interface RecruitmentPartner {
//   _id: string;
//   user: {
//     email: string;
//     createdAt: string;
//   };
//   ownerName: string;
//   companyName: string;
//   email: string;
//   phoneNumber: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
//   isApproved: boolean;
//   website?: string;
//   description?: string;
//   specializations?: string[];
// }

// interface ProfileModalProps {
//   partner: RecruitmentPartner | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface PartnerFormData {
//   ownerName: string;
//   companyName: string;
//   email: string;
//   phoneNumber: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
//   website: string;
//   description: string;
//   specializations: string;
//   isApproved: boolean;
// }

// interface PartnerFormModalProps {
//   partner: RecruitmentPartner | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (partnerData: PartnerFormData) => void;
//   mode: 'add' | 'edit';
// }

// const PartnerFormModal = ({ partner, isOpen, onClose, onSave, mode }: PartnerFormModalProps) => {
//   const [formData, setFormData] = useState({
//     ownerName: '',
//     companyName: '',
//     email: '',
//     phoneNumber: '',
//     address: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     country: 'United States',
//     website: '',
//     description: '',
//     specializations: '',
//     isApproved: true
//   });

//   useEffect(() => {
//     if (mode === 'edit' && partner) {
//       setFormData({
//         ownerName: partner.ownerName,
//         companyName: partner.companyName,
//         email: partner.user.email,
//         phoneNumber: partner.phoneNumber,
//         address: partner.address,
//         city: partner.city,
//         state: partner.state,
//         zipCode: partner.zipCode || '',
//         country: partner.country,
//         website: partner.website || '',
//         description: partner.description || '',
//         specializations: partner.specializations?.join(', ') || '',
//         isApproved: partner.isApproved
//       });
//     } else if (mode === 'add') {
//       setFormData({
//         ownerName: '',
//         companyName: '',
//         email: '',
//         phoneNumber: '',
//         address: '',
//         city: '',
//         state: '',
//         zipCode: '',
//         country: 'United States',
//         website: '',
//         description: '',
//         specializations: '',
//         isApproved: true
//       });
//     }
//   }, [partner, mode, isOpen]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const zipCode = e.target.value;
    
//     // Update the zipCode field first
//     setFormData(prev => ({
//       ...prev,
//       zipCode: zipCode,
//     }));

//     // If zipCode is 5 digits, try to auto-fill city and state
//     if (zipCode.length === 5 && /^\d{5}$/.test(zipCode)) {
//       try {
//         const response = await fetch(`/api/location/lookup-zipcode`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ zipCode }),
//         });

//         const data = await response.json();

//         if (data.success && data.city && data.state) {
//           setFormData(prev => ({
//             ...prev,
//             city: data.city,
//             state: data.state,
//           }));
//         }
//       } catch (error) {
//         console.error('Error looking up zip code:', error);
//         // Don't show error to user, just silently fail
//       }
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
//       <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
//         <div className="mt-3">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-medium text-gray-900">
//               {mode === 'add' ? 'Add New Recruitment Partner' : 'Edit Recruitment Partner'}
//             </h3>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
          
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Owner Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="ownerName"
//                   value={formData.ownerName}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Company Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="companyName"
//                   value={formData.companyName}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Phone Number *
//                 </label>
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={formData.phoneNumber}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   ZIP Code *
//                 </label>
//                 <input
//                   type="text"
//                   name="zipCode"
//                   value={formData.zipCode}
//                   onChange={handleZipCodeChange}
//                   required
//                   pattern="^\d{5}(-\d{4})?$"
//                   placeholder="12345 or 12345-6789"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   City *
//                 </label>
//                 <input
//                   type="text"
//                   name="city"
//                   value={formData.city}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   State *
//                 </label>
//                 <input
//                   type="text"
//                   name="state"
//                   value={formData.state}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Country *
//                 </label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Website
//                 </label>
//                 <input
//                   type="url"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Status
//                 </label>
//                 <select
//                   name="isApproved"
//                   value={formData.isApproved ? 'true' : 'false'}
//                   onChange={(e) => setFormData(prev => ({ ...prev, isApproved: e.target.value === 'true' }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="true">Active</option>
//                   <option value="false">Deactivated</option>
//                 </select>
//               </div>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Address *
//               </label>
//               <input
//                 type="text"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Specializations (comma-separated)
//               </label>
//               <input
//                 type="text"
//                 name="specializations"
//                 value={formData.specializations}
//                 onChange={handleInputChange}
//                 placeholder="e.g., IT, Healthcare, Finance, Marketing"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 rows={3}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
            
//             <div className="flex justify-end space-x-3 pt-4">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 {mode === 'add' ? 'Add Partner' : 'Update Partner'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ProfileModal = ({ partner, isOpen, onClose }: ProfileModalProps) => {
//   if (!isOpen || !partner) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
//       <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
//         <div className="mt-3">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-medium text-gray-900">
//               Recruitment Partner Profile
//             </h3>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
          
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Owner Name</label>
//                 <p className="mt-1 text-sm text-gray-900">{partner.ownerName}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Company Name</label>
//                 <p className="mt-1 text-sm text-gray-900">{partner.companyName}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Email</label>
//                 <p className="mt-1 text-sm text-gray-900">{partner.user.email}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone</label>
//                 <p className="mt-1 text-sm text-gray-900">{partner.phoneNumber}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Status</label>
//                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                   partner.isApproved 
//                     ? 'bg-green-100 text-green-800' 
//                     : 'bg-yellow-100 text-yellow-800'
//                 }`}>
//                   {partner.isApproved ? 'Active' : 'Deactivated'}
//                 </span>
//               </div>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Address</label>
//               <p className="mt-1 text-sm text-gray-900">
//                 {partner.address}, {partner.city}, {partner.state}, {partner.zipCode}, {partner.country}
//               </p>
//             </div>
            
//             {partner.website && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Website</label>
//                 <p className="mt-1 text-sm text-gray-900">{partner.website}</p>
//               </div>
//             )}
            
//             {partner.specializations && partner.specializations.length > 0 && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Specializations</label>
//                 <p className="mt-1 text-sm text-gray-900">{partner.specializations.join(', ')}</p>
//               </div>
//             )}
            
//             {partner.description && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Description</label>
//                 <p className="mt-1 text-sm text-gray-900">{partner.description}</p>
//               </div>
//             )}
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Registered Date</label>
//               <p className="mt-1 text-sm text-gray-900">
//                 {new Date(partner.user.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           </div>
          
//           <div className="mt-6 flex justify-end space-x-3">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function AdminRecruitmentPartnersPage() {
//   const [partners, setPartners] = useState<RecruitmentPartner[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedPartner, setSelectedPartner] = useState<RecruitmentPartner | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editingPartner, setEditingPartner] = useState<RecruitmentPartner | null>(null);
//   const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
//   const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);

//   const generateMockPartners = () => {
//     // Mock data generation disabled - using real API data only
//     console.log("Mock data generation disabled");
//   };

//   useEffect(() => {
//     fetchPartners();
//   }, []);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (activeDropdown) {
//         const target = event.target as Element;
//         const dropdownElement = document.querySelector(`[data-dropdown-id="${activeDropdown}"]`);
        
//         if (dropdownElement && !dropdownElement.contains(target)) {
//           setActiveDropdown(null);
//         }
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [activeDropdown]);
//       }, [activeDropdown]);

//   const fetchPartners = async () => {
//     ];
    
//     const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington", "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Mesa", "Kansas City", "Atlanta", "Long Beach", "Colorado Springs", "Raleigh", "Miami", "Virginia Beach", "Omaha", "Oakland", "Minneapolis", "Tulsa", "Arlington", "Tampa", "New Orleans"];
    
//     const states = ["California", "Texas", "Florida", "New York", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan", "New Jersey", "Virginia", "Washington", "Arizona", "Massachusetts", "Tennessee", "Indiana", "Missouri", "Maryland", "Wisconsin", "Colorado", "Minnesota", "South Carolina", "Alabama", "Louisiana", "Kentucky", "Oregon", "Oklahoma", "Connecticut", "Utah", "Iowa", "Nevada", "Arkansas", "Mississippi", "Kansas", "New Mexico", "Nebraska", "West Virginia", "Idaho", "Hawaii", "New Hampshire", "Maine", "Montana", "Rhode Island", "Delaware", "South Dakota", "North Dakota", "Alaska", "Vermont", "Wyoming"];
    
//     const specializations = [
//       ["IT", "Technology", "Software Development"],
//       ["Healthcare", "Medical", "Nursing"],
//       ["Finance", "Banking", "Accounting"],
//       ["Marketing", "Sales", "Business Development"],
//       ["Engineering", "Manufacturing", "Construction"],
//       ["Human Resources", "Recruiting", "Talent Acquisition"],
//       ["Legal", "Compliance", "Law"],
//       ["Education", "Training", "Academia"],
//       ["Retail", "Customer Service", "Hospitality"],
//       ["Logistics", "Supply Chain", "Transportation"]
//     ];
    
//     for (let i = 1; i <= 50; i++) {
//       const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
//       const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
//       const company = companies[Math.floor(Math.random() * companies.length)];
//       const city = cities[Math.floor(Math.random() * cities.length)];
//       const state = states[Math.floor(Math.random() * states.length)];
//       const isApproved = Math.random() > 0.25; // 75% approved
//       const selectedSpecs = specializations[Math.floor(Math.random() * specializations.length)];
      
//       mockPartners.push({
//         _id: i.toString(),
//         user: {
//           email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
//           createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
//         },
//         ownerName: `${firstName} ${lastName}`,
//         companyName: company,
//         email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
//         phoneNumber: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
//         address: `${Math.floor(Math.random() * 9999 + 1)} ${["Main", "Oak", "Pine", "Cedar", "Elm", "Maple", "Park", "Washington", "Lincoln", "Jefferson"][Math.floor(Math.random() * 10)]} ${"Street Ave Blvd Dr".split(" ")[Math.floor(Math.random() * 4)]}`,
//         city: city,
//         state: state,
//         zipCode: `${Math.floor(Math.random() * 90000 + 10000)}`,
//         country: "United States",
//         isApproved: isApproved,
//         website: `https://www.${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
//         description: `${company} is a leading recruiting firm specializing in ${selectedSpecs.join(', ')} talent acquisition and staffing solutions.`,
//         specializations: selectedSpecs,
//       });
//     }
    
//     console.log("Generated", mockPartners.length, "mock recruitment partners");
//     setPartners(mockPartners);
//   };

//   useEffect(() => {
//     fetchPartners();
//   }, []);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (activeDropdown) {
//         const target = event.target as Element;
//         const dropdownElement = document.querySelector(`[data-dropdown-id="${activeDropdown}"]`);
        
//         if (dropdownElement && !dropdownElement.contains(target)) {
//           setActiveDropdown(null);
//         }
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [activeDropdown]);

//   const fetchPartners = async () => {
//     try {
//       setLoading(true);
//       const response = await adminFetchers.getAdminRecruitmentPartners();
      
//       console.log("API response:", response);
      
//       // Server returns { recruitmentPartners: [...] }
//       if (response.recruitmentPartners) {
//         console.log("Setting partners from API:", response.recruitmentPartners.length, "partners");
//         setPartners(response.recruitmentPartners);
//       } else {
//         console.log("No recruitment partners found in response");
//         setPartners([]);
//       }
//     } catch (err: any) {
//       console.error("Error fetching recruitment partners:", err);
//       setError(err.response?.data?.message || "Failed to fetch recruitment partners");
//       setPartners([]); // Set empty array on error instead of mock data
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleStatus = async (partnerId: string) => {
//     try {
//       const partner = partners.find((p) => p._id === partnerId);
//       if (!partner) return;

//       const newStatus = !partner.isApproved;
      
//       setPartners(
//         partners.map((p) =>
//           p._id === partnerId ? { ...p, isApproved: newStatus } : p
//         )
//       );
//     } catch (err: any) {
//       console.error("Error updating partner status:", err);
//     }
//   };

//   const handleDeletePartner = async (partnerId: string) => {
//     if (!confirm("Are you sure you want to delete this recruitment partner?")) return;
    
//     try {
//       setPartners(partners.filter((p) => p._id !== partnerId));
//     } catch (err: any) {
//       console.error("Error deleting partner:", err);
//     }
//   };

//   // Checkbox selection functions
//   const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.checked) {
//       setSelectedPartnerIds(filteredPartners.map(partner => partner._id));
//     } else {
//       setSelectedPartnerIds([]);
//     }
//   };

//   const handleSelectPartner = (partnerId: string) => {
//     setSelectedPartnerIds(prev => 
//       prev.includes(partnerId) 
//         ? prev.filter(id => id !== partnerId)
//         : [...prev, partnerId]
//     );
//   };

//   const handleBulkApprove = () => {
//     if (selectedPartnerIds.length === 0) {
//       toast.error("Please select recruitment partners to approve");
//       return;
//     }
    
//     setPartners(prev => 
//       prev.map(partner => 
//         selectedPartnerIds.includes(partner._id) 
//           ? { ...partner, isApproved: true }
//           : partner
//       )
//     );
    
//     setSelectedPartnerIds([]);
//     toast.success(`${selectedPartnerIds.length} recruitment partner(s) approved successfully!`);
//   };

//   const handleBulkDeactivate = () => {
//     if (selectedPartnerIds.length === 0) {
//       toast.error("Please select recruitment partners to deactivate");
//       return;
//     }
    
//     setPartners(prev => 
//       prev.map(partner => 
//         selectedPartnerIds.includes(partner._id) 
//           ? { ...partner, isApproved: false }
//           : partner
//       )
//     );
    
//     setSelectedPartnerIds([]);
//     toast.success(`${selectedPartnerIds.length} recruitment partner(s) deactivated successfully!`);
//   };

//   const handleBulkDelete = () => {
//     if (selectedPartnerIds.length === 0) {
//       toast.error("Please select recruitment partners to delete");
//       return;
//     }
    
//     if (!confirm(`Are you sure you want to delete ${selectedPartnerIds.length} recruitment partner(s)?`)) {
//       return;
//     }
    
//     setPartners(prev => prev.filter(partner => !selectedPartnerIds.includes(partner._id)));
//     setSelectedPartnerIds([]);
//     toast.success(`${selectedPartnerIds.length} recruitment partner(s) deleted successfully!`);
//   };

//   const handleViewProfile = (partner: RecruitmentPartner) => {
//     setSelectedPartner(partner);
//     setIsModalOpen(true);
//   };

//   const handleEditPartner = (partner: RecruitmentPartner) => {
//     setEditingPartner(partner);
//     setIsEditModalOpen(true);
//   };

//   const handleAddNew = () => {
//     setIsAddModalOpen(true);
//   };

//   const handleSavePartner = async (partnerData: PartnerFormData) => {
//     try {
//       if (isEditModalOpen && editingPartner) {
//         // Update existing partner
//         const response = await adminFetchers.updateRecruitmentPartner(editingPartner._id, partnerData);
        
//         // Refresh the partners list from the server
//         await fetchPartners();
        
//         setIsEditModalOpen(false);
//         setEditingPartner(null);
//         toast.success("Recruitment partner updated successfully!");
//       } else if (isAddModalOpen) {
//         // Create new partner
//         console.log("Creating new recruitment partner with data:", partnerData);
        
//         const response = await adminFetchers.createRecruitmentPartner(partnerData);
//         console.log("Create response:", response);
        
//         // Refresh the partners list from the server
//         await fetchPartners();
        
//         setIsAddModalOpen(false);
//         toast.success("Recruitment partner added successfully!");
//       }
//     } catch (error: any) {
//       console.error("Error saving recruitment partner:", error);
//       toast.error(error.response?.data?.message || "Failed to save recruitment partner");
//     }
//   };

//   const filteredPartners = partners.filter((partner) =>
//     partner.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     partner.user.email.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   console.log("Total partners:", partners.length);
//   console.log("Filtered partners:", filteredPartners.length);
//   console.log("Search term:", searchTerm);

//   if (loading) {
//     return (
//       <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
//         <DashboardLayout>
//           <div className="animate-pulse">
//             <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//             <div className="bg-white shadow rounded-lg">
//               <div className="h-16 bg-gray-200 rounded-t-lg mb-4"></div>
//               {[...Array(5)].map((_, i) => (
//                 <div key={i} className="h-12 bg-gray-100 border-b border-gray-200"></div>
//               ))}
//             </div>
//           </div>
//         </DashboardLayout>
//       </ProtectedRoute>
//     );
//   }

//   return (
//     <ProtectedRoute allowedRoles={["admin", "sub_admin"]}>
//       <DashboardLayout>
//         <div className="min-h-screen">
//           <div className="space-y-6">
//             <div className="flex justify-between items-center">
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Recruitment Partner Management
//               </h1>
//               <button 
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
//                 onClick={handleAddNew}
//               >
//                 ADD NEW
//               </button>
//             </div>

//             {error && (
//               <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
//                 API connection failed. Showing demo data. Error: {error}
//               </div>
//             )}

//             <div className="bg-white p-4 rounded-lg shadow">
//               <div className="relative max-w-md">
//                 <input
//                   type="text"
//                   placeholder="Search recruitment partners..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Bulk Actions */}
//             {selectedPartnerIds.length > 0 && (
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-blue-800">
//                     {selectedPartnerIds.length} recruitment partner(s) selected
//                   </span>
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={handleBulkApprove}
//                       className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
//                     >
//                       Approve Selected
//                     </button>
//                     <button
//                       onClick={handleBulkDeactivate}
//                       className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
//                     >
//                       Deactivate Selected
//                     </button>
//                     <button
//                       onClick={handleBulkDelete}
//                       className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
//                     >
//                       Delete Selected
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="bg-white shadow rounded-lg overflow-hidden min-h-[600px]">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="hidden sm:table-cell w-12 px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         <input 
//                           type="checkbox" 
//                           className="rounded border-gray-300"
//                           checked={selectedPartnerIds.length === filteredPartners.length && filteredPartners.length > 0}
//                           onChange={handleSelectAll}
//                         />
//                       </th>
//                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Owner Name
//                       </th>
//                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Company Name
//                       </th>
//                       <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Email
//                       </th>
//                       <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Specializations
//                       </th>
//                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredPartners.length === 0 ? (
//                       <tr>
//                         <td colSpan={7} className="px-3 sm:px-6 py-4 text-center text-gray-500">
//                           No recruitment partners found matching your search.
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredPartners.map((partner) => (
//                         <tr key={partner._id} className="hover:bg-gray-50">
//                           <td className="hidden sm:table-cell w-12 px-3 sm:px-6 py-4 whitespace-nowrap">
//                             <input 
//                               type="checkbox" 
//                               className="rounded border-gray-300"
//                               checked={selectedPartnerIds.includes(partner._id)}
//                               onChange={() => handleSelectPartner(partner._id)}
//                             />
//                           </td>
//                           <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                             <div className="truncate max-w-[120px] sm:max-w-none">
//                               {partner.ownerName}
//                             </div>
//                             <div className="sm:hidden text-xs text-gray-500 truncate max-w-[120px]">
//                               {partner.companyName}
//                             </div>
//                           </td>
//                           <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             <div className="truncate max-w-[150px] lg:max-w-none">
//                               {partner.companyName}
//                             </div>
//                           </td>
//                           <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             <div className="truncate max-w-[200px] lg:max-w-none">
//                               {partner.user.email}
//                             </div>
//                           </td>
//                           <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             <div className="truncate max-w-[150px]">
//                               {partner.specializations?.slice(0, 2).join(', ') || 'N/A'}
//                               {partner.specializations && partner.specializations.length > 2 && '...'}
//                             </div>
//                           </td>
//                           <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
//                             <div className="flex flex-col sm:flex-row flex-wrap gap-1">
//                               <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
//                                 partner.isApproved 
//                                   ? 'bg-green-100 text-green-800' 
//                                   : 'bg-red-100 text-red-800'
//                               }`}>
//                                 {partner.isApproved ? 'Active' : 'Deactivated'}
//                               </span>
//                               {/* <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                                 Partner
//                               </span> */}
//                             </div>
//                           </td>
//                           <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
//                             <div className="relative" data-dropdown-id={partner._id}>
//                               <button
//                                 onClick={() => setActiveDropdown(activeDropdown === partner._id ? null : partner._id)}
//                                 className="text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-50 transition-colors"
//                                 title="Actions"
//                               >
//                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                                   <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
//                                 </svg>
//                               </button>
                              
//                               {activeDropdown === partner._id && (
//                                 <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
//                                   <div className="py-1">
//                                     <button
//                                       onClick={() => {
//                                         handleEditPartner(partner);
//                                         setActiveDropdown(null);
//                                       }}
//                                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                                     >
//                                       <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                       </svg>
//                                       Edit Partner
//                                     </button>
                                    
//                                     <button
//                                       onClick={() => {
//                                         handleViewProfile(partner);
//                                         setActiveDropdown(null);
//                                       }}
//                                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                                     >
//                                       <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                                       </svg>
//                                       View Profile
//                                     </button>
                                    
//                                     <button
//                                       onClick={() => {
//                                         handleToggleStatus(partner._id);
//                                         setActiveDropdown(null);
//                                       }}
//                                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                                     >
//                                       <svg className="w-4 h-4 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                       </svg>
//                                       {partner.isApproved ? 'Deactivate' : 'Activate'}
//                                     </button>
                                    
//                                     <div className="border-t border-gray-100 my-1"></div>
                                    
//                                     <button
//                                       onClick={() => {
//                                         handleDeletePartner(partner._id);
//                                         setActiveDropdown(null);
//                                       }}
//                                       className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                                     >
//                                       <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                       </svg>
//                                       Delete Partner
//                                     </button>
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>

//         <ProfileModal
//           partner={selectedPartner}
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//         />

//         <PartnerFormModal
//           partner={null}
//           isOpen={isAddModalOpen}
//           onClose={() => setIsAddModalOpen(false)}
//           onSave={handleSavePartner}
//           mode="add"
//         />

//         <PartnerFormModal
//           partner={editingPartner}
//           isOpen={isEditModalOpen}
//           onClose={() => setIsEditModalOpen(false)}
//           onSave={handleSavePartner}
//           mode="edit"
//         />
//       </DashboardLayout>
//     </ProtectedRoute>
//   );
// }