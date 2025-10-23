import React, { useState } from 'react';

interface AddSemesterModalProps {
  onClose: () => void;
  onAdd: (name: string) => void;
}

const AddSemesterModal: React.FC<AddSemesterModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Tambah Semester Baru</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Semester 1"
            className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-unsri-yellow"
            autoFocus
          />
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-unsri-yellow text-slate-800 rounded-md hover:bg-yellow-500 disabled:bg-gray-300 disabled:opacity-50"
              disabled={!name.trim()}
            >
              Tambah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSemesterModal;