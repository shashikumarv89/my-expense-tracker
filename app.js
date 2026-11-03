
// ========================================
// MY EXPENSE TRACKER - INCOME + EXPENSES
// ========================================

const STORAGE_KEY = "myExpenseTracker_transactions";
const BUDGET_KEY = "myExpenseTracker_budgets";

// Load existing records without changing their storage keys
let transactions = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
);

let budgets = JSON.parse(
    localStorage.getItem(BUDGET_KEY) || "{}"
);

// Existing transactions without a type are treated as expenses
transactions = transactions.map(item => ({
    ...item,
    type: item.type || "expense"
}));

const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");
const monthlySavings = document.getElementById("monthlySavings");
const monthlyBudget = document.getElementById("monthlyBudget");
const remainingBudget = document.getElementById("remainingBudget");

const transactionList = document.getElementById("transactionList");
const currentMonth = document.getElementById("currentMonth");
const budgetInput = document.getElementById("budgetInput");

const addExpenseBtn = document.getElementById("addExpenseBtn");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");

const today = new Date();

function getLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

let selectedMonthKey = getLocalDate(today).slice(0, 7);

function money(amount) {
    return Number(amount).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        BUDGET_KEY,
        JSON.stringify(budgets)
    );
}

// Save the upgraded transaction format
saveData();

// ========================================
// CURRENT MONTH
// ========================================

currentMonth.textContent = today.toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" }
);

// ========================================
// TRANSACTION CATEGORIES
// ========================================

const categories = {
    expense: [
        "Food & Groceries",
        "Transport",
        "Shopping",
        "Bills & Utilities",
        "Rent",
        "Medical",
        "Entertainment",
        "Education",
        "Others"
    ],

    income: [
        "Salary",
        "Business Income",
        "Freelance Income",
        "Interest",
        "Investment Returns",
        "Other Income"
    ]
};

// ========================================
// CREATE TRANSACTION FORM
// ========================================

const modal = document.createElement("dialog");
modal.id = "expenseModal";

modal.innerHTML = `
    <form id="expenseForm">

        <h2 id="modalTitle">Add Transaction</h2>

        <label>Transaction Type</label>
        <select id="transactionType" required>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
        </select>

        <label>Description</label>
        <input
            type="text"
            id="description"
            placeholder="Example: Monthly salary"
            maxlength="80"
            required
        >

        <label>Amount (₹)</label>
        <input
            type="number"
            id="amount"
            placeholder="Enter amount"
            min="0.01"
            max="100000000"
            step="0.01"
            required
        >

        <label>Category</label>
        <select id="category" required></select>

        <label>Payment Method</label>
        <select id="payment" required>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
        </select>

        <label>Date</label>
        <input type="date" id="expenseDate" required>

        <div class="modal-actions">
            <button type="button" id="cancelBtn" class="cancel-btn">
                Cancel
            </button>

            <button type="submit" id="submitExpenseBtn">
                Save Transaction
            </button>
        </div>

    </form>
`;

document.body.appendChild(modal);

// ========================================
// MODAL DESIGN
// ========================================

const modalStyle = document.createElement("style");

modalStyle.textContent = `
    #expenseModal {
        width: min(90%, 420px);
        max-height: 90vh;
        overflow-y: auto;
        border: none;
        border-radius: 18px;
        padding: 25px;
        margin: auto;
        box-shadow: 0 10px 40px rgba(0,0,0,0.25);
    }

    #expenseModal::backdrop {
        background: rgba(0,0,0,0.55);
    }

    #expenseForm {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    #expenseForm h2 {
        margin-bottom: 12px;
        font-size: 22px;
    }

    #expenseForm label {
        font-size: 13px;
        font-weight: 600;
        margin-top: 5px;
    }

    #expenseForm input,
    #expenseForm select {
        width: 100%;
        padding: 12px;
        border: 1px solid #DCE3EA;
        border-radius: 9px;
        font-size: 15px;
        background: white;
        color: #172B40;
    }

    .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }

    .modal-actions button {
        flex: 1;
        padding: 13px;
    }

    .cancel-btn {
        background: #E9EEF3;
        color: #172B40;
    }

    .transaction-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 15px 10px;
        background: #F7F9FC;
        border-radius: 12px;
    }

    .transaction-info {
        flex: 1;
        min-width: 0;
    }

    .transaction-info strong {
        display: block;
        font-size: 14px;
        overflow-wrap: anywhere;
    }

    .transaction-info small {
        display: block;
        color: #718096;
        font-size: 11px;
        margin-top: 5px;
    }

    .transaction-amount {
        font-weight: 700;
        font-size: 13px;
        white-space: nowrap;
    }

    .income-amount {
        color: #16834A;
    }

    .expense-amount {
        color: #C34A4A;
    }

    .transaction-actions {
        display: flex;
        gap: 5px;
    }

    .transaction-actions button {
        padding: 7px;
        font-size: 11px;
        background: #E3EAF1;
        color: #172B40;
    }

    .summary-details {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 15px;
    }

    .budget-details {
        margin-top: 22px;
    }

    .budget-progress {
        height: 8px;
        background: #E5EAF0;
        border-radius: 10px;
        overflow: hidden;
        margin-top: 15px;
    }

    .budget-progress div {
        height: 100%;
        background: #55B88A;
        transition: width 0.3s;
    }

    @media (max-width: 380px) {
        .transaction-item {
            flex-wrap: wrap;
        }
    }
`;

document.head.appendChild(modalStyle);

// ========================================
// UPDATE CATEGORY OPTIONS
// ========================================

const typeInput = document.getElementById("transactionType");
const categoryInput = document.getElementById("category");

function updateCategories(selectedCategory = "") {

    const type = typeInput.value;

    categoryInput.innerHTML = categories[type]
        .map(category => `
            <option value="${escapeHTML(category)}">
                ${escapeHTML(category)}
            </option>
        `)
        .join("");

    if (categories[type].includes(selectedCategory)) {
        categoryInput.value = selectedCategory;
    }
}

typeInput.addEventListener("change", () => {
    updateCategories();
});

// ========================================
// ADD AND EDIT TRANSACTIONS
// ========================================

let editingId = null;

function openTransactionForm(transaction = null) {

    editingId = transaction ? transaction.id : null;

    document.getElementById("modalTitle").textContent =
        transaction ? "Edit Transaction" : "Add Transaction";

    document.getElementById("submitExpenseBtn").textContent =
        transaction ? "Update Transaction" : "Save Transaction";

    typeInput.value = transaction?.type || "expense";

    updateCategories(transaction?.category || "");

    document.getElementById("description").value =
        transaction?.description || "";

    document.getElementById("amount").value =
        transaction?.amount || "";

    document.getElementById("payment").value =
        transaction?.payment || "UPI";

    document.getElementById("expenseDate").value =
        transaction?.date || getLocalDate(today);

    modal.showModal();
}

addExpenseBtn.addEventListener("click", () => {
    openTransactionForm();
});

document.getElementById("cancelBtn").addEventListener("click", () => {
    modal.close();
});

modal.addEventListener("click", event => {
    if (event.target === modal) {
        modal.close();
    }
});

// ========================================
// SAVE TRANSACTION
// ========================================

document.getElementById("expenseForm").addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const type = typeInput.value;
        const description = document.getElementById("description").value.trim();
        const amount = Number(document.getElementById("amount").value);
        const category = categoryInput.value;
        const payment = document.getElementById("payment").value;
        const date = document.getElementById("expenseDate").value;

        if (
            !description ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            amount > 100000000 ||
            !date ||
            date > getLocalDate(today) ||
            !["income", "expense"].includes(type)
        ) {
            alert("Please enter valid transaction details.");
            return;
        }

        const transactionData = {
            type,
            description,
            amount,
            category,
            payment,
            date
        };

        if (editingId !== null) {

            const index = transactions.findIndex(
                item => String(item.id) === String(editingId)
            );

            if (index !== -1) {
                transactions[index] = {
                    ...transactions[index],
                    ...transactionData
                };
            }

        } else {

            transactions.push({
                id: Date.now() + Math.random(),
                ...transactionData
            });
        }

        saveData();
        renderApp();
        modal.close();
    }
);

// ========================================
// DISPLAY TRANSACTIONS
// ========================================

function renderTransactions() {

    const monthlyTransactions = transactions
        .filter(item => item.date?.slice(0, 7) === selectedMonthKey)
        .sort((a, b) => b.date.localeCompare(a.date));

    if (monthlyTransactions.length === 0) {
        transactionList.innerHTML = `
            <p class="empty-message">
                No transactions yet. Add your first transaction!
            </p>
        `;
        return;
    }

    transactionList.innerHTML = monthlyTransactions.map(item => {

        const isIncome = item.type === "income";

        return `
            <div class="transaction-item">

                <div class="transaction-info">
                    <strong>${escapeHTML(item.description)}</strong>

                    <small>
                        ${isIncome ? "Income" : "Expense"} ·
                        ${escapeHTML(item.category)} ·
                        ${escapeHTML(item.payment)} ·
                        ${escapeHTML(item.date)}
                    </small>
                </div>

                <div class="transaction-amount ${
                    isIncome ? "income-amount" : "expense-amount"
                }">
                    ${isIncome ? "+" : "−"}${money(item.amount)}
                </div>

                <div class="transaction-actions">
                    <button data-edit="${item.id}">Edit</button>
                    <button data-delete="${item.id}">Delete</button>
                </div>

            </div>
        `;
    }).join("");
}

// ========================================
// EDIT AND DELETE
// ========================================

transactionList.addEventListener("click", event => {

    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;

    if (editId !== undefined) {

        const transaction = transactions.find(
            item => String(item.id) === editId
        );

        if (transaction) {
            openTransactionForm(transaction);
        }
    }

    if (deleteId !== undefined) {

        if (!confirm("Are you sure you want to delete this transaction?")) {
            return;
        }

        transactions = transactions.filter(
            item => String(item.id) !== deleteId
        );

        saveData();
        renderApp();
    }
});

// ========================================
// MONTHLY BUDGET
// ========================================

saveBudgetBtn.addEventListener("click", () => {

    const amount = Number(budgetInput.value);

    if (
        !Number.isFinite(amount) ||
        amount < 0 ||
        amount > 100000000
    ) {
        alert("Please enter a valid monthly budget.");
        return;
    }

    budgets[selectedMonthKey] = amount;

    saveData();
    renderApp();

    budgetInput.value = "";

    alert("Monthly budget saved successfully!");
});

// ========================================
// UPDATE DASHBOARD
// ========================================

function renderDashboard() {

    const monthlyTransactions = transactions.filter(
        item => item.date?.slice(0, 7) === selectedMonthKey
    );

    const income = monthlyTransactions
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = monthlyTransactions
        .filter(item => item.type !== "income")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const savings = income - expenses;

    const budget = Number(budgets[selectedMonthKey] || 0);
    const remaining = budget - expenses;

    totalIncome.textContent = money(income);
    totalExpenses.textContent = money(expenses);
    monthlySavings.textContent = money(savings);

    monthlyBudget.textContent = money(budget);

const budgetStatusLabel = document.getElementById("budgetStatusLabel");

if (remaining < 0) {
    budgetStatusLabel.textContent = "Budget Exceeded";
    remainingBudget.textContent = money(Math.abs(remaining));
    remainingBudget.style.color = "#FF7777";
} else {
    budgetStatusLabel.textContent = "Budget Remaining";
    remainingBudget.textContent = money(remaining);
    remainingBudget.style.color = "#FFFFFF";
}

    monthlySavings.style.color =
        savings < 0 ? "#FFB4B4" : "#FFFFFF";

    remainingBudget.style.color =
        remaining < 0 ? "#FFB4B4" : "#FFFFFF";

    let progress = document.getElementById("budgetProgress");

    if (!progress) {
        progress = document.createElement("div");
        progress.id = "budgetProgress";
        progress.className = "budget-progress";

        document.querySelector(".summary-card").appendChild(progress);
    }

    const percentage = budget > 0
        ? Math.min((expenses / budget) * 100, 100)
        : 0;

    const progressColor = remaining < 0 ? "#FF7777" : "#55B88A";

progress.innerHTML = `
    <div style="width:${percentage}%; background:${progressColor}"></div>
`;
}

// ========================================
// REFRESH APPLICATION
// ========================================


function renderCharts() {

    const monthlyTransactions = transactions.filter(
        item => item.date?.slice(0, 7) === selectedMonthKey
    );

    // Calculate income and expenses
    const income = monthlyTransactions
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = monthlyTransactions
        .filter(item => item.type !== "income")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    // Income vs expenses chart
    const comparison = document.getElementById("incomeExpenseChart");

    const maxAmount = Math.max(income, expenses, 1);

    comparison.innerHTML = [
        {
            label: "Income",
            amount: income,
            className: "income-fill"
        },
        {
            label: "Expenses",
            amount: expenses,
            className: "expense-fill"
        }
    ].map(item => `
        <div class="chart-row">
            <div class="chart-label">
                <span>${item.label}</span>
                <strong>${money(item.amount)}</strong>
            </div>

            <div class="chart-track">
                <div class="chart-fill ${item.className}"
                     style="width:${item.amount / maxAmount * 100}%">
                </div>
            </div>
        </div>
    `).join("");

    // Calculate category-wise expenses
    const categoryTotals = {};

    monthlyTransactions
        .filter(item => item.type !== "income")
        .forEach(item => {
            categoryTotals[item.category] =
                (categoryTotals[item.category] || 0) + Number(item.amount);
        });

    const categoryChart = document.getElementById("categoryChart");

    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length === 0) {
        categoryChart.innerHTML = `
            <p class="chart-empty">
                No expense data available yet.
            </p>
        `;
        return;
    }

    categoryChart.innerHTML = sortedCategories.map(([name, amount]) => {

        const percentage = expenses > 0
            ? (amount / expenses) * 100
            : 0;

        return `
            <div class="chart-row">
                <div class="chart-label">
                    <span>${escapeHTML(name)}</span>
                    <strong>${money(amount)}</strong>
                </div>

                <div class="chart-track">
                    <div class="chart-fill category-fill"
                         style="width:${percentage}%">
                    </div>
                </div>

                <small>${percentage.toFixed(1)}% of expenses</small>
            </div>
        `;
    }).join("");
}

function renderYearlyReport() {

    const yearSelect = document.getElementById("reportYear");
    const year = Number(yearSelect.value);

    if (!year) return;

    const yearTransactions = transactions.filter(
        item => item.date?.slice(0, 4) === String(year)
    );

    const income = yearTransactions
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = yearTransactions
        .filter(item => item.type !== "income")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    document.getElementById("yearIncome").textContent = money(income);

    document.getElementById("yearExpenses").textContent = money(expenses);

    document.getElementById("yearSavings").textContent =
        money(income - expenses);

    // Calculate expenses month by month
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
        month: new Date(year, index, 1).toLocaleDateString("en-IN", {
            month: "long"
        }),
        income: 0,
        expenses: 0
    }));

    yearTransactions.forEach(item => {

        const monthIndex = Number(item.date.slice(5, 7)) - 1;

        if (monthIndex < 0 || monthIndex > 11) return;

        if (item.type === "income") {
            monthlyData[monthIndex].income += Number(item.amount);
        } else {
            monthlyData[monthIndex].expenses += Number(item.amount);
        }
    });

    // Find highest spending month
    const highest = [...monthlyData]
        .sort((a, b) => b.expenses - a.expenses)[0];

    document.getElementById("highestSpendingMonth").textContent =
        highest && highest.expenses > 0
            ? `${highest.month} (${money(highest.expenses)})`
            : "No expenses";

    // Monthly breakdown
    const breakdown = document.getElementById("yearlyBreakdown");

    const maximum = Math.max(
        ...monthlyData.map(item =>
            Math.max(item.income, item.expenses)
        ),
        1
    );

    breakdown.innerHTML = monthlyData.map(item => {

        const incomeWidth = item.income / maximum * 100;
        const expenseWidth = item.expenses / maximum * 100;

        return `
            <div class="year-month-row">

                <div class="year-month-heading">
                    <span>${item.month}</span>
                    <strong>${money(item.income - item.expenses)}</strong>
                </div>

                <div class="year-month-details">
                    <span>Income: ${money(item.income)}</span>
                    <span>Expense: ${money(item.expenses)}</span>
                </div>

                <div class="year-month-bar">
                    <div class="year-income-bar"
                         style="width:${incomeWidth}%"></div>
                    <div class="year-expense-bar"
                         style="width:${expenseWidth}%"></div>
                </div>

            </div>
        `;
    }).join("");
}

// Populate available years
const reportYear = document.getElementById("reportYear");

const availableYears = new Set([
    String(today.getFullYear()),
    ...transactions
        .filter(item => item.date)
        .map(item => item.date.slice(0, 4))
]);

reportYear.innerHTML = [...availableYears]
    .sort((a, b) => Number(b) - Number(a))
    .map(year => `<option value="${year}">${year}</option>`)
    .join("");

reportYear.value = String(today.getFullYear());

reportYear.addEventListener("change", renderYearlyReport);

function renderApp() {
    renderDashboard();
    renderTransactions();
    renderCharts();
    renderYearlyReport();

    budgetInput.value = budgets[selectedMonthKey] ?? "";
}

const reportMonth = document.getElementById("reportMonth");

reportMonth.value = selectedMonthKey;

reportMonth.addEventListener("change", () => {

    if (!reportMonth.value) return;

    selectedMonthKey = reportMonth.value;

    currentMonth.textContent = new Date(
        selectedMonthKey + "-01T00:00:00"
    ).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

    renderApp();
});


function exportTransactions() {

    const headers = [
        "Date",
        "Description",
        "Type",
        "Category",
        "Payment Method",
        "Amount"
    ];

    const rows = transactions.map(item => [
        item.date,
        item.description,
        item.type === "income" ? "Income" : "Expense",
        item.category,
        item.payment,
        Number(item.amount).toFixed(2)
    ]);

    const csvEscape = value => {
        let text = String(value ?? "");

        // Prevent spreadsheet formula injection
        if (/^[=+\-@\t\r]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    };

    const csvContent = [
        headers,
        ...rows
    ].map(row => row.map(csvEscape).join(",")).join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "My_Expense_Report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

document.getElementById("exportBtn").addEventListener(
    "click",
    exportTransactions
);

// ========================================
// FULL DATA BACKUP
// ========================================

document.getElementById("backupBtn").addEventListener("click", () => {

    const backupData = {
        appName: "My Expense Tracker",
        version: 1,
        backupDate: new Date().toISOString(),
        transactions: transactions,
        budgets: budgets
    };

    const blob = new Blob(
        [JSON.stringify(backupData, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "MyExpenseTracker_Backup.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    alert("Your complete financial backup has been downloaded.");
});

// ========================================
// RESTORE DATA
// ========================================

const restoreBtn = document.getElementById("restoreBtn");
const restoreFile = document.getElementById("restoreFile");

restoreBtn.addEventListener("click", () => {
    restoreFile.click();
});

restoreFile.addEventListener("change", async () => {

    const file = restoreFile.files[0];

    if (!file) return;

    try {

        if (file.size > 10 * 1024 * 1024) {
            throw new Error("Backup file is too large.");
        }

        const text = await file.text();
        const backup = JSON.parse(text);

        if (
            backup.appName !== "My Expense Tracker" ||
            !Array.isArray(backup.transactions) ||
            !backup.budgets ||
            typeof backup.budgets !== "object" ||
            Array.isArray(backup.budgets)
        ) {
            throw new Error("Invalid backup file.");
        }

        // Validate transaction records
        const validTransactions = backup.transactions.every(item =>
            item &&
            item.id !== undefined &&
            typeof item.description === "string" &&
            typeof item.date === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
            Number.isFinite(Number(item.amount)) &&
            Number(item.amount) > 0 &&
            Number(item.amount) <= 100000000 &&
            ["income", "expense"].includes(item.type || "expense") &&
            typeof item.category === "string" &&
            typeof item.payment === "string"
        );

        if (!validTransactions) {
            throw new Error("Backup contains invalid transactions.");
        }

        // Validate monthly budgets
        const validBudgets = Object.entries(backup.budgets).every(
            ([month, amount]) =>
                /^\d{4}-(0[1-9]|1[0-2])$/.test(month) &&
                Number.isFinite(Number(amount)) &&
                Number(amount) >= 0 &&
                Number(amount) <= 100000000
        );

        if (!validBudgets) {
            throw new Error("Backup contains invalid budgets.");
        }

        const confirmed = confirm(
            `Found ${backup.transactions.length} transactions. ` +
            "Restore and merge these records with existing data? " +
            "Existing records will not be cleared."
        );

        if (!confirmed) return;

        // Merge by transaction ID instead of deleting existing data
        const merged = new Map(
            transactions.map(item => [String(item.id), item])
        );

        backup.transactions.forEach(item => {
            const restored = {
                ...item,
                type: item.type || "expense"
            };

            merged.set(String(item.id), restored);
        });

        transactions = Array.from(merged.values());

        // Restore monthly budgets
        budgets = {
            ...budgets,
            ...backup.budgets
        };

        saveData();
        renderApp();

        alert("Backup restored successfully!");

    } catch (error) {

        alert("Restore failed: " + error.message);

    } finally {

        restoreFile.value = "";
    }
});

// Start the application
renderApp();
