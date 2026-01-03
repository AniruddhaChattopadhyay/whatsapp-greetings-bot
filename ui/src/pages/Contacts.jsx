import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Upload, Download, UserX, Edit2, Trash2 } from 'lucide-react';

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const result = await window.electronAPI.contacts.getAll();
      return result.data;
    },
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const result = await window.electronAPI.contacts.getGroups();
      return result.data;
    },
  });

  const filteredContacts = contacts?.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteContact = useMutation({
    mutationFn: async (id) => {
      return await window.electronAPI.contacts.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
    },
  });

  const blacklistContact = useMutation({
    mutationFn: async ({ id, value }) => {
      return await window.electronAPI.contacts.blacklist(id, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
    },
  });

  const handleImport = async () => {
    const result = await window.electronAPI.files.selectFile({
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    });

    if (result.success && result.data) {
      await window.electronAPI.contacts.importCSV(result.data);
      queryClient.invalidateQueries(['contacts']);
    }
  };

  const handleExport = async () => {
    const result = await window.electronAPI.files.selectSaveFile({
      defaultPath: 'contacts-export.csv',
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    });

    if (result.success && result.data) {
      const csvData = await window.electronAPI.contacts.exportCSV();
      if (csvData.success) {
        await window.electronAPI.files.writeFile(result.data, csvData.data);
      }
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">
            Manage your contact list and groups
          </p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleImport} className="btn btn-secondary">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button onClick={handleExport} className="btn btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading contacts...</p>
          </div>
        ) : filteredContacts && filteredContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Group</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Last Sent</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{contact.name}</td>
                    <td className="py-3 px-4 text-gray-600">{contact.phone}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                        {contact.group}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {contact.blacklisted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {contact.lastSent
                        ? new Date(contact.lastSent).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() =>
                            blacklistContact.mutate({
                              id: contact.id,
                              value: !contact.blacklisted,
                            })
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                          title={contact.blacklisted ? 'Unblock' : 'Block'}
                        >
                          <UserX className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${contact.name}?`)) {
                              deleteContact.mutate(contact.id);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No contacts found</p>
            <p className="text-sm mt-1">Add contacts to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
