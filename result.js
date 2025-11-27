// =====================================
// FINAL result.js (NO LOCK SYSTEM)
// =====================================

// Firebase imports
import { initializeApp } from 
"https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getDatabase, ref, onValue, update, get
} from 
"https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";


// ------------------------------------
// YOUR FIREBASE CONFIG (correct one)
// ------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBwqwNFAlRGPRRSPxLLSpryyDmpuCB6asc",
  authDomain: "inzu-dae68.firebaseapp.com",
  databaseURL: "https://inzu-dae68-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "inzu-dae68",
  storageBucket: "inzu-dae68.firebasestorage.app",
  messagingSenderId: "68573381004",
  appId: "1:68573381004:web:935dc049c5b362141816a9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// ------------------------------------
// Admin Key
// ------------------------------------
const ADMIN_KEY = "Sonu0786";


// ------------------------------------
// MULTI BAZAR LIST
// ------------------------------------
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


// DOM elements
const bazarsContainer = document.getElementById("bazars");
const adminPanel = document.getElementById("admin-panel");
const adminEditor = document.getElementById("adminEditor");
const adminFields = document.getElementById("adminFields");


// ------------------------------------
// Display all bazar cards
// ------------------------------------
BAZARS.forEach(b => {

  const card = document.createElement("article");
  card.className = "bazar-card";
  card.id = "card-" + b.id;

  card.innerHTML = `
      <div class="bazar-row">
          <div>
              <div class="bazar-name">${b.name}</div>
              <div class="bazar-times">Open: ${b.open}</div>
          </div>
          <div class="meta">
              
              <div class="timer" id="timer-${b.id}">--:--:--</div>
          </div>
      </div>

      <div class="result-wrap">
          <div class="result-title">Result</div>
          <div class="result-box" id="result-${b.id}" data-result="--">--</div>
      </div>
  `;

  bazarsContainer.appendChild(card);

  // Firebase listener
  onValue(ref(db, "results/" + b.id), snap => {
    const data = snap.val();
    const r = data?.result || "--";
    document.getElementById("result-" + b.id).textContent = r;
  });

  setupTimer(b);
});



// ------------------------------------
// TIMER
// ------------------------------------
function parseTime(t) {
  let [h, m] = t.split(":").map(Number);
  return { h, m };
}

function getNextTime(timeStr) {
  const { h, m } = parseTime(timeStr);
  const now = new Date();
  let next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  if (next < now) next.setDate(next.getDate() + 1);
  return next;
}

function setupTimer(b) {
  const tEl = document.getElementById("timer-" + b.id);
  let target = getNextTime(b.open);

  setInterval(() => {
    let diff = target - new Date();

    if (diff <= 0) {
      tEl.textContent = "00:00:00";
      target = getNextTime(b.open);
      return;
    }

    const hr = Math.floor(diff / 3600000);
    diff %= 3600000;

    const mn = Math.floor(diff / 60000);
    diff %= 60000;

    const sc = Math.floor(diff / 1000);

    tEl.textContent = 
      String(hr).padStart(2,"0")+":"+
      String(mn).padStart(2,"0")+":"+
      String(sc).padStart(2,"0");

  }, 1000);
}



// ------------------------------------
// ADMIN SECRET URL
// ------------------------------------
(function () {
  const p = new URLSearchParams(location.search);
  if (p.get("admin") === ADMIN_KEY) {
    adminPanel.classList.remove("hidden");
    adminEditor.classList.remove("hidden");
    loadAdminFields();
  }
})();


// ------------------------------------
// LOAD ADMIN INPUT FIELDS
// ------------------------------------
async function loadAdminFields() {
  adminFields.innerHTML = "";

  const snap = await get(ref(db, "results"));
  const data = snap.exists() ? snap.val() : {};

  BAZARS.forEach(b => {
    const val = data[b.id]?.result || "";

    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <label>${b.name}</label>
      <input id="edit-${b.id}" maxlength="3" value="${val}">
    `;
    adminFields.appendChild(row);
  });
}


// ------------------------------------
// ADMIN SAVE BUTTON
// ------------------------------------
document.getElementById("saveBtn")?.addEventListener("click", async () => {

  const updates = {};

  BAZARS.forEach(b => {
    const v = document.getElementById("edit-" + b.id).value.trim();
    updates["results/" + b.id] = { result: v || "--" };
  });

  await update(ref(db), updates);

  alert("Results Updated Successfully!");
});

