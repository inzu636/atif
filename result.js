// ==============================
// result.js (NO LOCK SYSTEM)
// ==============================

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase, ref, onValue, update, get
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDs2053g6QCkdd04JQTZZjqqEgW2Ko7FeU",
  authDomain: "sonu-256ed.firebaseapp.com",
  databaseURL: "https://inzu-dae68-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sonu-256ed",
  storageBucket: "sonu-256ed.firebasestorage.app",
  messagingSenderId: "925837320396",
  appId: "1:925837320396:web:8822654baaf0fee89ea269"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Admin key
const ADMIN_KEY = "Sonu0786";

// Bazar List
const BAZARS = [
  { id:'khaja_garib', name:'KHAJA GARIB', open:'09:30' },
  { id:'khaja_garib_nawaz', name:'KHAJA GARIB NAWAZ', open:'10:30' },
  { id:'dehli_baba', name:'DEHLI BABA', open:'11:45' },
  { id:'azmer_sharif', name:'AZMER SHARIF', open:'12:30' },
  { id:'baba_ka_gali', name:'BABA KA GALI', open:'13:30' },
  { id:'dehli_nor_yalai', name:'DEHLI NOR YALAI', open:'18:30' },
  { id:'noida_bazar', name:'NOIDA BAZAR', open:'16:30' },
  { id:'ahmedabad_city', name:'AHMEDABAD CITY', open:'12:30' },
  { id:'ram_mandir_5', name:'RAM MANDIR 5', open:'15:00' },
  { id:'east_dehli', name:'EAST DEHLI', open:'09:30' },
  { id:'faridabad_baba', name:'FARIDABAD BABA', open:'11:00' }
];

// DOM
const bazarsContainer = document.getElementById("bazars");
const adminPanel = document.getElementById("admin-panel");
const adminEditor = document.getElementById("adminEditor");
const adminFields = document.getElementById("adminFields");
const unlockBtn = document.getElementById("unlockBtn");
const saveBtn = document.getElementById("saveBtn");


// Create UI Cards + Live listener
BAZARS.forEach(b => {
  const card = document.createElement("article");
  card.className = "bazar-card";
  card.innerHTML = `
    <div class="bazar-row">
      <div>
        <div class="bazar-name">${b.name}</div>
        <div class="bazar-times">Open: ${b.open}</div>
      </div>
      <div class="meta">
        <div class="label">Opens In</div>
        <div class="timer" id="timer-${b.id}"></div>
      </div>
    </div>
    <div class="result-wrap">
      <div class="result-title">Result</div>
      <div class="result-box" id="result-${b.id}" data-result="--">--</div>
    </div>
  `;
  bazarsContainer.appendChild(card);

  // Live result
  onValue(ref(db, "results/" + b.id), snap => {
    const d = snap.val();
    document.getElementById("result-" + b.id).textContent = d?.result || "--";
  });

  setupTimer(b);
});


// Timer Functions
function parseTime(t){ const [h,m]=t.split(":").map(Number); return {h,m}; }

function setupTimer(b){
  const tEl = document.getElementById("timer-"+b.id);
  const next = () => {
    const {h,m} = parseTime(b.open);
    let d = new Date();
    let t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0);
    if (t < d) t.setDate(t.getDate()+1);
    return t;
  };

  let target = next();
  setInterval(()=>{
    const now = new Date();
    let diff = target - now;
    if(diff <= 0){ tEl.textContent = "00:00:00"; target = next(); return; }
    const hr = String(Math.floor(diff/3600000)).padStart(2,"0");
    diff%=3600000;
    const mn = String(Math.floor(diff/60000)).padStart(2,"0");
    diff%=60000;
    const sc = String(Math.floor(diff/1000)).padStart(2,"0");
    tEl.textContent = `${hr}:``${mn}:``${sc};`
  },1000);
}


// ADMIN URL CHECK
if (new URLSearchParams(location.search).get("admin") === ADMIN_KEY){
  adminPanel.classList.remove("hidden");
  adminEditor.classList.remove("hidden");
  loadAdminFields();
}


// Unlock button
unlockBtn?.addEventListener("click", ()=>{
  if (document.getElementById("adminKey").value.trim() === ADMIN_KEY){
    adminPanel.classList.remove("hidden");
    adminEditor.classList.remove("hidden");
    loadAdminFields();
  } else alert("Incorrect Admin Key");
});


// Load fields in admin panel
async function loadAdminFields(){
  adminFields.innerHTML = "";
  const snap = await get(ref(db, "results"));
  const data = snap.exists() ? snap.val() : {};

  BAZARS.forEach(b=>{
    const val = data[b.id]?.result || "";
    adminFields.innerHTML += `
      <div class="admin-row">
        <label>${b.name}</label>
        <input id="edit-${b.id}" maxlength="3" value="${val}" placeholder="123">
      </div>
    `;
  });
}


// SAVE Results (No Lock)
saveBtn?.addEventListener("click", async ()=>{
  let updates = {};
  let bad = false;

  BAZARS.forEach(b=>{
    const v = document.getElementById("edit-"+b.id).value.trim();
    if(v && !/^\d{3}$/.test(v)) bad = true;

    updates["results/"+b.id] = {
      result: v || "--",
      updatedAt: new Date().toISOString()
    };
  });

  if(bad) return alert("3 digit result required");

  await update(ref(db), updates);
  alert("Results Updated Successfully!");
});
