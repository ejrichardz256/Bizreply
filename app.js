alert("JS loaded");
const supabaseUrl = "https://ycrxddjxtuhtgtyrjekx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljcnhkZGp4dHVodGd0eXJqZWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzUzNjYsImV4cCI6MjA5MjM1MTM2Nn0.IuZYKluPNpTyX3aASrb25jvtRb8ibid5qQGFVBw9a8Y";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ===== STATE =====
let user = null;
let replies = JSON.parse(localStorage.getItem("replies")) || [];
let customers = [];
let isPro = false;
let referrals = 0;

// ===== INIT =====
window.onload = async () => {
  const { data } = await supabase.auth.getUser();
  user = data.user;

  if (user) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";

    await loadCustomers();
    await loadProfile();
  }

  renderReplies();
  updateStats();
  updateAdmin();
};

// ===== AUTH =====
async function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return alert(error.message);

  user = data.user;

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";

  await loadProfile();
  await loadCustomers();

  updateStats();
  updateAdmin();
}

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) return alert(error.message);

  alert("Check your email to confirm account");
}

// ===== PROFILE (PRO + REFERRALS) =====
async function loadProfile() {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data) {
    isPro = data.is_pro;
    referrals = data.referrals;
  }
}

// ===== STATS =====
function updateStats() {
  const stats = document.getElementById("stats");
  const pro = document.getElementById("proStatus");

  if (stats) {
    stats.innerText =
      `User: ${user?.email || "Guest"} | Customers: ${customers.length} | Replies: ${replies.length} | Referrals: ${referrals}/5`;
  }

  if (pro) {
    pro.innerText = isPro ? "PRO" : "FREE";
  }
}

// ===== ADMIN =====
function updateAdmin() {
  const el = document.getElementById("adminStats");

  if (el) {
    el.innerText =
      `Customers: ${customers.length}\nReplies: ${replies.length}\nReferrals: ${referrals}/5\nPro: ${isPro ? "ACTIVE" : "INACTIVE"}`;
  }
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
    const li = document.createElement("li");
    li.innerText = r;

    li.onclick = () => {
      navigator.clipboard.writeText(r);
      alert("Copied!");
    };

    list.appendChild(li);
  });
}

// ===== CUSTOMERS (SUPABASE) =====
async function addCustomer() {
  const name = prompt("Customer name:");
  const product = prompt("Product:");

  if (!name || !product) return;

  const { error } = await supabase
    .from("customers")
    .insert([
      {
        name,
        product,
        user_id: user.id
      }
    ]);

  if (error) {
    alert("Error saving customer");
    console.log(error);
    return;
  }

  await loadCustomers();
}

async function loadCustomers() {
  const list = document.getElementById("customerList");
  if (!list) return;

  list.innerHTML = "";

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.log(error);
    return;
  }

  customers = data;

  customers.forEach(c => {
    const li = document.createElement("li");

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

// ===== REFERRALS =====
async function inviteFriend() {
  navigator.clipboard.writeText(window.location.href);
  alert("Invite link copied!");

  referrals++;

  await supabase
    .from("profiles")
    .update({ referrals })
    .eq("id", user.id);

  if (referrals >= 5 && !isPro) {
    isPro = true;

    await supabase
      .from("profiles")
      .update({ is_pro: true })
      .eq("id", user.id);

    alert("🎉 You unlocked PRO!");
  }

  updateStats();
  updateAdmin();
}
async function logout() {
  await supabase.auth.signOut();

  user = null;
  localstorage.clear():

  document.getElementById("app").style.display = "none";
  document.getElementById("loginBox").style.display = "block";

  alert("Logged out");
}
function signUp() {
  alert("Signup clicked"); // 👈 ADD THIS

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  alert(email + " " + password); // 👈 DEBUG

  supabase.auth.signUp({ email, password })
}