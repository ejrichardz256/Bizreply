const supabaseUrl = "https://ycrxddjxtuhtgtyrjekx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljcnhkZGp4dHVodGd0eXJqZWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzUzNjYsImV4cCI6MjA5MjM1MTM2Nn0.IuZYKluPNpTyX3aASrb25jvtRb8ibid5qQGFVBw9a8Y";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
let replies = JSON.parse(localStorage.getItem("replies")) || [];
let customers = [];
let isPro = localStorage.getItem("isPro") === "true";
let referrals = Number(localStorage.getItem("referrals") || 0);
let currentUser = localStorage.getItem("currentUser") || null;

// ===== INIT =====
window.onload = async () => {
  if (currentUser) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";

    await renderCustomers(); // only load if logged in
  }

  renderReplies();
  updateStats();
  updateAdmin();
};

// ===== LOGIN =====
async function loginUser() {
  const name = document.getElementById("username").value;

  if (!name) return alert("Enter username");

  currentUser = name;
  localStorage.setItem("currentUser", name);

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";

  await renderCustomers(); // 🔥 load immediately
  updateStats();
  updateAdmin();
}

// ===== STATS =====
function updateStats() {
  document.getElementById("stats").innerText =
    `User: ${currentUser} | Customers: ${customers.length} | Replies: ${replies.length} | Referrals: ${referrals}/5`;

  document.getElementById("proStatus").innerText = isPro ? "PRO" : "FREE";
}

// ===== ADMIN =====
function updateAdmin() {
  document.getElementById("adminStats").innerText =
    `Customers: ${customers.length}\nReplies: ${replies.length}\nReferrals: ${referrals}/5\nPro: ${isPro ? "ACTIVE" : "INACTIVE"}`;
}

// ===== REPLIES =====
function addReply() {
  const text = prompt("Enter reply:");
  if (!text) return;

  replies.push(text);
  localStorage.setItem("replies", JSON.stringify(replies));

  renderReplies();
  updateStats();
  updateAdmin();
}

function renderReplies() {
  const list = document.getElementById("replyList");
if (!list) return;

list.innerHTML = "";

  replies.forEach(r => {
    let li = document.createElement("li");
    li.innerText = r;
    li.onclick = () => navigator.clipboard.writeText(r);
    list.appendChild(li);
  });
}

// ===== CUSTOMERS =====
async function addCustomer() {
  const name = prompt("Customer name:");
  const product = prompt("Product:");

  if (!name || !product) return;

  const { error } = await supabase
    .from("customers")
    .insert([{ name, product, user_id: currentUser }]);

  if (error) {
    alert("Error saving customer");
    console.log(error);
    return;
  }

  await renderCustomers();
}

async function renderCustomers() {
  const list = document.getElementById("customerList");
  if (!list) return;

  list.innerHTML = "";

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", currentUser);

  if (error) {
    console.log(error);
    return;
  }

  customers = data;

  customers.forEach((c) => {
    let li = document.createElement("li");

    li.innerHTML = `
      <b>${c.name}</b> - ${c.product}
      <button onclick="sendWhatsApp('${c.name}','${c.product}')">
        Send WhatsApp
      </button>
    `;

    list.appendChild(li);
  });

  updateStats();
  updateAdmin();
}

// ===== WHATSAPP =====
function sendWhatsApp(name, product) {
  if (!isPro) return alert("Upgrade to Pro");

  const msg = `Hello ${name}, your order for ${product} is ready.`;

  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}

// ===== REFERRAL =====
function inviteFriend() {
  navigator.clipboard.writeText(window.location.href);
  trackReferral();
}

function trackReferral() {
  referrals++;
  localStorage.setItem("referrals", referrals);

  if (referrals >= 5 && !isPro) {
    isPro = true;
    localStorage.setItem("isPro", "true");
    alert("You unlocked PRO 🎉");
  }

  updateStats();
  updateAdmin();
}