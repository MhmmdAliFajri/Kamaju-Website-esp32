// ==========================================
// PENGEMBALIAN.JS
// ==========================================


// ==========================================
// CEK AKSES DASHBOARD
// ==========================================

const dashboardAccess =
    localStorage.getItem("dashboardAccess");


if (dashboardAccess !== "true") {

    alert(
        "⚠️ Akses ditolak!\n\n" +
        "Silakan melakukan peminjaman terlebih dahulu."
    );

    window.location.href = "index.html";

} else {


    // ==========================================
    // AMBIL ELEMENT HTML
    // ==========================================

    const returnForm =
        document.getElementById("returnForm");

    const returnPin =
        document.getElementById("returnPin");

    const returnBtn =
        document.getElementById("returnBtn");

    const finishReturnBtn =
        document.getElementById("finishReturnBtn");

    const returnMessage =
        document.getElementById("returnMessage");

    const activeBorrower =
        document.getElementById("activeBorrower");


    // ==========================================
    // STEP INDICATOR
    // ==========================================

    const step1 =
        document.getElementById("step1");

    const step2 =
        document.getElementById("step2");

    const step3 =
        document.getElementById("step3");


    // ==========================================
    // DATA PEMINJAM
    // ==========================================

    const borrower =
        localStorage.getItem("activeBorrower");


    if (borrower) {

        activeBorrower.textContent =
            borrower;

    } else {

        activeBorrower.textContent =
            "Tidak ada peminjam aktif.";

        returnBtn.disabled = true;

        returnMessage.textContent =
            "⚠️ Tidak ada peminjam aktif.";

    }


    console.log("=== PENGEMBALIAN SYSTEM ===");
    console.log(
        "Gateway:",
        CONFIG.GATEWAY_URL
    );
    console.log(
        "Borrower:",
        borrower
    );


    // ==========================================
    // TAHAP 1
    // PIN → UNLOCK
    // ==========================================

    returnForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==========================================
            // CEGAH SUBMIT GANDA
            // ==========================================

            if (returnBtn.disabled) {
                return;
            }


            const pin =
                returnPin.value.trim();


            // ==========================================
            // VALIDASI PIN
            // ==========================================

            if (pin === "") {

                alert(
                    "PIN wajib diisi."
                );

                returnPin.focus();

                return;
            }


            if (!/^\d{6}$/.test(pin)) {

                alert(
                    "PIN harus terdiri dari 6 angka."
                );

                returnPin.focus();

                return;
            }


            if (pin !== CONFIG.PIN) {

                alert(
                    "❌ PIN SALAH!\n\n" +
                    "Silakan masukkan PIN yang benar."
                );

                returnPin.value = "";

                returnPin.focus();

                return;
            }


            // ==========================================
            // BUKA AKSES
            // ==========================================

            returnBtn.disabled = true;

            returnBtn.textContent =
                "⏳ MEMBUKA AKSES...";

            returnMessage.textContent =
                "Menghubungkan ke ESP32...";


            try {

                // ==========================================
                // AMBIL LOAN ID TERBARU
                // ==========================================

                const currentLoanId =
                    localStorage.getItem("loanId");

                const currentBorrower =
                    localStorage.getItem(
                        "activeBorrower"
                    );


                if (!currentLoanId) {

                    throw new Error(
                        "Loan ID tidak ditemukan."
                    );

                }


                console.log(
                    "Loan ID:",
                    currentLoanId
                );

                console.log(
                    "Borrower:",
                    currentBorrower
                );


                // ==========================================
                // UNLOCK ESP32
                // ==========================================

                const response =
                    await fetch(
                        `${CONFIG.GATEWAY_URL}/api/unlock?ngrok-skip-browser-warning=true`,
                        {
                            method: "POST"
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Response UNLOCK:",
                    data
                );


                if (
                    !response.ok ||
                    !data.ok
                ) {

                    throw new Error(
                        data.message ||
                        "ESP32 gagal membuka akses."
                    );

                }


                // ==========================================
                // CATAT AKTIVITAS
                // AKSES PENGEMBALIAN
                // ==========================================

                fetch(
                    `${CONFIG.GATEWAY_URL}/api/log`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                action:
                                    "activity",

                                loanId:
                                    currentLoanId,

                                borrower:
                                    currentBorrower || "",

                                activity:
                                    "AKSES PENGEMBALIAN",

                                status:
                                    "BERHASIL"

                            })

                    }
                ).catch(
                    function (logError) {

                        console.error(
                            "Gagal mencatat aktivitas:",
                            logError
                        );

                    }
                );


                // ==========================================
                // UPDATE MESSAGE
                // ==========================================

                returnMessage.textContent =
                    "✅ Tempat penyimpanan kunci berhasil dibuka. Silakan masukkan kembali kunci kendaraan.";


                // ==========================================
                // STEP 1 → STEP 2
                // ==========================================

                if (step1) {

                    step1.classList.remove(
                        "active"
                    );

                }


                if (step2) {

                    step2.classList.add(
                        "active"
                    );

                }


                // ==========================================
                // UBAH INSTRUKSI
                // ==========================================

                const instructionTitle =
                    document.querySelector(
                        ".return-instruction strong"
                    );


                const instructionText =
                    document.querySelector(
                        ".return-instruction p"
                    );


                if (instructionTitle) {

                    instructionTitle.textContent =
                        "Tempat penyimpanan kunci terbuka";

                }


                if (instructionText) {

                    instructionText.textContent =
                        "Silakan masukkan kembali kunci kendaraan. Setelah kunci berada di tempatnya, tekan tombol untuk mengunci dan menyelesaikan pengembalian.";

                }


                // ==========================================
                // SEMBUNYIKAN TOMBOL UNLOCK
                // ==========================================

                returnBtn.style.display =
                    "none";


                // ==========================================
                // TAMPILKAN TOMBOL LOCK
                // ==========================================

                finishReturnBtn.style.display =
                    "block";


                // ==========================================
                // PIN DINONAKTIFKAN
                // ==========================================

                returnPin.disabled = true;


                alert(
                    "✅ AKSES DIBUKA!\n\n" +
                    "Silakan masukkan kembali kunci kendaraan " +
                    "ke tempat penyimpanan.\n\n" +
                    "Setelah kunci sudah dimasukkan, tekan:\n" +
                    "🔒 KUNCI & SELESAIKAN PENGEMBALIAN"
                );


            } catch (error) {

                console.error(
                    "ERROR UNLOCK:",
                    error
                );


                returnMessage.textContent =
                    "❌ " + error.message;


                returnBtn.disabled =
                    false;


                returnBtn.textContent =
                    "🔓 BUKA AKSES PENGEMBALIAN";

            }

        }
    );


    // ==========================================
    // TAHAP 2
    // LOCK → SELESAIKAN
    // ==========================================

    finishReturnBtn.addEventListener(
        "click",
        async function () {


            // ==========================================
            // CEGAH DOUBLE CLICK
            // ==========================================

            if (finishReturnBtn.disabled) {
                return;
            }


            const confirmation =
                confirm(
                    "Apakah kunci kendaraan sudah dimasukkan kembali?\n\n" +
                    "Tekan OK untuk mengunci tempat penyimpanan dan menyelesaikan pengembalian."
                );


            if (!confirmation) {
                return;
            }


            // ==========================================
            // AMBIL DATA TERBARU
            // ==========================================

            const currentLoanId =
                localStorage.getItem("loanId");


            const currentBorrower =
                localStorage.getItem(
                    "activeBorrower"
                );


            console.log(
                "================================="
            );

            console.log(
                "PROSES PENGEMBALIAN"
            );

            console.log(
                "Loan ID:",
                currentLoanId
            );

            console.log(
                "Borrower:",
                currentBorrower
            );

            console.log(
                "================================="
            );


            // ==========================================
            // VALIDASI LOAN ID
            // ==========================================

            if (!currentLoanId) {

                returnMessage.textContent =
                    "❌ Loan ID tidak ditemukan.";

                console.error(
                    "Loan ID kosong."
                );

                return;

            }


            // ==========================================
            // DISABLE BUTTON
            // ==========================================

            finishReturnBtn.disabled =
                true;


            finishReturnBtn.textContent =
                "⏳ MEMPROSES...";


            returnMessage.textContent =
                "Mengunci tempat penyimpanan...";


            let lockSuccess =
                false;


            try {


                // ==========================================
                // 1. LOCK ESP32
                // ==========================================

                console.log(
                    "➡️ Mengirim LOCK ke ESP32..."
                );


                const lockResponse =
                    await fetch(
                        `${CONFIG.GATEWAY_URL}/api/lock?ngrok-skip-browser-warning=true`,
                        {
                            method: "POST"
                        }
                    );


                const lockData =
                    await lockResponse.json();


                console.log(
                    "⬅️ Response LOCK:",
                    lockData
                );


                if (
                    !lockResponse.ok ||
                    !lockData.ok
                ) {

                    throw new Error(
                        lockData.message ||
                        "ESP32 gagal mengunci."
                    );

                }


                lockSuccess =
                    true;


                console.log(
                    "✅ ESP32 berhasil LOCK."
                );


                // ==========================================
                // 2. COMPLETE LOAN
                // ==========================================

                returnMessage.textContent =
                    "✅ Kunci berhasil dikunci. Menyimpan data pengembalian...";


                console.log(
                    "➡️ Mengirim completeLoan:",
                    currentLoanId
                );


                const completeResponse =
                    await fetch(
                        `${CONFIG.GATEWAY_URL}/api/log`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    action:
                                        "completeLoan",

                                    loanId:
                                        currentLoanId

                                })
                        }
                    );


                // ==========================================
                // BACA RESPONSE SEBAGAI TEXT
                // AGAR ERROR SERVER TERLIHAT
                // ==========================================

                const completeText =
                    await completeResponse.text();


                console.log(
                    "⬅️ Response COMPLETE:",
                    completeText
                );


                let completeData;


                try {

                    completeData =
                        JSON.parse(
                            completeText
                        );

                } catch (parseError) {

                    throw new Error(
                        "Response server tidak valid: " +
                        completeText
                    );

                }


                // ==========================================
                // CEK COMPLETE LOAN
                // ==========================================

                if (
                    !completeResponse.ok ||
                    !completeData.ok
                ) {

                    throw new Error(
                        completeData.message ||
                        "Gagal menyelesaikan peminjaman."
                    );

                }


                console.log(
                    "✅ COMPLETE LOAN BERHASIL."
                );


                console.log(
                    "Loan ID selesai:",
                    completeData.loanId ||
                    currentLoanId
                );


                console.log(
                    "Waktu kembali:",
                    completeData.returnTime ||
                    "-"
                );


                // ==========================================
                // 3. DATABASE BERHASIL
                // ==========================================

                returnMessage.textContent =
                    "✅ Pengembalian berhasil diselesaikan. Tempat penyimpanan terkunci.";


                // ==========================================
                // STEP 2 → STEP 3
                // ==========================================

                if (step2) {

                    step2.classList.remove(
                        "active"
                    );

                }


                if (step3) {

                    step3.classList.add(
                        "active"
                    );

                }


                // ==========================================
                // 4. HAPUS SESSION
                // ==========================================

                localStorage.removeItem(
                    "activeBorrower"
                );


                localStorage.removeItem(
                    "loanStartTime"
                );


                localStorage.removeItem(
                    "loanId"
                );


                localStorage.removeItem(
                    "dashboardAccess"
                );


                // ==========================================
                // 5. BERHASIL
                // ==========================================

                alert(
                    "✅ PENGEMBALIAN SELESAI!\n\n" +
                    "Tempat penyimpanan kunci telah dikunci.\n\n" +
                    "Waktu kembali telah disimpan."
                );


                // ==========================================
                // KEMBALI KE PEMINJAMAN
                // ==========================================

                window.location.href =
                    "index.html";


            } catch (error) {


                console.error(
                    "❌ ERROR PENGEMBALIAN:",
                    error
                );


                // ==========================================
                // JIKA LOCK SUDAH BERHASIL
                // TAPI DATABASE GAGAL
                // ==========================================

                if (lockSuccess) {

                    console.warn(
                        "Database gagal setelah LOCK. Melakukan rollback UNLOCK..."
                    );


                    try {

                        const rollbackResponse =
                            await fetch(
                                `${CONFIG.GATEWAY_URL}/api/unlock`,
                                {
                                    method: "POST"
                                }
                            );


                        const rollbackData =
                            await rollbackResponse.json();


                        console.log(
                            "Response ROLLBACK:",
                            rollbackData
                        );


                        if (
                            rollbackResponse.ok &&
                            rollbackData.ok
                        ) {

                            console.log(
                                "✅ Rollback UNLOCK berhasil."
                            );

                        } else {

                            console.error(
                                "❌ Rollback UNLOCK gagal."
                            );

                        }


                    } catch (rollbackError) {

                        console.error(
                            "❌ Error rollback UNLOCK:",
                            rollbackError
                        );

                    }

                }


                // ==========================================
                // TAMPILKAN ERROR SEBENARNYA
                // ==========================================

                returnMessage.textContent =
                    "❌ " +
                    error.message;


                // ==========================================
                // BUTTON BISA DICOBA LAGI
                // ==========================================

                finishReturnBtn.disabled =
                    false;


                finishReturnBtn.textContent =
                    "🔒 KUNCI & SELESAIKAN PENGEMBALIAN";

            }

        }
    );

}