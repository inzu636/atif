// =====================================
// result.js (No Lock System Version)
// =====================================

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase, ref, onValue, update, get
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// -------------------------------
// YOUR FIREBASE CONFIG
// -------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBwqwNFAlRGPRRSPxLLSpryyDmpuCB6asc",
  authDomain: "inzu-dae68.firebaseapp.com",
  databaseURL: "https://inzu-dae68-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "inzu-dae68",
  storageBucket: "inzu-dae68.firebasestorage.app",
  messagingSenderId: "68573381004",
  appId: "1:68573381004:web:935dc049c5b362141816a9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// -------------------------------
// ADMIN KEY
// -------------------------------
const ADMIN_KEY = "Sonu0786";

// -------------------------------
// MULTI BAZAR LIST
// -------------------------------
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

// -------------------------------
// CREATE UI CARDS
// -------------------------------
BAZARS.forEach(bazar => {
  const card = document.createElement("article");
  card.className = "bazar-card";
  card.id = "card-" + bazar.id;

  card.innerHTML = `
      <div class="bazar-row">
          <div>
              <div class="bazar-name">${bazar.name}</div>
              <div class="bazar-times">Open: ${bazar.open}</div>
          </div>
          <div class="meta">
              <div class="label">Opens In</div>
              <div class="timer" id="timer-${bazar.id}">--:--:--</div>
          </div>
      </div>

      <div class="result-wrap">
          <div class="result-title">Result</div>
          <div class="result-box" id="result-${bazar.id}" data-result="--">--</div>
      </div>
  `;

  bazarsContainer.appendChild(card);

  // Live Listener
  onValue(ref(db, "results/" + bazar.id), snap => {
      const val = snap.val();
      const output = val?.result ?? "--";

      document.getElementById("result-" + bazar.id).textContent = output;
  });

  setupTimer(bazar);
});

// -------------------------------
// TIMER
// -------------------------------
function parseTime(t) {
  const [h, m] = t.split(":").map(Number);
  return { h, m };
}

function nextTime(timeStr) {
  const { h, m } = parseTime(timeStr);
  let now = new Date();
  let t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);

  if (t < now) t.setDate(t.getDate() + 1);
  return t;
}

function setupTimer(bazar) {
  const tEl = document.getElementById("timer-" + bazar.id);
  let target = nextTime(bazar.open);

  setInterval(() => {
      let now = new Date();
      let diff = target - now;

      if (diff <= 0) {
          tEl.textContent = "00:00:00";
          target = nextTime(bazar.open);
          return;
      }

      const hr = String(Math.floor(diff / 3600000)).padStart(2, '0');
      diff %= 3600000;
      const mn = String(Math.floor(diff / 60000)).padStart(2, '0');
      diff %= 60000;
      const sc = String(Math.floor(diff / 1000)).padStart(2, '0');

      tEl.textContent = `${hr}:``${mn}:``${sc};`
  }, 1000);
}


// -------------------------------
// ADMIN URL AUTO UNLOCK
// -------------------------------
(function () {
  const p = new URLSearchParams(location.search);
  if (p.get("admin") === ADMIN_KEY) {
      adminPanel.classList.remove("hidden");
      adminEditor.classList.remove("hidden");
      loadAdminFields();
  }
})();


// -------------------------------
// MANUAL UNLOCK BUTTON
// -------------------------------
unlockBtn?.addEventListener("click", () => {
  const key = document.getElementById("adminKey").value.trim();
  if (key === ADMIN_KEY) {
      adminPanel.classList.remove("hidden");
      adminEditor.classList.remove("hidden");
      loadAdminFields();
  } else {
      alert("Wrong Key!");
  }
});


// -------------------------------
// LOAD ADMIN FIELDS
// -------------------------------
async function loadAdminFields() {
  const snap = await get(ref(db, "results"));
  const data = snap.val() || {};

  adminFields.innerHTML = "";

  BAZARS.forEach(b => {
      const val = data[b.id]?.result || "";

      adminFields.innerHTML += `
        <div class="admin-row">
          <label>${b.name}</label>
          <input id="edit-${b.id}" maxlength="3" value="${val}" placeholder="000">
        </div>
      `;
  });
}


// -------------------------------
// SAVE RESULT (NO LOCK)
// -------------------------------
saveBtn?.addEventListener("click", async () => {
  const updates = {};

  BAZARS.forEach(b => {
      const v = document.getElementById("edit-" + b.id).value.trim();
      updates["results/" + b.id] = {
          result: v || "--",
          updatedAt: new Date().toISOString()
      };
  });

  await update(ref(db), updates);
  alert("✔ Results Updated Successfully!");
});
