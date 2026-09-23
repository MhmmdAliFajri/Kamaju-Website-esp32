document.addEventListener("DOMContentLoaded", function () {

    const loanForm = document.getElementById("loanForm");
    const borrowerName = document.getElementById("borrowerName");
    const pinInput = document.getElementById("pin");

    if (!loanForm) {
        console.log("Form loanForm tidak ditemukan.");
        return;
    }

    loanForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = borrowerName.value.trim();
        const pin = pinInput.value.trim();

        // ==========================================
        // VALIDASI NAMA
        // ==========================================

        if (name === "") {

            alert("Nama peminjam wajib diisi.");

            borrowerName.focus();

            return;
        }


        // ==========================================
        // VALIDASI PIN
        // ==========================================

        if (pin === "") {

            alert("PIN wajib diisi.");

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
        // SIMPAN PEMINJAMAN
        // ==========================================

        try {

            console.log(
                "➡️ Menyimpan peminjaman ke Google Sheets..."
            );

            console.log(
                "Gateway:",
                CONFIG.GATEWAY_URL
            );


            const response = await fetch(

                `${CONFIG.GATEWAY_URL}/api/log`,

                {
                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        // Header untuk melewati
                        // browser warning ngrok
                        "ngrok-skip-browser-warning": "true"

                    },

                    body: JSON.stringify({

                        action: "createLoan",

                        borrower: name,

                        device: "Node-01"

                    })

                }

            );


            // ==========================================
            // CEK RESPONSE
            // ==========================================

            const text = await response.text();

            console.log(
                "⬅️ Response Gateway:",
                text
            );


            let data;

            try {

                data = JSON.parse(text);

            } catch (error) {

                console.error(
                    "Response bukan JSON:",
                    text
                );

                throw new Error(
                    "Gateway tidak mengembalikan JSON."
                );

            }


            console.log(
                "Response Google Sheets:",
                data
            );


            if (!response.ok || !data.ok) {

                throw new Error(

                    data.message ||

                    data.error ||

                    "Gagal menyimpan peminjaman."

                );

            }


            // ==========================================
            // SIMPAN DATA SESSION
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
            // PINDAH KE DASHBOARD
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

        }

    });

});
