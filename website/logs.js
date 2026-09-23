// ==========================================
// SMART VEHICLE KEY SYSTEM
// LOG AKTIVITAS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ==========================================
        // ELEMENT HTML
        // ==========================================

        const tableBody =
            document.getElementById(
                "activityTableBody"
            );

        const refreshButton =
            document.getElementById(
                "refreshLogsBtn"
            );


        // ==========================================
        // CEK ELEMENT
        // ==========================================

        if (!tableBody) {
            console.error(
                "❌ Element #activityTableBody tidak ditemukan."
            );
            return;
        }

        if (!refreshButton) {
            console.error(
                "❌ Element #refreshLogsBtn tidak ditemukan."
            );
            return;
        }


        // ==========================================
        // FORMAT WAKTU
        // ==========================================

        function formatDateTime(value) {

            if (!value) {
                return "-";
            }

            const date =
                new Date(value);

            if (
                isNaN(
                    date.getTime()
                )
            ) {
                return String(value);
            }

            return date.toLocaleString(
                "id-ID",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            );
        }


        // ==========================================
        // ESCAPE HTML
        // ==========================================

        function escapeHTML(value) {

            if (
                value === null ||
                value === undefined
            ) {
                return "-";
            }

            return String(value)
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );
        }


        // ==========================================
        // LOAD LOG
        // ==========================================

        async function loadLogs() {

            // ==========================================
            // LOADING
            // ==========================================

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="loading"
                    >
                        ⏳ Memuat log aktivitas...
                    </td>
                </tr>
            `;


            refreshButton.disabled =
                true;

            refreshButton.textContent =
                "⏳ Memuat...";


            try {

                console.log(
                    "================================="
                );

                console.log(
                    "➡️ MENGAMBIL LOG AKTIVITAS"
                );

                console.log(
                    "Gateway:",
                    CONFIG.GATEWAY_URL
                );

                console.log(
                    "URL:",
                    `${CONFIG.GATEWAY_URL}/api/logs`
                );


                // ==========================================
                // REQUEST KE GATEWAY
                // ==========================================

                const response =
                    await fetch(
                        `${CONFIG.GATEWAY_URL}/api/logs`,
                        {
                            method: "GET",
                            cache: "no-store"
                        }
                    );


                // ==========================================
                // BACA RESPONSE
                // ==========================================

                const responseText =
                    await response.text();


                console.log(
                    "HTTP Status:",
                    response.status
                );

                console.log(
                    "Response Server:",
                    responseText
                );


                // ==========================================
                // PARSE JSON
                // ==========================================

                let data;

                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                } catch (parseError) {

                    console.error(
                        "❌ Response bukan JSON:",
                        responseText
                    );

                    throw new Error(
                        "Server mengembalikan response yang bukan JSON."
                    );
                }


                console.log(
                    "⬅️ DATA LOG:",
                    data
                );


                // ==========================================
                // CEK HTTP RESPONSE
                // ==========================================

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Gateway gagal mengambil log aktivitas."
                    );
                }


                // ==========================================
                // CEK STATUS API
                // ==========================================

                if (
                    data.ok === false
                ) {

                    throw new Error(
                        data.message ||
                        "Google Sheets gagal mengirim data log."
                    );
                }


                // ==========================================
                // AMBIL DATA AKTIVITAS
                // ==========================================
                //
                // Mendukung beberapa kemungkinan:
                //
                // 1. { ok:true, data:[...] }
                // 2. { ok:true, activities:[...] }
                // 3. { data:[...] }
                // 4. { activities:[...] }
                // 5. [...]
                //
                // ==========================================

                let activities = [];


                if (
                    Array.isArray(data)
                ) {

                    activities =
                        data;

                } else if (
                    Array.isArray(
                        data.data
                    )
                ) {

                    activities =
                        data.data;

                } else if (
                    Array.isArray(
                        data.activities
                    )
                ) {

                    activities =
                        data.activities;

                } else if (
                    data.data &&
                    Array.isArray(
                        data.data.activities
                    )
                ) {

                    activities =
                        data.data.activities;
                }


                console.log(
                    "Jumlah aktivitas:",
                    activities.length
                );


                console.log(
                    "Aktivitas:",
                    activities
                );


                // ==========================================
                // TIDAK ADA DATA
                // ==========================================

                if (
                    activities.length === 0
                ) {

                    tableBody.innerHTML = `
                        <tr>
                            <td
                                colspan="5"
                                class="empty-row"
                            >
                                Belum ada aktivitas.
                            </td>
                        </tr>
                    `;

                    return;
                }


                // ==========================================
                // URUTKAN TERBARU DI ATAS
                // ==========================================

                const sortedActivities =
                    [...activities].reverse();


                // ==========================================
                // TAMPILKAN DATA
                // ==========================================

                tableBody.innerHTML =
                    sortedActivities
                        .map(
                            function (item) {

                                // ==========================================
                                // AMBIL FIELD
                                // ==========================================

                                const time =
                                    item.time ||
                                    item.waktu ||
                                    item.timestamp ||
                                    item.date ||
                                    "";

                                const loanId =
                                    item.loanId ||
                                    item.loanID ||
                                    item["Loan ID"] ||
                                    "";

                                const borrower =
                                    item.borrower ||
                                    item.peminjam ||
                                    item["Peminjam"] ||
                                    "";

                                const activity =
                                    item.activity ||
                                    item.aktivitas ||
                                    item["Aktivitas"] ||
                                    "";

                                const status =
                                    item.status ||
                                    item.Status ||
                                    "";


                                // ==========================================
                                // STATUS
                                // ==========================================

                                const statusText =
                                    String(
                                        status
                                    ).toUpperCase();


                                const success =
                                    statusText ===
                                    "BERHASIL";


                                // ==========================================
                                // RETURN ROW
                                // ==========================================

                                return `
                                    <tr>

                                        <td>
                                            ${escapeHTML(
                                                formatDateTime(
                                                    time
                                                )
                                            )}
                                        </td>

                                        <td>
                                            <strong>
                                                ${escapeHTML(
                                                    loanId || "-"
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                borrower || "-"
                                            )}
                                        </td>

                                        <td>

                                            <span
                                                class="activity-badge"
                                            >
                                                ${escapeHTML(
                                                    activity || "-"
                                                )}
                                            </span>

                                        </td>

                                        <td>

                                            <span
                                                class="status-badge ${
                                                    success
                                                        ? "status-success"
                                                        : "status-failed"
                                                }"
                                            >

                                                <span
                                                    class="status-dot"
                                                ></span>

                                                ${escapeHTML(
                                                    status || "-"
                                                )}

                                            </span>

                                        </td>

                                    </tr>
                                `;

                            }
                        )
                        .join("");


            } catch (error) {

                console.error(
                    "❌ LOG ERROR:",
                    error
                );


                tableBody.innerHTML = `
                    <tr>
                        <td
                            colspan="5"
                            class="empty-row"
                        >

                            ❌ Gagal mengambil log aktivitas.

                            <br>

                            <small>
                                ${escapeHTML(
                                    error.message
                                )}
                            </small>

                        </td>
                    </tr>
                `;


            } finally {

                refreshButton.disabled =
                    false;

                refreshButton.textContent =
                    "🔄 Refresh";

            }

        }


        // ==========================================
        // REFRESH BUTTON
        // ==========================================

        refreshButton.addEventListener(
            "click",
            loadLogs
        );


        // ==========================================
        // LOAD PERTAMA
        // ==========================================

        loadLogs();


        // ==========================================
        // AUTO REFRESH
        // ==========================================

        setInterval(
            loadLogs,
            60000
        );

    }
);