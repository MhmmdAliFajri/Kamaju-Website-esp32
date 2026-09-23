// ==========================================
// CEK AKSES DASHBOARD
// ==========================================

const dashboardAccess = localStorage.getItem("dashboardAccess");

if (dashboardAccess !== "true") {

    alert(
        "⚠️ Akses ditolak!\n\n" +
        "Silakan melakukan peminjaman terlebih dahulu."
    );

    window.location.href = "index.html";

}


// ==========================================
// DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const doorStatus = document.getElementById("doorStatus");
    const lockIcon = document.getElementById("lockIcon");
    const activity = document.getElementById("activity");

    const topStatus = document.getElementById("topStatus");

    const espStatus = document.getElementById("espStatus");
    const gpio = document.getElementById("gpio");
    const espIp = document.getElementById("espIp");
    const rssi = document.getElementById("rssi");
    const uptime = document.getElementById("uptime");
    const freeHeap = document.getElementById("freeHeap");

    const activeBorrower =
        document.getElementById("activeBorrower");

    const unlockBtn =
        document.getElementById("unlockBtn");

    const lockBtn =
        document.getElementById("lockBtn");

    const controlMessage =
        document.getElementById("controlMessage");


    // ====================================
    // CEK CONFIG
    // ====================================

    console.log("CONFIG:", CONFIG);


    // ====================================
    // TAMPILKAN PEMINJAM
    // ====================================

    function loadBorrower() {

        const borrower =
            localStorage.getItem("activeBorrower");

        if (borrower) {
            activeBorrower.textContent = borrower;
        } else {
            activeBorrower.textContent =
                "Tidak ada peminjam";
        }

    }


    // ====================================
    // AMBIL STATUS ESP32
    // ====================================

    async function getStatus() {

        console.log(
            "Mengambil status:",
            `${CONFIG.GATEWAY_URL}/api/status`
        );

        try {

            const response = await fetch(
                  `${CONFIG.GATEWAY_URL}/api/status`,
                {
                     headers: {
                    "ngrok-skip-browser-warning": "true"
                 }
                }
            );

            console.log(
                "HTTP Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    `HTTP Error ${response.status}`
                );

            }


            const data = await response.json();

            console.log(
                "DATA ESP32:",
                data
            );


            // ====================================
            // STATUS ESP32
            // ====================================

            if (data.online === true) {

                espStatus.textContent =
                    "ONLINE";

                topStatus.innerHTML =
                    `<span class="status-dot"></span> System Online`;

            } else {

                espStatus.textContent =
                    "OFFLINE";

                topStatus.innerHTML =
                    `<span class="status-dot offline"></span> System Offline`;

            }


            // ====================================
            // STATUS PINTU
            // ====================================

            if (data.door === "LOCKED") {

                doorStatus.textContent =
                    "🔒 TERKUNCI";

                lockIcon.textContent =
                    "🔒";

            }

            else if (data.door === "UNLOCKED") {

                doorStatus.textContent =
                    "🔓 TERBUKA";

                lockIcon.textContent =
                    "🔓";

            }

            else {

                doorStatus.textContent =
                    "❓ TIDAK DIKETAHUI";

                lockIcon.textContent =
                    "❓";

            }


            // ====================================
            // ACTIVITY
            // ====================================

            activity.textContent =
                data.activity || "-";


            // ====================================
            // GPIO
            // ====================================

            gpio.textContent =
                data.gpio !== undefined
                    ? data.gpio
                    : "-";


            // ====================================
            // IP
            // ====================================

            espIp.textContent =
                data.ip || "-";


            // ====================================
            // RSSI
            // ====================================

            rssi.textContent =
                data.rssi !== undefined
                    ? `${data.rssi} dBm`
                    : "-";


            // ====================================
            // UPTIME
            // ====================================

            uptime.textContent =
                data.uptime || "-";


            // ====================================
            // FREE HEAP
            // ====================================

            freeHeap.textContent =
                data.freeHeap !== undefined
                    ? `${data.freeHeap} bytes`
                    : "-";


        }

        catch (error) {

            console.error(
                "GAGAL MENGAMBIL STATUS:",
                error
            );


            espStatus.textContent =
                "OFFLINE";

            doorStatus.textContent =
                "❌ TIDAK TERHUBUNG";

            lockIcon.textContent =
                "❌";

            activity.textContent =
                "Gateway atau ESP32 tidak dapat dihubungi.";

            topStatus.innerHTML =
                `<span class="status-dot offline"></span> System Offline`;

        }

    }


    // ====================================
    // UNLOCK
    // ====================================

    unlockBtn.addEventListener(
        "click",
        async function () {

            unlockBtn.disabled = true;
            lockBtn.disabled = true;

            controlMessage.textContent =
                "⏳ Membuka kunci...";


            try {

                 const response = await fetch(
                    `${CONFIG.GATEWAY_URL}/api/unlock`,
                    {
                        method: "POST",
                        headers: {
                            "ngrok-skip-browser-warning": "true"
                        }
                    }
                );


                const data =
                    await response.json();


                console.log(
                    "UNLOCK RESPONSE:",
                    data
                );


                if (!data.ok) {

                    throw new Error(
                        data.error ||
                        "UNLOCK gagal"
                    );

                }


                controlMessage.textContent =
                    "✅ Kunci berhasil dibuka.";


                await getStatus();

            }

            catch (error) {

                console.error(
                    "UNLOCK ERROR:",
                    error
                );

                controlMessage.textContent =
                    "❌ Gagal membuka kunci.";

            }


            unlockBtn.disabled = false;
            lockBtn.disabled = false;

        }
    );


    // ====================================
    // LOCK
    // ====================================

    lockBtn.addEventListener(
        "click",
        async function () {

            unlockBtn.disabled = true;
            lockBtn.disabled = true;

            controlMessage.textContent =
                "⏳ Mengunci kunci...";


            try {

                const response = await fetch(
                    `${CONFIG.GATEWAY_URL}/api/lock`,
                    {
                        method: "POST",
                        headers: {
                            "ngrok-skip-browser-warning": "true"
                        }
                    }
                );


                const data =
                    await response.json();


                console.log(
                    "LOCK RESPONSE:",
                    data
                );


                if (!data.ok) {

                    throw new Error(
                        data.error ||
                        "LOCK gagal"
                    );

                }


                controlMessage.textContent =
                    "🔒 Kunci berhasil dikunci.";


                await getStatus();

            }

            catch (error) {

                console.error(
                    "LOCK ERROR:",
                    error
                );

                controlMessage.textContent =
                    "❌ Gagal mengunci kunci.";

            }


            unlockBtn.disabled = false;
            lockBtn.disabled = false;

        }
    );


    // ====================================
    // START
    // ====================================

    loadBorrower();

    getStatus();


    // ====================================
    // REFRESH STATUS SETIAP 3 DETIK
    // ====================================

    setInterval(
        getStatus,
        3000
    );

});