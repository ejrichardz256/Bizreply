let replies = JSON.parse(localStorage.getItem("replies")) || [];
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let isPro = localStorage.getItem("isPro") === "true";

// ===== INIT =====
window.onload = () => {
  renderReplies();
  renderCustomers();
  updateStats();
};

// ===== DASHBOARD =====
function updateStats() {
  const statsEl = document.getElementById("stats");
  const proEl = document.getElementById("proStatus");

  if (statsEl) {
    statsEl.innerText =
      `Customers: ${customers.length} | Replies: ${replies.length}`;
  }

  if (proEl) {
    proEl.innerText = isPro ? "PRO" : "FREE";
  }
}

// ===== QUICK REPLIES =====
function addReply() {
  const text = prompt("Enter reply:");
  if (!text) return;

  replies.push(text);
  localStorage.setItem("replies", JSON.stringify(replies));

  renderReplies();
  updateStats();
}

function renderReplies() {
  const list = document.getElementById("replyList");
  if (!list) return;

  list.innerHTML = "";

  replies.forEach((r) => {
    const li = document.createElement("li");
    li.innerText = r;

    li.onclick = () => {
      navigator.clipboard.writeText(r);
      alert("Copied!");
    };

    list.appendChild(li);
  });
}

// ===== CUSTOMERS =====
function addCustomer() {
  const name = prompt("Customer name:");
  const product = prompt("Product:");

  if (!name || !product) return;

  customers.push({ name, product });
  localStorage.setItem("customers", JSON.stringify(customers));

  renderCustomers();
  updateStats();
}

function renderCustomers() {
  const list = document.getElementById("customerList");
  if (!list) return;

  list.innerHTML = "";

  customers.forEach((c, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <b>${c.name}</b> - ${c.product}
      <br>
      <button onclick="sendWhatsApp(${index})">Send WhatsApp</button>
    `;

    list.appendChild(li);
  });
}

// ===== WHATSAPP (PRO FEATURE) =====
function sendWhatsApp(index) {
  if (!isPro) {
    alert("Upgrade to Pro to use WhatsApp feature");
    return;
  }

  const c = customers[index];

  const message = `Hello ${c.name}, your order for ${c.product} is being processed.`;

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}

// ===== PAYMENT SYSTEM =====
function showPayment() {
  if (isPro) {
    alert("You are already Pro 🚀");
    return;
  }

  const msg = `
💰 Upgrade to BizReply Pro

Pay UGX 10,000 using Mobile Money:

📲 MTN: +256783018209
📲 Airtel: +256707477220

After payment:
1. Press OK
2. Enter Transaction ID
3. You will be upgraded to Pro
`;

  const proceed = confirm(msg);

  if (proceed) {
    const txn = prompt("Enter Transaction ID:");

    if (txn && txn.trim().length > 3) {
      verifyPayment(txn);
    } else {
      alert("Invalid Transaction ID");
    }
  }
}

// ===== VERIFY PAYMENT (SIMULATED) =====
function verifyPayment(txn) {
  console.log("Transaction received:", txn);

  isPro = true;
  localStorage.setItem("isPro", "true");

  alert("Payment verified! You are now PRO 🚀");

  updateStats();
}