// ELEMENTS
const deleteModal = document.getElementById("deleteModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

let deleteId = null;
let isClearAll = false;

const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");

const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const customCategory = document.getElementById("customCategory");

const search = document.getElementById("search");
const searchIcon = document.getElementById("searchIcon");
const filterCategory = document.getElementById("filterCategory");

const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");
const clearForm = document.getElementById("clearForm");

// PROFILE
const menuBtn = document.getElementById("menuBtn");
const sidePanel = document.getElementById("sidePanel");
const overlay = document.getElementById("overlay");

const companyInput = document.getElementById("companyInput");
const companyOwner = document.getElementById("companyOwner");
const companyEmail = document.getElementById("companyEmail");
const profileUpload = document.getElementById("profileUpload");
const saveCompany = document.getElementById("saveCompany");

const profilePic = document.getElementById("profilePic");
const profileName = document.getElementById("profileName");

const darkToggle = document.getElementById("darkToggle");

// DATA
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let deleted = [];
let warned = false;

// MENU
menuBtn.onclick = () => {
    sidePanel.classList.toggle("active");
    overlay.classList.toggle("active");
};

overlay.onclick = () => {
    sidePanel.classList.remove("active");
    overlay.classList.remove("active");
};

// LOAD PROFILE
const saved = JSON.parse(localStorage.getItem("profile")) || {};

// FILL INPUT FIELDS
companyInput.value = saved.name || "";
companyOwner.value = saved.workplace || "";
companyEmail.value = saved.email || "";

profileName.innerText = saved.name || "Employee";
profilePic.src = saved.photo || "https://via.placeholder.com/80";

// SAVE PROFILE 
saveCompany.onclick = () => {
    const ok = confirm("Do you want to save this profile?");
    if (!ok) return; 

    const file = profileUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => saveProfile(reader.result);
        reader.readAsDataURL(file);
    } else {
        saveProfile(profilePic.src);
    }

    showToast("✅ Profile Saved Successfully");
    sidePanel.classList.remove("active");
    overlay.classList.remove("active");
    setProfileEditable(false);
};

function saveProfile(img){
    const data = {
        name: companyInput.value,
        workplace: companyOwner.value,
        email: companyEmail.value,
        photo: img
    };

    localStorage.setItem("profile", JSON.stringify(data));

    profileName.innerText = data.name;
    profilePic.src = data.photo;

    welcomeText.innerText = "Welcome!  " + data.name;

    alert("Profile saved!");
}
// EDIT PROFILE
const editProfile = document.getElementById("editProfile");

editProfile.onclick = () => {
    setProfileEditable(true);
};

//EMPLOYEE PROFILE AREA LOCK/ UNLOCK
function setProfileEditable(isEditable) {

    companyInput.disabled = !isEditable;
    companyOwner.disabled = !isEditable;
    companyEmail.disabled = !isEditable;
    profileUpload.disabled = !isEditable;

}

setProfileEditable(false);

// SAVE BUTTON CONFIRM MESSAGE
saveCompany.onclick = () => {

    const ok = confirm("Do you want to save this profile?");

    if(!ok) return; // ❌ cancel na stop

    const file = profileUpload.files[0];

    if(file){
        const reader = new FileReader();
        reader.onload = () => saveProfile(reader.result);
        reader.readAsDataURL(file);
    } else {
        saveProfile(profilePic.src);
    }

    showToast("✅ Profile Saved");

    sidePanel.classList.remove("active");
    overlay.classList.remove("active");

    setProfileEditable(false);
};

// DARK MODE
if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark");
    darkToggle.innerText = "☀️";
} else {
    darkToggle.innerText = "🌙";
}

darkToggle.onclick = () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("darkMode", isDark ? "on" : "off");

    darkToggle.innerText = isDark ? "☀️" : "🌙";
    darkToggle.classList.toggle("active", isDark);
};

// CATEGORY CHANGE
category.addEventListener("change", () => {
    if (category.value === "Other") {
        customCategory.style.display = "block";
        customCategory.focus();
    } else {
        customCategory.style.display = "none";
        customCategory.value = "";
    }
});

//  ADD TRANSACTION
form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!text.value || !amount.value || !category.value) return;

    if (category.value === "Other" && !customCategory.value) {
        alert("Please enter category");
        return;
    }

    const finalCategory = category.value === "Other"
        ? customCategory.value
        : category.value;

    const txn = {
        id: Date.now(),
        text: text.value,
        amount: +amount.value,
        category: finalCategory,
        date: new Date().toLocaleString()
    };

    transactions.unshift(txn);
    update();

    form.reset();
    customCategory.style.display = "none";

    showToast("✅ Record Added Successfully");
});

// CLEAR FORM
clearForm.onclick = () => form.reset();

// HIGHLIGHT
function highlightText(text, keyword) {
    if (!keyword) return text;
    return text.replace(new RegExp(`(${keyword})`, "gi"),
        `<span class="highlight">$1</span>`);
}

// DISPLAY
function display(data = transactions) {
    list.innerHTML = "";
    const keyword = search.value.toLowerCase();

    data.forEach(t => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${highlightText(t.text, keyword)}</td>
            <td>${t.category}</td>
            <td>${t.date}</td>
            <td>Rs.${t.amount}</td>
            <td></td>
        `;

        const action = tr.querySelector("td:last-child");

        const editBtn = document.createElement("button");
        editBtn.innerText = "✏️";
        editBtn.onclick = () => editTxn(t.id);

        const delBtn = document.createElement("button");
        delBtn.innerHTML = "🗑️";
        delBtn.onclick = () => deleteTxn(t.id);

        action.appendChild(editBtn);
        action.appendChild(delBtn);

        list.appendChild(tr);
    });
}

// AMOUNT UPDATE
function update(){
    display();

    const amounts = transactions.map(t => t.amount);

    const total = amounts.reduce((a,b)=>a+b,0);
    const income = amounts.filter(a=>a>0).reduce((a,b)=>a+b,0);
    const expense = amounts.filter(a=>a<0).reduce((a,b)=>a+b,0);

    balance.innerText = "Rs. " + total.toLocaleString();
    money_plus.innerText = "Rs. " + income.toLocaleString();
    money_minus.innerText = "Rs. " + Math.abs(expense).toLocaleString();

    if (total < 100000 && !warned) {
        showNotification("⚠️ Budget is low!");
        warned = true;
    }
    if (total >= 100000) warned = false;

    drawChart();

    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// DELETE
function deleteTxn(id){
    deleteId = id;
    isClearAll = false;

    document.querySelector(".modal-box h2").innerText = "⚠️ Confirm Delete";
    document.querySelector(".modal-box p").innerText = "Are you sure you want to delete this record?";
    deleteModal.classList.add("active");
    
}

// CLEAR ALL 
clearBtn.onclick = () => {
    isClearAll = true;
    deleteId = null;

    document.querySelector(".modal-box h2").innerText = "⚠️ Confirm Clear All";
    document.querySelector(".modal-box p").innerText = "Are you sure you want to clear ALL records?";
    deleteModal.classList.add("active");
};

//  CONFIRM ACTION - CLICK 'Yes' 
confirmDelete.onclick = () => {
    if (isClearAll) {
        // CLEAR ALL
        if (transactions.length > 0) {
            deleted.push([...transactions]); 
            transactions = [];
            showToast("🧹 All Records Cleared");
        }
    } else if (deleteId !== null) {
        // REMOVE ONE ITEM
        const item = transactions.find(t => t.id === deleteId);
        if (item) {
            deleted.push(item); 
            transactions = transactions.filter(t => t.id !== deleteId);
            showToast("🗑️ Deleted Successfully");
        }
    }

    update(); 
    deleteModal.classList.remove("active");
    
    deleteId = null;
    isClearAll = false;
};

cancelDelete.onclick = () => {
    deleteModal.classList.remove("active");
    deleteId = null;
    isClearAll = false;
};

// UNDO CLICK  ADD COME TO 1ST
undoBtn.onclick = () => {
    if (deleted.length > 0) {
        const last = deleted.pop();

        if (Array.isArray(last)) {
            transactions = last; 
        } else {
            transactions.unshift(last); 
        }

        update();
        showToast("↩️ Undo Successful");
    }
};

// EDIT
function editTxn(id){
    const t = transactions.find(x=>x.id===id);

    text.value = t.text;
    amount.value = t.amount;

    if (["Food","Transport","Salary","Office"].includes(t.category)) {
        category.value = t.category;
        customCategory.style.display = "none";
    } else {
        category.value = "Other";
        customCategory.style.display = "block";
        customCategory.value = t.category;
    }

    transactions = transactions.filter(x=>x.id!==id);
    update();
}

// SEARCH
function runSearch(){
    const val = search.value.toLowerCase();

    display(transactions.filter(t =>
        t.text.toLowerCase().includes(val)
    ));
}

searchIcon.onclick = runSearch;
search.addEventListener("input", runSearch);

// FILTER
filterCategory.onchange = () => {
    const val = filterCategory.value;

    display(val === "All"
        ? transactions
        : transactions.filter(t => t.category === val)
    );
};

// CHART
function drawChart(){
    const canvas = document.getElementById("chart");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,canvas.width,canvas.height);

    let income = 0, expense = 0;

    transactions.forEach(t=>{
        if(t.amount > 0) income += t.amount;
        else expense += Math.abs(t.amount);
    });

    let balance = income - expense;
    

    // total for chart (use absolute values)
    const total = income + expense + Math.abs(balance);

    if(total === 0) return;

    const incomePercent = (income / total) * 100;
    const expensePercent = (expense / total) * 100;
    const balancePercent = (Math.abs(balance) / total) * 100;

    let startAngle = 0;

const welcomeText = document.getElementById("welcomeText");

// load time
welcomeText.innerText = "Welcome!  " + (saved.name || "User");

     // EMPTY STATE (IMPORTANT FIX)
    if(total === 0){
        ctx.beginPath();
        ctx.moveTo(150,150);
        ctx.fillStyle = "#ddd";
        ctx.arc(150,150,100,0,2*Math.PI);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText("No Data", 125, 155);

        document.getElementById("chartIncome").innerText = "Income: Rs.0 (0%)";
        document.getElementById("chartExpense").innerText = "Expense: Rs.0 (0%)";
        document.getElementById("chartBalance").innerText = "Balance: Rs.0";

        return;
    }

    // INCOME
    let incomeAngle = (income / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(150,150);
    ctx.fillStyle = "green";
    ctx.arc(150,150,100,startAngle,startAngle + incomeAngle);
    ctx.fill();

    drawLabel(ctx, startAngle + incomeAngle/2, + incomePercent.toFixed(1) + "%");

    startAngle += incomeAngle;

    // EXPENSE
    let expenseAngle = (expense / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(150,150);
    ctx.fillStyle = "red";
    ctx.arc(150,150,100,startAngle,startAngle + expenseAngle);
    ctx.fill();

    drawLabel(ctx, startAngle + expenseAngle/2,  + expensePercent.toFixed(1) + "%");

    startAngle += expenseAngle;

    // BALANCE
    let balanceAngle = (Math.abs(balance) / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(150,150);
    ctx.fillStyle = "gray";
    ctx.arc(150,150,100,startAngle,startAngle + balanceAngle);
    ctx.fill();

    drawLabel(ctx, startAngle + balanceAngle/2,  + balancePercent.toFixed(1) + "%");

    // TEXT UPDATE (IMPORTANT)
    document.getElementById("chartIncome").innerText =
        `Income: Rs.${income.toLocaleString()} (${incomePercent.toFixed(1)}%)`;

    document.getElementById("chartExpense").innerText =
        `Expense: Rs.${expense.toLocaleString()} (${expensePercent.toFixed(1)}%)`;

    document.getElementById("chartBalance").innerText =
        `Balance: Rs.${balance.toLocaleString()}`;

}

// PIE CHART LABEL
function drawLabel(ctx, angle, text){

    const radius = 120;

    const x = 150 + Math.cos(angle) * radius;
    const y = 150 + Math.sin(angle) * radius;

    ctx.fillStyle = "black";
    ctx.font = "24px Arial";

    ctx.fillText(text, x, y);

    const lineX = 150 + Math.cos(angle) * 100;
    const lineY = 150 + Math.sin(angle) * 100;

    ctx.beginPath();
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(x, y);
    ctx.stroke();
}

// NOTIFICATION
function showNotification(msg){
    const div = document.createElement("div");

    div.innerText = msg;

    Object.assign(div.style,{
        position:"fixed",
        top:"20px",
        right:"20px",
        background:"red",
        color:"white",
        padding:"10px",
        borderRadius:"5px"
    });

    document.body.appendChild(div);
    setTimeout(()=>div.remove(),3000);
}

// TOAST
const toast = document.getElementById("toast");

function showToast(msg){
    toast.innerText = msg;
    toast.classList.add("show");

    setTimeout(()=>toast.classList.remove("show"),3000);
}

//FOOTER SECTION 
const footerUser = document.getElementById("footerUser");

if(saved.name){
    footerUser.innerText = "👤 User: " + saved.name;
}

// INIT
update();