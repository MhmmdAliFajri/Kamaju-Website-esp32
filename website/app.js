document.addEventListener("DOMContentLoaded", function () {

    const loanForm =
        document.getElementById("loanForm");

    const borrowerName =
        document.getElementById("borrowerName");

    const pinInput =
        document.getElementById("pin");


    if (!loanForm) {

        console.log(
            "Form loanForm tidak ditemukan."
        );

        return;
    }


    // ==========================================
    // SUBMIT PEMINJAMAN
    // ==========================================

    loanForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==========================================
            // AMBIL DATA
            // ==========================================

            const name =
                borrowerName.value.trim();

            const pin =
                pinInput.value.trim();


            // ==========================================
            // VALIDASI NAMA
            // ==========================================

            if (name === "") {

                alert(
                    "Nama peminjam wajib diisi."
                );

                borrowerName.focus();

                return;
            }


            // ==========================================
            // VALIDASI PIN
            // ==========================================

            if (pin === "") {

                alert(
                    "PIN wajib diisi."
                );

                pinInput.focus();

                return;
            }


            if (!/^\d{6}$/.test(pin)) {

                alert(
                    "PIN harus terdiri dari 6 angka."
                );

                pinInput.focus();

                return;
            }


            // ==========================================
            // CEK PIN
            // ==========================================

            if (pin !== CONFIG.PIN) {

                alert(
                    "❌ PIN SALAH!\n\n" +
                    "Silakan masukkan PIN yang benar."
                );

                pinInput.value = "";

                pinInput.focus();

                return;
            }


            // ==========================================
            // CEGAH DOUBLE SUBMIT
            // ==========================================

            const submitButton =
                loanForm.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "⏳ MENYIMPAN PEMINJAMAN...";

            }


            try {

                console.log(
                    "➡️ Menyimpan peminjaman..."
                );


                // ==========================================
                // 1 REQUEST SAJA
                // ==========================================

                const response =
                    await fetch(
                        `${CONFIG.GATEWAY_URL}/api/log`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                action:
                                    "createLoan",

                                borrower:
                                    name,

                                device:
                                    "Node-01"

                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "⬅️ Response:",
                    data
                );


                // ==========================================
                // CEK RESPONSE
                // ==========================================

                if (
                    !response.ok ||
                    !data.ok ||
                    !data.loanId
                ) {

                    throw new Error(
                        data.message ||
                        "Gagal menyimpan peminjaman."
                    );

                }


                // ==========================================
                // SIMPAN LOCAL STORAGE
                // ==========================================

                localStorage.setItem(
                    "activeBorrower",
                    name
                );

                localStorage.setItem(
                    "loanStartTime",
                    new Date().toISOString()
                );

                localStorage.setItem(
                    "loanId",
                    data.loanId
                );

                localStorage.setItem(
                    "dashboardAccess",
                    "true"
                );


                console.log(
                    "Loan ID:",
                    data.loanId
                );


                // ==========================================
                // BERHASIL
                // ==========================================

                alert(

                    "✅ PEMINJAMAN BERHASIL!\n\n" +

                    "Peminjam : " +
                    name +

                    "\nLoan ID  : " +
                    data.loanId +

                    "\n\nAkses Dashboard diberikan."

                );


                // ==========================================
                // DASHBOARD
                // ==========================================

                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "PEMINJAMAN ERROR:",
                    error
                );


                alert(

                    "❌ GAGAL MENYIMPAN PEMINJAMAN!\n\n" +

                    error.message +

                    "\n\nSilakan coba lagi."

                );


                // ==========================================
                // AKTIFKAN KEMBALI
                // ==========================================

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "PINJAM";

                }

            }

        }
    );

});