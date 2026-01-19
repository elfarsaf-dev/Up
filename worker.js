export default {
  async fetch(request, env) {
    const ALLOWED_ORIGINS = [
      "https://uploader.elfar.my.id",
      "www.uploader.elfar.my.id",
      // Tambahkan domain Replit Anda di sini jika ingin mengetes dari Replit
    ];

    const API_URL = "https://api.ferdev.my.id/remote/elfar";
    const API_KEY = "key-elfs"; // Sebaiknya pindahkan ke Environment Variable Cloudflare
    const PASS = "telkomsel";

    const url = new URL(request.url);
    const origin = request.headers.get("origin") || request.headers.get("referer") || "";

    // =============================
    // SERVE JS (script.js)
    // =============================
    if (url.pathname === "/script.js") {
      const js = `
        const ENCODED_PASS = "${PASS}";
        const WORKER_URL = "${url.origin}";

        const loginBtn = document.getElementById("loginBtn");
        const passwordInput = document.getElementById("password");
        const loginStatus = document.getElementById("login-status");
        const loginScreen = document.getElementById("login-screen");
        const mainContent = document.getElementById("main-content");

        loginBtn.addEventListener("click", () => {
          const pass = passwordInput.value.trim().toLowerCase();
          if (pass === ENCODED_PASS) {
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

              const res = await fetch(\`\${WORKER_URL}/upload\`, {
                method: "POST",
                body: form
              });

              const data = await res.json();

              if (data && data.dlink) {
                resultEl.value += data.dlink + "\\n";
              } else {
                resultEl.value += "❌ Link tidak ditemukan\\n";
              }

              statusEl.textContent = \`✅ Upload \${i + 1} / \${files.length}\`;

            } catch (err) {
              console.error(err);
              resultEl.value += \`❌ Gagal upload: \${file.name}\\n\`;
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
          resultEl.setSelectionRange(0, 99999);
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

        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('sw.js').then(() => console.log('Service Worker Registered'));
        }
      `;

      return new Response(js, {
        headers: {
          "content-type": "application/javascript",
          "cache-control": "no-store",
          "access-control-allow-origin": "*"
        }
      });
    }

    // =============================
    // UPLOAD HANDLER
    // =============================
    if (url.pathname === "/upload" && request.method === "POST") {
      const formData = await request.formData();

      const apiRes = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`
        },
        body: formData
      });

      const responseData = await apiRes.text();

      return new Response(responseData, {
        status: apiRes.status,
        headers: { 
          "content-type": "application/json",
          "access-control-allow-origin": "*"
        }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};