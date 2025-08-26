let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currentPage = 1;
const expensesPerPage = 10;

document.getElementById('add-expense-btn').addEventListener('click', () => {
    document.getElementById('expense-form').classList.toggle('d-none');
});

document.querySelector('#expense-form form').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;

    expenses.push({ date, amount, description });
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateExpenseList();
    document.getElementById('expense-form').classList.add('d-none');
    document.querySelector('#expense-form form').reset();
});

//filter_expenses_by Date
document.getElementById('filter-btn').addEventListener('click', () => {
    const filterDate = document.getElementById('filter-date').value;
    const filteredExpenses = expenses.filter((expense) => expense.date === filterDate);
    updateExpenseList(filteredExpenses);
});


//download_daily_summary
document.getElementById('download-daily-btn').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    const dailyExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const filteredExpenses = dailyExpenses.filter((expense) => expense.date === today)
    generatePdf(filteredExpenses, 'Daily Summary');
})

//download_weekly_summary
document.getElementById('download-weekly-btn').addEventListener('click', () => {
    const weeklyExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const filteredWeeklyExpenses = weeklyExpenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expenseDate >= weekAgo && expenseDate <= today;
    });
    generatePdf(filteredWeeklyExpenses, 'Weekly Summary');
});

//download_monthly_pdf_summary
document.getElementById('download-monthly-btn').addEventListener('click', () => {
    const monthlyExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const filteredMonthlyExpenses = monthlyExpenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const today = new Date();
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return expenseDate >= monthAgo && expenseDate <= today;
    });
    generatePdf(filteredMonthlyExpenses, 'Monthly Summary');
});

//update_expense_list
function updateExpenseList(filteredExpenses = expenses) {
    const expenseTableBody = document.getElementById('expense-table-body');
    expenseTableBody.innerHTML = '';
    const paginatedExpenses = paginateExpenses(filteredExpenses, currentPage);
    paginatedExpenses.forEach((expense, index) => {
        const row1 = document.createElement('tr');
        row1.innerHTML = `
        <td>${index + 1 + (currentPage - 1) * expensesPerPage}</td>
        <td>${expense.date}</td>
        <td>${expense.amount}</td>
        <td>${expense.description}</td>
        `;
        expenseTableBody.appendChild(row1);
    });
    updatePagination(filteredExpenses.length);
    updateTotalSpend(filteredExpenses);
}

//paginate_expenses
function paginateExpenses(expenses, page) {
    const start = (page - 1) * expensesPerPage;
    const end = start + expensesPerPage;
    return expenses.slice(start, end);
}

//update_pagination
function updatePagination(totalExpenses) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalExpenses / expensesPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-outline-success', 'me-2', 'pagination-btn');
        btn.textContent = `${i}`;
        btn.addEventListener('click', () => {
            currentPage = `${i}`;
            updateExpenseList();
        });
        paginationContainer.appendChild(btn);
    }
}

//calculate_total_spends
function updateTotalSpend(filteredExpenses = expenses) {
    const totalSpendElement = document.getElementById('total-spend');
    const totalSpend = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);
    totalSpendElement.textContent = `${totalSpend}/-`;
}

// const { jsPDF } = window.jspdf;
//generate_pdf_file
function generatePdf(expenses, title) {
    const doc = new jspdf.jsPDF();
    doc.text(title, 10, 10);
    doc.autoTable({
        head: [['Sr. No.', 'Date', 'Amount', 'Description']],
        body: expenses.map((expense, index) => [index + 1, expense.date, expense.amount, expense.description]),
    });
    doc.save(`${title}.pdf`);
}

updateExpenseList();

// document.getElementById('contact-btn').addEventListener('click', () => {
//     alert('www.expensetracker.com');
// });