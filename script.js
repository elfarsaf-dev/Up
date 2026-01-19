const ENCODED_PASS = "dGVsa29tc2Vs";
const ENCODED_KEY = "a2V5LWVsZnM=";

const loginBtn = document.getElementById("loginBtn");
const passwordInput = document.getElementById("password");
const loginStatus = document.getElementById("login-status");
const loginScreen = document.getElementById("login-screen");
const mainContent = document.getElementById("main-content");

loginBtn.addEventListener("click", () => {
  const pass = passwordInput.value.trim().toLowerCase();
  const encoded = btoa(pass);
  
  if (encoded === ENCODED_PASS) {
    loginScreen.style.display = "none";
    mainContent.style.display = "block";
  } else {
    loginStatus.textContent = "❌ Password salah!";
    loginStatus.style.color = "#ef4444";
  }
});

passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

const API_URL = "https://api.ferdev.my.id/remote/elfar";
const getApiKey = () => atob(ENCODED_KEY);

const input = document.getElementById("files");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");

input.addEventListener("change", async () => {
  const files = Array.from(input.files);
  if (!files.length) return;

  statusEl.textContent = "⏳ Memproses file...";
  resultEl.value = "";

  for (let i = 0; i < files.length; i++) {
    let file = files[i];

    try {
      if (file.type.startsWith("image/")) {
        file = await imageCompression(file, {
          maxSizeMB: 0.7,
          maxWidthOrHeight: 1600,
          useWebWorker: true
        });
      }

      const form = new FormData();
      form.append("file", file, file.name);

      const res = await axios.post(API_URL, form, {
        headers: {
          Authorization: `Bearer ${getApiKey()}`
        }
      });

      if (res.data && res.data.dlink) {
        resultEl.value += res.data.dlink + "\n";
      } else {
        resultEl.value += "❌ Link tidak ditemukan\n";
      }

      statusEl.textContent = `✅ Upload ${i + 1} / ${files.length}`;

    } catch (err) {
      console.error(err);
      resultEl.value += `❌ Gagal upload: ${file.name}\n`;
      statusEl.textContent = "⚠️ Ada file yang gagal";
    }
  }

  statusEl.textContent = "🎉 Semua file selesai diproses";
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  resultEl.value = "";
  statusEl.textContent = "Pilih file untuk mulai upload…";
});

copyBtn.addEventListener("click", () => {
  if (!resultEl.value.trim()) return;
  
  resultEl.select();
  resultEl.setSelectionRange(0, 99999); // For mobile devices
  
  navigator.clipboard.writeText(resultEl.value).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "✅ Tersalin!";
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Gagal menyalin: ', err);
  });
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker Registered'));
}
