import React, { useState } from "react";
import { Plus, Trash2, Edit3, Save, X, CreditCard, Wallet, Smartphone, Building } from "lucide-react";
import ModernSelect from "./ModernSelect";
import ConfirmationModal from "./ConfirmationModal"; // IMPORT MODAL CUSTOM

const CustomAccountManager = ({ accounts, onAccountsChange, onClose }) => {
  const [editingAccount, setEditingAccount] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", balance: "" });
  const [newAccountForm, setNewAccountForm] = useState({ type: "cash", name: "", balance: "" });

  // STATE UNTUK MODAL
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const accountTypes = {
    cash: { icon: Wallet, label: "Cash", color: "text-green-600 bg-green-100" },
    digital: { icon: Smartphone, label: "Digital Wallet", color: "text-blue-600 bg-blue-100" },
    bank: { icon: Building, label: "Bank Account", color: "text-purple-600 bg-purple-100" },
  };

  const formatNumberInput = (value) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseFormattedNumber = (value) => {
    return parseFloat(value.replace(/\./g, "")) || 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // FUNGSI UNTUK MENAMPILKAN SUKSES MODAL
  const showSuccessAlert = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account.id);
    setEditForm({
      name: account.name,
      balance: formatNumberInput(account.balance.toString()),
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
      showSuccessAlert("Nama akun tidak boleh kosong!");
      return;
    }

    const updatedAccounts = accounts.map((account) =>
      account.id === editingAccount
        ? {
            ...account,
            name: editForm.name,
            balance: parseFormattedNumber(editForm.balance) || 0,
          }
        : account
    );

    onAccountsChange(updatedAccounts);
    setEditingAccount(null);
    setEditForm({ name: "", balance: "" });
    showSuccessAlert("Akun berhasil diupdate!");
  };

  const handleAddAccount = () => {
    if (!newAccountForm.name.trim()) {
      showSuccessAlert("Nama akun tidak boleh kosong!");
      return;
    }

    const newAccount = {
      id: `account-${Date.now()}`,
      type: newAccountForm.type,
      name: newAccountForm.name,
      balance: parseFormattedNumber(newAccountForm.balance) || 0,
    };

    onAccountsChange([...accounts, newAccount]);
    setNewAccountForm({ type: "cash", name: "", balance: "" });
    showSuccessAlert("Akun baru berhasil ditambahkan!");
  };

  const handleDeleteAccount = (accountId) => {
    if (accounts.length <= 1) {
      showSuccessAlert("Anda harus memiliki setidaknya satu akun!");
      return;
    }

    const account = accounts.find((acc) => acc.id === accountId);
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  // FUNGSI KONFIRMASI DELETE
  const confirmDeleteAccount = () => {
    if (!accountToDelete) return;

    const updatedAccounts = accounts.filter((account) => account.id !== accountToDelete.id);
    onAccountsChange(updatedAccounts);
    setShowDeleteModal(false);
    setAccountToDelete(null);
    showSuccessAlert("Akun berhasil dihapus!");
  };

  const cancelEdit = () => {
    setEditingAccount(null);
    setEditForm({ name: "", balance: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Kelola Akun</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Add New Account */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Tambah Akun Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Tipe Akun</label>
              <ModernSelect
                value={newAccountForm.type}
                onChange={(e) => setNewAccountForm({ ...newAccountForm, type: e.target.value })}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "digital", label: "Digital Wallet" },
                  { value: "bank", label: "Bank Account" },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Nama Akun</label>
              <input
                type="text"
                value={newAccountForm.name}
                onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama akun..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Saldo Awal</label>
              <input
                type="text"
                value={newAccountForm.balance}
                onChange={(e) => setNewAccountForm({ ...newAccountForm, balance: formatNumberInput(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
          <button onClick={handleAddAccount} className="mt-4 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Tambah Akun</span>
          </button>
        </div>

        {/* Accounts List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Akun</h3>
          {accounts.map((account) => {
            const AccountIcon = accountTypes[account.type].icon;
            return (
              <div key={account.id} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                {editingAccount === account.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Nama Akun</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Saldo</label>
                        <input
                          type="text"
                          value={editForm.balance}
                          onChange={(e) => setEditForm({ ...editForm, balance: formatNumberInput(e.target.value) })}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={handleSaveEdit} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Simpan</span>
                      </button>
                      <button onClick={cancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-600 transition-all duration-300 flex items-center space-x-2">
                        <X className="h-4 w-4" />
                        <span>Batal</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${accountTypes[account.type].color}`}>
                        <AccountIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{account.name}</h4>
                        <p className="text-sm text-gray-500">{accountTypes[account.type].label}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(account.balance)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(account)} className="text-blue-600 hover:text-blue-800 transition-colors duration-300">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteAccount(account.id)} className="text-red-600 hover:text-red-800 transition-colors duration-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Hapus Akun"
        message={`Apakah Anda yakin ingin menghapus akun "${accountToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        type="danger"
        confirmText="Hapus"
      />

      {/* SUCCESS MODAL */}
      <ConfirmationModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} onConfirm={() => setShowSuccessModal(false)} title="Berhasil" message={successMessage} type="success" confirmText="OK" />
    </div>
  );
};

export default CustomAccountManager;
