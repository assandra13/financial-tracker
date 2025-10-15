import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  DollarSign,
  CreditCard,
  Edit,
  Trash2,
  Download,
  Target,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogIn,
  UserPlus,
  LogOut,
  Eye,
  EyeOff,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Edit3,
  Key,
  Mail,
  Plus,
  Save,
  X,
  History,
  Filter,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import CustomAccountManager from "./components/CustomAccountManager";
import ConfirmationModal from "./components/ConfirmationModal";
import ModernSelect from "./components/ModernSelect";
import DatePicker from "./components/DatePicker";
import { supabase } from "./supabase";

const FinancialTracker = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auth Form
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  // Main App State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [customAccounts, setCustomAccounts] = useState([
    { id: "cash", type: "cash", name: "Cash", balance: 76000 },
    { id: "gopay", type: "digital", name: "Gopay", balance: 900 },
    { id: "dana", type: "digital", name: "Dana", balance: 0 },
    { id: "shopeepay", type: "digital", name: "ShopeePay", balance: 46046 },
    { id: "mandiri", type: "bank", name: "Bank Mandiri", balance: 343552 },
    { id: "maybank", type: "bank", name: "Bank Maybank", balance: 1130022 },
  ]);

  const [budgets, setBudgets] = useState({});
  const [goals, setGoals] = useState([]);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("monthly");

  // Helper Functions - TAMBAHKAN FUNGSI TANGGAL LOKAL
  const getLocalDateString = () => {
    const now = new Date();
    // Adjust for timezone offset to get local date
    const timezoneOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(now.getTime() - timezoneOffset);
    return localDate.toISOString().split("T")[0];
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().split("T")[0];
  };

  // State untuk form input - PERBAIKI INISIALISASI TANGGAL
  const [incomeForm, setIncomeForm] = useState({
    amount: "",
    source: "",
    category: "salary",
    date: getLocalDateString(), // GUNAKAN FUNGSI BARU
    description: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: "food",
    subcategory: "",
    paymentMethod: "cash",
    date: getLocalDateString(), // GUNAKAN FUNGSI BARU
    description: "",
  });

  const [budgetForm, setBudgetForm] = useState({
    category: "food",
    amount: "",
    period: "monthly",
  });

  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    deadline: "",
    description: "",
  });

  // Modal states
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showGoalProgressModal, setShowGoalProgressModal] = useState(false);
  const [goalProgressForm, setGoalProgressForm] = useState({ currentAmount: "" });

  // Confirmation Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [showDeleteGoalModal, setShowDeleteGoalModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // Account Manager Modals
  const [showAccountSuccessModal, setShowAccountSuccessModal] = useState(false);
  const [accountSuccessMessage, setAccountSuccessMessage] = useState("");

  // Riwayat State
  const [historyFilter, setHistoryFilter] = useState("all");
  const [historySort, setHistorySort] = useState("newest");

  // Enhanced Categories
  const incomeCategories = {
    salary: "Gaji",
    freelance: "Freelance",
    investment: "Investasi",
    bonus: "Bonus",
    business: "Bisnis",
    passive: "Passive Income",
    gift: "Hadiah",
    other: "Lainnya",
  };

  const expenseCategories = {
    food: {
      name: "Makanan & Minuman",
      subcategories: ["Sarapan", "Makan Siang", "Makan Malam", "Snack", "Minuman", "Groceries", "Restaurant", "Cafe", "Fast Food"],
    },
    transport: {
      name: "Transportasi",
      subcategories: ["Bensin", "Ojol", "Bus/Angkot", "Parkir", "Tol", "Service Kendaraan", "Car Wash"],
    },
    bills: {
      name: "Tagihan & Utilities",
      subcategories: ["Listrik", "Air", "Internet", "HP", "Asuransi", "Cicilan", "Pajak", "TV Cable", "Token Listrik", "Pulsa", "Paket Data"],
    },
    shopping: {
      name: "Belanja",
      subcategories: ["Pakaian", "Elektronik", "Rumah Tangga", "Kosmetik", "Fashion", "Gadget", "Furniture", "Kitchen Supplies"],
    },
    entertainment: {
      name: "Hiburan",
      subcategories: ["Nonton", "Game", "Rekreasi", "Hobi", "Olahraga", "Streaming", "Concert/Events"],
    },
    health: {
      name: "Kesehatan",
      subcategories: ["Dokter", "Obat", "Vitamin", "Medical Check-up", "Dental", "Gym", "Hospital", "Lab Tests"],
    },
    education: {
      name: "Pendidikan",
      subcategories: ["Kursus", "Buku", "Seminar", "Subscription", "Alat Tulis", "Training", "Online Learning"],
    },
    gifts: {
      name: "Gifts & Donations",
      subcategories: ["Hadiah", "Sedekah", "Zakat", "Social Contribution", "Religious Donation"],
    },
    other: {
      name: "Lainnya",
      subcategories: ["Miscellaneous"],
    },
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C", "#A28BFE", "#FF6B9D"];

  // Warna untuk navigasi tab
  const tabColors = {
    dashboard: "bg-blue-600 text-white shadow-blue-200",
    income: "bg-green-600 text-white shadow-green-200",
    expense: "bg-red-600 text-white shadow-red-200",
    analytics: "bg-purple-600 text-white shadow-purple-200",
    goals: "bg-orange-600 text-white shadow-orange-200",
    history: "bg-indigo-600 text-white shadow-indigo-200",
  };

  // Helper Functions
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

  const getAccountName = (accountId) => {
    const account = customAccounts.find((acc) => acc.id === accountId);
    return account ? account.name : accountId;
  };

  const getAccountBalance = (accountId) => {
    const account = customAccounts.find((acc) => acc.id === accountId);
    return account ? account.balance : 0;
  };

  // Custom Alert Function
  const showCustomAlert = (message, type = "info") => {
    const alertDiv = document.createElement("div");
    alertDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg text-white font-medium max-w-sm transform transition-all duration-500 ${
      type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : type === "warning" ? "bg-yellow-500" : "bg-blue-500"
    }`;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  };

  // Account Success Alert Function
  const showAccountSuccessAlert = (message) => {
    setAccountSuccessMessage(message);
    setShowAccountSuccessModal(true);
  };

  // 🔽 TARUH KODE INI DI SINI 🔽
  // Function untuk migrasi data lokal ke Supabase (otomatis setelah login)
  const migrateDataToSupabase = async (username) => {
    try {
      console.log("Starting migration for user:", username);

      // 1. Load data lokal
      const localData = JSON.parse(localStorage.getItem(`financial_data_${username}`) || "{}");
      const users = JSON.parse(localStorage.getItem("financial_users") || "{}");
      const userData = users[username];

      if (!userData) {
        console.log("No user data found for migration");
        return;
      }

      // 2. Daftar user di Supabase (jika belum ada)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError && !authError.message.includes("already registered")) {
        console.error("Auth error during migration:", authError);
        return;
      }

      // 3. Simpan data ke Supabase
      const { error: dbError } = await supabase.from("users").upsert({
        id: authData?.user?.id || username, // Fallback ke username jika auth gagal
        username: username,
        email: userData.email,
        custom_accounts: localData.customAccounts || [],
        transactions: localData.transactions || [],
        budgets: localData.budgets || {},
        goals: localData.goals || [],
        created_at: userData.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("Database error during migration:", dbError);
      } else {
        console.log("Migration successful for user:", username);
        showCustomAlert(`Data ${username} berhasil di-migrasi ke cloud!`, "success");
      }
    } catch (error) {
      console.error("Migration error:", error);
    }
  };
  // 🔼 SAMPAI DI SINI 🔼

  // Auth Functions
  const handleRegister = async () => {
    if (!authForm.username || !authForm.email || !authForm.password) {
      showCustomAlert("Harap isi semua field!", "warning");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Daftar user di Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
      });

      if (authError) throw authError;

      // 2. Simpan data user ke table
      const { error: dbError } = await supabase.from("users").insert({
        id: authData.user.id,
        username: authForm.username,
        email: authForm.email,
        custom_accounts: [],
        transactions: [],
        budgets: {},
        goals: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      setCurrentUser(authData.user.id);
      setIsAuthenticated(true);
      setShowAuthModal(false);

      showCustomAlert("Registrasi berhasil!", "success");
    } catch (error) {
      showCustomAlert("Error: " + error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!authForm.username || !authForm.password) {
      showCustomAlert("Harap isi username dan password!", "warning");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Coba login dengan sistem lama (localStorage)
      const users = JSON.parse(localStorage.getItem("financial_users") || "{}");
      const user = users[authForm.username];

      if (user && user.password === authForm.password) {
        // Login berhasil dengan sistem lama
        setCurrentUser(authForm.username);
        setIsAuthenticated(true);
        setShowAuthModal(false);

        // Load data lokal
        const localData = JSON.parse(localStorage.getItem(`financial_data_${authForm.username}`) || "{}");
        setTransactions(localData.transactions || []);
        setBudgets(localData.budgets || {});
        setGoals(localData.goals || []);
        setCustomAccounts(localData.customAccounts || customAccounts);

        showCustomAlert("Login berhasil! Selamat datang kembali " + authForm.username, "success");

        // 🔽 TAMBAHKAN INI: Auto-migrasi ke Supabase 🔽
        setTimeout(() => {
          migrateDataToSupabase(authForm.username);
        }, 2000);
        // 🔼 SAMPAI DI SINI 🔼

        return;
      }

      // 2. Jika tidak ada di sistem lama, coba Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authForm.email, // Untuk Supabase pakai email
        password: authForm.password,
      });

      if (error) throw error;

      setCurrentUser(data.user.id);
      setIsAuthenticated(true);
      setShowAuthModal(false);

      showCustomAlert("Login berhasil!", "success");
    } catch (error) {
      showCustomAlert("Username/email atau password salah!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      showCustomAlert("Harap masukkan email Anda", "warning");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showCustomAlert("Instruksi reset password telah dikirim ke email Anda!", "success");
      setForgotPasswordMode(false);
      setForgotPasswordEmail("");
    } catch (error) {
      showCustomAlert("Terjadi kesalahan", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowAuthModal(true);
    setAuthForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    showCustomAlert("Logout berhasil!", "success");
  };

  // Load data dari Supabase saat login
  useEffect(() => {
    if (!currentUser) return;

    const loadUserData = async () => {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", currentUser).single();

        if (error) throw error;

        if (data) {
          setTransactions(data.transactions || []);
          setBudgets(data.budgets || {});
          setGoals(data.goals || []);
          setCustomAccounts(data.custom_accounts || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadUserData();
  }, [currentUser]);

  // Auto-save ke Supabase
  useEffect(() => {
    if (!currentUser) return;

    const saveData = async () => {
      try {
        await supabase
          .from("users")
          .update({
            transactions: transactions,
            budgets: budgets,
            goals: goals,
            custom_accounts: customAccounts,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentUser);
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };

    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [transactions, budgets, goals, customAccounts, currentUser]);

  // Handle custom accounts change
  const handleCustomAccountsChange = (newAccounts) => {
    setCustomAccounts(newAccounts);
  };

  // 1. Fungsi addIncome() - DIPERBAIKI dengan TANGGAL LOKAL
  const addIncome = () => {
    if (!incomeForm.amount || !incomeForm.source) {
      showCustomAlert("Harap isi jumlah dan sumber pemasukan!", "warning");
      return;
    }

    const amount = parseFormattedNumber(incomeForm.amount);

    if (amount <= 0) {
      showCustomAlert("Jumlah pemasukan harus lebih dari 0!", "warning");
      return;
    }

    // FIX: Pastikan tanggal menggunakan format yang benar
    const transactionDate = incomeForm.date || getLocalDateString();

    // Create proper transaction object with unique ID
    const newTransaction = {
      id: `income-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "income",
      amount: amount,
      source: incomeForm.source,
      category: incomeForm.category,
      date: transactionDate, // GUNAKAN TANGGAL YANG SUDAH DIPASTIKAN
      description: incomeForm.description || "",
      timestamp: new Date().toISOString(),
    };

    // Update transactions state
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);

    // Update account balances - distribute equally
    const accountCount = customAccounts.length;
    const amountPerAccount = Math.floor(amount / accountCount);
    const remainder = amount - amountPerAccount * accountCount;

    const updatedAccounts = customAccounts.map((account, index) => ({
      ...account,
      balance: account.balance + amountPerAccount + (index === 0 ? remainder : 0),
    }));

    setCustomAccounts(updatedAccounts);

    // Reset form dengan tanggal lokal
    setIncomeForm({
      amount: "",
      source: "",
      category: "salary",
      date: getLocalDateString(), // RESET KE TANGGAL LOKAL
      description: "",
    });

    // Manual save untuk memastikan data tersimpan
    if (currentUser) {
      const dataToSave = {
        transactions: updatedTransactions,
        budgets,
        goals,
        customAccounts: updatedAccounts,
      };
      localStorage.setItem(`financial_data_${currentUser}`, JSON.stringify(dataToSave));
    }

    showCustomAlert("Pemasukan berhasil ditambahkan!", "success");
  };

  // 2. Fungsi addExpense() - DIPERBAIKI dengan TANGGAL LOKAL
  const addExpense = () => {
    if (!expenseForm.amount) {
      showCustomAlert("Harap isi jumlah pengeluaran!", "warning");
      return;
    }

    const amount = parseFormattedNumber(expenseForm.amount);

    if (amount <= 0) {
      showCustomAlert("Jumlah pengeluaran harus lebih dari 0!", "warning");
      return;
    }

    const selectedAccount = customAccounts.find((acc) => acc.id === expenseForm.paymentMethod);

    if (!selectedAccount) {
      showCustomAlert("Metode pembayaran tidak valid!", "error");
      return;
    }

    if (selectedAccount.balance < amount) {
      showCustomAlert(`Saldo ${selectedAccount.name} tidak mencukupi! Saldo tersedia: ${formatCurrency(selectedAccount.balance)}`, "error");
      return;
    }

    // FIX: Pastikan tanggal menggunakan format yang benar
    const transactionDate = expenseForm.date || getLocalDateString();

    // Create proper transaction object with unique ID
    const newTransaction = {
      id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "expense",
      amount: amount,
      category: expenseForm.category,
      subcategory: expenseForm.subcategory || "",
      paymentMethod: expenseForm.paymentMethod,
      date: transactionDate, // GUNAKAN TANGGAL YANG SUDAH DIPASTIKAN
      description: expenseForm.description || "",
      timestamp: new Date().toISOString(),
    };

    // Update transactions state
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);

    // Update account balance
    const updatedAccounts = customAccounts.map((account) => (account.id === expenseForm.paymentMethod ? { ...account, balance: account.balance - amount } : account));
    setCustomAccounts(updatedAccounts);

    // Reset form dengan tanggal lokal
    setExpenseForm({
      amount: "",
      category: "food",
      subcategory: "",
      paymentMethod: "cash",
      date: getLocalDateString(), // RESET KE TANGGAL LOKAL
      description: "",
    });

    // Manual save untuk memastikan data tersimpan
    if (currentUser) {
      const dataToSave = {
        transactions: updatedTransactions,
        budgets,
        goals,
        customAccounts: updatedAccounts,
      };
      localStorage.setItem(`financial_data_${currentUser}`, JSON.stringify(dataToSave));
    }

    showCustomAlert("Pengeluaran berhasil ditambahkan!", "success");
  };

  const deleteTransaction = (id) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!transactionToDelete) return;

    const transaction = transactionToDelete;

    if (transaction.type === "income") {
      // Return income amount (distribute back)
      const accountCount = customAccounts.length;
      const amountPerAccount = Math.floor(transaction.amount / accountCount);
      const remainder = transaction.amount - amountPerAccount * accountCount;

      const updatedAccounts = customAccounts.map((account, index) => ({
        ...account,
        balance: account.balance - amountPerAccount - (index === 0 ? remainder : 0),
      }));
      setCustomAccounts(updatedAccounts);
    } else {
      // Return expense amount to account
      const updatedAccounts = customAccounts.map((account) => (account.id === transaction.paymentMethod ? { ...account, balance: account.balance + transaction.amount } : account));
      setCustomAccounts(updatedAccounts);
    }

    const updatedTransactions = transactions.filter((t) => t.id !== transactionToDelete.id);
    setTransactions(updatedTransactions);
    setShowDeleteModal(false);
    setTransactionToDelete(null);
    showCustomAlert("Transaksi berhasil dihapus!", "success");
  };

  const addBudget = () => {
    if (!budgetForm.amount) {
      showCustomAlert("Harap isi jumlah budget!", "warning");
      return;
    }

    const amount = parseFormattedNumber(budgetForm.amount);

    if (amount <= 0) {
      showCustomAlert("Jumlah budget harus lebih dari 0!", "warning");
      return;
    }

    const updatedBudgets = {
      ...budgets,
      [budgetForm.category]: {
        amount: amount,
        period: budgetForm.period,
      },
    };

    setBudgets(updatedBudgets);
    setBudgetForm({ category: "food", amount: "", period: "monthly" });
    setShowBudgetModal(false);
    showCustomAlert("Budget berhasil ditambahkan!", "success");
  };

  // Goal Functions
  const addGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) {
      showCustomAlert("Harap isi nama dan target goal!", "warning");
      return;
    }

    const targetAmount = parseFormattedNumber(goalForm.targetAmount);
    const currentAmount = parseFormattedNumber(goalForm.currentAmount || "0");

    if (targetAmount <= 0) {
      showCustomAlert("Target amount harus lebih dari 0!", "warning");
      return;
    }

    const newGoal = {
      id: Date.now(),
      name: goalForm.name,
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      deadline: goalForm.deadline,
      description: goalForm.description,
      createdAt: new Date().toISOString(),
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    setGoalForm({ name: "", targetAmount: "", currentAmount: "0", deadline: "", description: "" });
    setShowGoalModal(false);
    showCustomAlert("Goal berhasil ditambahkan!", "success");
  };

  const deleteGoal = (goal) => {
    setGoalToDelete(goal);
    setShowDeleteGoalModal(true);
  };

  const confirmDeleteGoal = () => {
    if (!goalToDelete) return;

    const updatedGoals = goals.filter((goal) => goal.id !== goalToDelete.id);
    setGoals(updatedGoals);
    setShowDeleteGoalModal(false);
    setGoalToDelete(null);
    showCustomAlert("Goal berhasil dihapus!", "success");
  };

  // Analytics Functions
  const getStats = () => {
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    const totalSaldo = customAccounts.reduce((sum, account) => sum + account.balance, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      totalSaldo,
    };
  };

  const getMonthlyStats = (month, year) => {
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      count: monthTransactions.length,
      transactions: monthTransactions,
    };
  };

  const getYearlyStats = (year) => {
    const yearTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year;
    });

    const income = yearTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

    const expense = yearTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      count: yearTransactions.length,
      transactions: yearTransactions,
    };
  };

  const getMonthlyTrend = () => {
    const monthlyData = {};

    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { income: 0, expense: 0 };
    }

    // Fill with actual data
    transactions.forEach((t) => {
      const month = t.date.substring(0, 7);
      if (monthlyData[month]) {
        if (t.type === "income") {
          monthlyData[month].income += t.amount;
        } else {
          monthlyData[month].expense += t.amount;
        }
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month: `${month.split("-")[1]}/${month.split("-")[0].slice(2)}`,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    }));
  };

  const getExpenseByCategory = (month, year) => {
    const expenseTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return t.type === "expense" && tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    const categoryTotals = {};

    expenseTransactions.forEach((t) => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0;
      }
      categoryTotals[t.category] += t.amount;
    });

    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category: expenseCategories[category]?.name || category,
        amount,
        percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getBudgetStatus = () => {
    const currentMonth = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
    const monthlyExpenses = transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    return Object.entries(budgets).map(([category, budget]) => {
      const spent = monthlyExpenses[category] || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        category: expenseCategories[category]?.name || category,
        budget: budget.amount,
        spent: spent,
        remaining: budget.amount - spent,
        percentage: percentage.toFixed(1),
      };
    });
  };

  // Navigation functions
  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear((prev) => prev - 1);
      } else {
        setSelectedMonth((prev) => prev - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear((prev) => prev + 1);
      } else {
        setSelectedMonth((prev) => prev + 1);
      }
    }
  };

  const navigateYear = (direction) => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleAmountChange = (value, formType) => {
    const formatted = formatNumberInput(value);
    if (formType === "income") {
      setIncomeForm({ ...incomeForm, amount: formatted });
    } else {
      setExpenseForm({ ...expenseForm, amount: formatted });
    }
  };

  // Export function
  const exportToCSV = () => {
    const csvContent =
      "Data Tanggal,Kategori,Jumlah,Tipe,Deskripsi\n" +
      transactions
        .map((t) => `"${t.date}","${t.type === "income" ? incomeCategories[t.category] : expenseCategories[t.category]?.name}","${t.amount}","${t.type === "income" ? "Pemasukan" : "Pengeluaran"}","${t.description || ""}"`)
        .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-keuangan-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3. Fungsi getFilteredHistory() - LENGKAP
  const getFilteredHistory = () => {
    let filtered = [...transactions];

    // Filter by type
    if (historyFilter === "income") {
      filtered = filtered.filter((t) => t.type === "income");
    } else if (historyFilter === "expense") {
      filtered = filtered.filter((t) => t.type === "expense");
    }

    // Sort by timestamp (date + time)
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);
      return historySort === "newest" ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  };

  const stats = getStats();
  const monthlyStats = getMonthlyStats(selectedMonth, selectedYear);
  const yearlyStats = getYearlyStats(selectedYear);
  const monthlyTrend = getMonthlyTrend();
  const expenseByCategory = getExpenseByCategory(selectedMonth, selectedYear);
  const budgetStatus = getBudgetStatus();
  const filteredHistory = getFilteredHistory();

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  // Filter transactions based on view mode
  const filteredTransactions = viewMode === "monthly" ? monthlyStats.transactions : yearlyStats.transactions;

  // Auth Modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Tracker Pro</h1>
            <p className="text-gray-600 mt-2">Kelola keuangan Anda dengan mudah</p>
          </div>

          {forgotPasswordMode ? (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Key className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-semibold text-gray-900">Lupa Password</h2>
                <p className="text-gray-600 text-sm">Masukkan email Anda untuk reset password</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
                <input type="email" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} className="input-smooth w-full" placeholder="Enter your registered email" />
              </div>
              <button onClick={handleForgotPassword} className="btn-primary w-full py-3 text-lg flex items-center justify-center space-x-2" disabled={isLoading}>
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Mail className="h-5 w-5" />}
                <span>{isLoading ? "Mengirim..." : "Reset Password"}</span>
              </button>
              <button
                onClick={() => {
                  setForgotPasswordMode(false);
                  setForgotPasswordEmail("");
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium w-full py-2 text-center"
              >
                ← Kembali ke Login
              </button>
            </div>
          ) : (
            <>
              <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
                <button onClick={() => setAuthMode("login")} className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${authMode === "login" ? "bg-white text-blue-600 shadow-lg" : "text-gray-600 hover:text-gray-800"}`}>
                  <LogIn className="h-4 w-4 inline mr-2" />
                  Login
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${authMode === "register" ? "bg-white text-blue-600 shadow-lg" : "text-gray-600 hover:text-gray-800"}`}
                >
                  <UserPlus className="h-4 w-4 inline mr-2" />
                  Daftar
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Username</label>
                  <input type="text" value={authForm.username} onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} className="input-smooth w-full" placeholder="Enter your username" />
                </div>

                {authMode === "register" && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
                    <input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="input-smooth w-full" placeholder="Enter your email" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="input-smooth w-full pr-10"
                      placeholder="Enter your password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authMode === "register" && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                        className="input-smooth w-full pr-10"
                        placeholder="Confirm your password"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {authMode === "login" && (
                  <button onClick={() => setForgotPasswordMode(true)} className="text-blue-600 hover:text-blue-800 text-sm font-medium text-right w-full">
                    Lupa Password?
                  </button>
                )}

                <button onClick={authMode === "login" ? handleLogin : handleRegister} className="btn-primary w-full py-3 text-lg flex items-center justify-center space-x-2" disabled={isLoading}>
                  {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : authMode === "login" ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                  <span>{isLoading ? "Loading..." : authMode === "login" ? "Login" : "Daftar"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Financial Tracker Pro</h1>
                <p className="text-sm text-gray-600">Welcome back, {currentUser}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={exportToCSV} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300">
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <button onClick={() => setShowSettingsModal(true)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300">
                <Settings className="h-5 w-5" />
              </button>
              <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all duration-300">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "income", label: "Pemasukan", icon: TrendingUp },
              { id: "expense", label: "Pengeluaran", icon: TrendingDown },
              { id: "analytics", label: "Analytics", icon: PieChartIcon },
              { id: "goals", label: "Goals", icon: Target },
              { id: "history", label: "Riwayat", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id ? `${tabColors[tab.id]} shadow-lg` : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Pemasukan</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalIncome)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Total Pengeluaran</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalExpense)}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Balance</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(stats.balance)}</p>
                  </div>
                  <Wallet className="h-8 w-8 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Saldo</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalSaldo)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 opacity-80" />
                </div>
              </div>
            </div>

            {/* Account Balances */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Saldo Akun</h2>
                <button onClick={() => setShowAccountManager(true)} className="btn-secondary flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Kelola Akun</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customAccounts.map((account) => (
                  <div key={account.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{account.name}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(account.balance)}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${account.type === "cash" ? "bg-green-100 text-green-600" : account.type === "digital" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                        {account.type === "cash" ? <DollarSign className="h-4 w-4" /> : account.type === "digital" ? <CreditCard className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Transaksi Terbaru</h2>
                <div className="flex items-center space-x-4">
                  <ModernSelect
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    options={[
                      { value: "monthly", label: "Bulan Ini" },
                      { value: "yearly", label: "Tahun Ini" },
                    ]}
                  />
                  <button onClick={() => handleTabChange("history")} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Lihat Semua →
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {filteredTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {transaction.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.type === "income" ? transaction.source : expenseCategories[transaction.category]?.name}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.date} • {transaction.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.type === "expense" && <p className="text-xs text-gray-600">{getAccountName(transaction.paymentMethod)}</p>}
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada transaksi</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Income Tab */}
        {activeTab === "income" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tambah Pemasukan</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Jumlah</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                      <input type="text" value={incomeForm.amount} onChange={(e) => handleAmountChange(e.target.value, "income")} className="input-smooth pl-10 w-full" placeholder="0" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Sumber</label>
                    <input type="text" value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })} className="input-smooth w-full" placeholder="Misal: Gaji, Freelance, dll" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Kategori</label>
                    <ModernSelect
                      value={incomeForm.category}
                      onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                      options={Object.entries(incomeCategories).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Tanggal</label>
                    <DatePicker value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} placeholder="Pilih tanggal pemasukan..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Deskripsi (Opsional)</label>
                    <textarea value={incomeForm.description} onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })} className="input-smooth w-full" rows="3" placeholder="Tambahkan deskripsi..." />
                  </div>

                  <button onClick={addIncome} className="btn-primary w-full py-3">
                    <PlusCircle className="h-5 w-5 inline mr-2" />
                    Tambah Pemasukan
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Statistik Pemasukan</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Bulan Ini</span>
                    <span className="font-bold text-green-600">{formatCurrency(monthlyStats.income)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Tahun Ini</span>
                    <span className="font-bold text-green-600">{formatCurrency(yearlyStats.income)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Jumlah Transaksi</span>
                    <span className="font-bold text-gray-900">{transactions.filter((t) => t.type === "income").length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Kategori Pemasukan</h3>
                <div className="space-y-3">
                  {Object.entries(
                    transactions
                      .filter((t) => t.type === "income")
                      .reduce((acc, t) => {
                        acc[t.category] = (acc[t.category] || 0) + t.amount;
                        return acc;
                      }, {})
                  )
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-gray-600">{incomeCategories[category]}</span>
                        <span className="font-bold text-gray-900">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expense Tab */}
        {activeTab === "expense" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tambah Pengeluaran</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Jumlah</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                      <input type="text" value={expenseForm.amount} onChange={(e) => handleAmountChange(e.target.value, "expense")} className="input-smooth pl-10 w-full" placeholder="0" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Kategori</label>
                      <ModernSelect
                        value={expenseForm.category}
                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value, subcategory: "" })}
                        options={Object.entries(expenseCategories).map(([value, data]) => ({
                          value,
                          label: data.name,
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Sub Kategori</label>
                      <ModernSelect
                        value={expenseForm.subcategory}
                        onChange={(e) => setExpenseForm({ ...expenseForm, subcategory: e.target.value })}
                        options={
                          expenseCategories[expenseForm.category]?.subcategories.map((sub) => ({
                            value: sub,
                            label: sub,
                          })) || []
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Metode Pembayaran</label>
                    <ModernSelect
                      value={expenseForm.paymentMethod}
                      onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                      options={customAccounts.map((account) => ({
                        value: account.id,
                        label: `${account.name} (${formatCurrency(account.balance)})`,
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Tanggal</label>
                    <DatePicker value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} placeholder="Pilih tanggal pengeluaran..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Deskripsi (Opsional)</label>
                    <textarea value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} className="input-smooth w-full" rows="3" placeholder="Tambahkan deskripsi..." />
                  </div>

                  <button onClick={addExpense} className="btn-primary w-full py-3">
                    <PlusCircle className="h-5 w-5 inline mr-2" />
                    Tambah Pengeluaran
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Statistik Pengeluaran</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Bulan Ini</span>
                    <span className="font-bold text-red-600">{formatCurrency(monthlyStats.expense)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Tahun Ini</span>
                    <span className="font-bold text-red-600">{formatCurrency(yearlyStats.expense)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Jumlah Transaksi</span>
                    <span className="font-bold text-gray-900">{transactions.filter((t) => t.type === "expense").length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Pengeluaran per Kategori</h3>
                <div className="space-y-3">
                  {expenseByCategory.slice(0, 5).map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">{item.category}</span>
                        <span className="font-bold text-gray-900 text-sm">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Period Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                    <button onClick={() => navigateMonth("prev")} className="p-2 hover:bg-white rounded-lg transition-all duration-300">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-medium text-gray-900">
                      {monthNames[selectedMonth]} {selectedYear}
                    </span>
                    <button onClick={() => navigateMonth("next")} className="p-2 hover:bg-white rounded-lg transition-all duration-300">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Monthly Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="text-center">
                    <p className="text-green-100 text-sm">Pemasukan</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(monthlyStats.income)}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
                  <div className="text-center">
                    <p className="text-red-100 text-sm">Pengeluaran</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(monthlyStats.expense)}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                  <div className="text-center">
                    <p className="text-blue-100 text-sm">Balance</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(monthlyStats.balance)}</p>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trend Chart */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Trend 6 Bulan Terakhir</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip formatter={(value) => [formatCurrency(value), "Amount"]} labelFormatter={(label) => `Bulan: ${label}`} />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#10b981" }} />
                        <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#ef4444" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Expense by Category */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Pengeluaran per Kategori</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expenseByCategory} cx="50%" cy="50%" labelLine={false} label={({ category, percentage }) => `${category} (${percentage}%)`} outerRadius={80} fill="#8884d8" dataKey="amount">
                          {expenseByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatCurrency(value), "Amount"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Budget Status */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900">Status Budget</h3>
                  <button onClick={() => setShowBudgetModal(true)} className="btn-secondary flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Tambah Budget</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {budgetStatus.length > 0 ? (
                    budgetStatus.map((budget) => (
                      <div key={budget.category} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{budget.category}</span>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${budget.percentage > 100 ? "bg-red-500" : budget.percentage > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">{budget.percentage}% digunakan</span>
                          <span className={`text-sm font-medium ${budget.remaining < 0 ? "text-red-600" : "text-green-600"}`}>{budget.remaining < 0 ? "Over budget" : "Tersisa " + formatCurrency(budget.remaining)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Belum ada budget yang dibuat</p>
                      <button onClick={() => setShowBudgetModal(true)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
                        Tambah budget pertama Anda
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === "goals" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
              <button onClick={() => setShowGoalModal(true)} className="btn-primary flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Tambah Goal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

                return (
                  <div key={goal.id} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-gray-900 text-lg">{goal.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingGoal(goal);
                            setGoalProgressForm({ currentAmount: goal.currentAmount.toString() });
                            setShowGoalProgressModal(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteGoal(goal)} className="p-1 text-red-600 hover:text-red-800 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-gray-600">{formatCurrency(goal.targetAmount)}</span>
                      </div>

                      {goal.deadline && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Target:</span>
                          <span className={`font-medium ${daysLeft < 0 ? "text-red-600" : daysLeft < 7 ? "text-yellow-600" : "text-green-600"}`}>
                            {new Date(goal.deadline).toLocaleDateString("id-ID")}
                            {daysLeft !== null && <span className="ml-2">({daysLeft < 0 ? "Terlambat" : `${daysLeft} hari lagi`})</span>}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {goals.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada goals</h3>
                  <p className="text-gray-600 mb-4">Buat financial goal pertama Anda untuk memulai perencanaan keuangan</p>
                  <button onClick={() => setShowGoalModal(true)} className="btn-primary inline-flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Tambah Goal Pertama</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Riwayat Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Riwayat Transaksi</h2>
                <div className="flex items-center space-x-4">
                  {/* Filter by Type */}
                  <ModernSelect
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    options={[
                      { value: "all", label: "Semua Transaksi" },
                      { value: "income", label: "Pemasukan" },
                      { value: "expense", label: "Pengeluaran" },
                    ]}
                  />

                  {/* Sort by Date */}
                  <ModernSelect
                    value={historySort}
                    onChange={(e) => setHistorySort(e.target.value)}
                    options={[
                      { value: "newest", label: "Terbaru" },
                      { value: "oldest", label: "Terlama" },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {transaction.type === "income" ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.type === "income" ? transaction.source : expenseCategories[transaction.category]?.name}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.date} • {transaction.description}
                          {transaction.type === "expense" && transaction.subcategory && <span> • {transaction.subcategory}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-bold text-lg ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.type === "expense" && <p className="text-xs text-gray-600">{getAccountName(transaction.paymentMethod)}</p>}
                      </div>
                      <button onClick={() => deleteTransaction(transaction.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredHistory.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Belum ada transaksi</p>
                    <p className="text-sm">Mulai tambahkan pemasukan atau pengeluaran pertama Anda</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tambah Budget</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Kategori</label>
                <ModernSelect
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                  options={Object.entries(expenseCategories).map(([value, data]) => ({
                    value,
                    label: data.name,
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Jumlah Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                  <input type="text" value={budgetForm.amount} onChange={(e) => setBudgetForm({ ...budgetForm, amount: formatNumberInput(e.target.value) })} className="input-smooth pl-10 w-full" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Periode</label>
                <ModernSelect
                  value={budgetForm.period}
                  onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value })}
                  options={[
                    { value: "daily", label: "Harian" },
                    { value: "weekly", label: "Mingguan" },
                    { value: "monthly", label: "Bulanan" },
                    { value: "yearly", label: "Tahunan" },
                  ]}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShowBudgetModal(false)} className="flex-1 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300">
                  Batal
                </button>
                <button onClick={addBudget} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300">
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingGoal ? "Edit Goal" : "Tambah Goal"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Nama Goal</label>
                <input type="text" value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })} className="input-smooth w-full" placeholder="Misal: Beli Laptop Baru" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Target Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                  <input type="text" value={goalForm.targetAmount} onChange={(e) => setGoalForm({ ...goalForm, targetAmount: formatNumberInput(e.target.value) })} className="input-smooth pl-10 w-full" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Jumlah Saat Ini</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                  <input type="text" value={goalForm.currentAmount} onChange={(e) => setGoalForm({ ...goalForm, currentAmount: formatNumberInput(e.target.value) })} className="input-smooth pl-10 w-full" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Target Tanggal</label>
                <DatePicker value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} placeholder="Pilih target tanggal..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Deskripsi</label>
                <textarea value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} className="input-smooth w-full" rows="3" placeholder="Deskripsi goal..." />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowGoalModal(false);
                    setEditingGoal(null);
                    setGoalForm({ name: "", targetAmount: "", currentAmount: "0", deadline: "", description: "" });
                  }}
                  className="flex-1 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  Batal
                </button>
                <button onClick={addGoal} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300">
                  {editingGoal ? "Update" : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Progress Modal */}
      {showGoalProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Progress Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Jumlah Saat Ini</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                  <input type="text" value={goalProgressForm.currentAmount} onChange={(e) => setGoalProgressForm({ currentAmount: formatNumberInput(e.target.value) })} className="input-smooth pl-10 w-full" placeholder="0" />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowGoalProgressModal(false);
                    setEditingGoal(null);
                    setGoalProgressForm({ currentAmount: "" });
                  }}
                  className="flex-1 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (editingGoal) {
                      const updatedGoals = goals.map((goal) => (goal.id === editingGoal.id ? { ...goal, currentAmount: parseFormattedNumber(goalProgressForm.currentAmount) } : goal));
                      setGoals(updatedGoals);
                      setShowGoalProgressModal(false);
                      setEditingGoal(null);
                      setGoalProgressForm({ currentAmount: "" });
                      showCustomAlert("Progress goal berhasil diupdate!", "success");
                    }
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pengaturan</h3>
            <div className="space-y-6">
              <div className="p-6 border border-gray-200 rounded-xl">
                <div className="flex flex-col space-y-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-lg">Export Data</p>
                    <p className="text-gray-600 mt-2">Download data keuangan dalam format CSV untuk backup atau analisis lebih lanjut</p>
                  </div>
                  <button onClick={exportToCSV} className="btn-secondary flex items-center justify-center space-x-2 w-full md:w-auto">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="p-6 border border-gray-200 rounded-xl">
                <div className="flex flex-col space-y-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-lg">Kelola Akun</p>
                    <p className="text-gray-600 mt-2">Tambah, edit, atau hapus akun pembayaran untuk mengelola saldo Anda</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowAccountManager(true);
                    }}
                    className="btn-secondary flex items-center justify-center space-x-2 w-full md:w-auto"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Kelola</span>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button onClick={() => setShowSettingsModal(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Manager Modal */}
      {showAccountManager && (
        <CustomAccountManager
          accounts={customAccounts}
          onAccountsChange={handleCustomAccountsChange}
          onClose={() => setShowAccountManager(false)}
          showSuccessAlert={showAccountSuccessAlert} // TAMBAH INI
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={confirmDelete} title="Hapus Transaksi" message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan." />

      <ConfirmationModal
        isOpen={showDeleteGoalModal}
        onClose={() => setShowDeleteGoalModal(false)}
        onConfirm={confirmDeleteGoal}
        title="Hapus Goal"
        message="Apakah Anda yakin ingin menghapus goal ini? Tindakan ini tidak dapat dibatalkan."
      />

      {/* Account Success Modal */}
      <ConfirmationModal
        isOpen={showAccountSuccessModal}
        onClose={() => setShowAccountSuccessModal(false)}
        onConfirm={() => setShowAccountSuccessModal(false)}
        title="Berhasil"
        message={accountSuccessMessage}
        type="success"
        confirmText="OK"
      />
    </div>
  );
};

export default FinancialTracker;
