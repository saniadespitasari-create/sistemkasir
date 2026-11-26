
// =================================
// 1. KONEKSI SUPABASE
// =================================

const SUPABASE_URL = "https://wjwkdfyuafrsxgszrgjt.supabase.co";
const SUPABASE_KEY = "sb_publishable_MWw-LFmQfa3l8yxFO8aoCA_EBta8402";

const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let idEdit = null;


// =================================
// 2. FUNGSI PESAN
// =================================

function tampilPesan(teks) {
    document.getElementById("pesan").textContent = teks;
}


// =================================
// 3. SELECT - MENAMPILKAN DATA
// =================================

async function tampilData() {

    const tabel = document.getElementById("tabelMakanan");

    tabel.innerHTML = `
        <tr>
            <td colspan="4">Memuat data...</td>
        </tr>
    `;

    const { data, error } = await db
        .from("makanan")
        .select("*")
        .order("id_makanan", { ascending: true });

    if (error) {
        tabel.innerHTML = `
            <tr>
                <td colspan="4">Gagal memuat data.</td>
            </tr>
        `;

        tampilPesan("Error: " + error.message);
        return;
    }

    tabel.innerHTML = "";

    if (data.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="4">Belum ada data makanan.</td>
            </tr>
        `;
        return;
    }

    data.forEach(function(item) {

        const baris = document.createElement("tr");

        const kolomID = document.createElement("td");
        kolomID.textContent = item.id_makanan;

        const kolomNama = document.createElement("td");
        kolomNama.textContent = item.nama_makanan;

        const kolomHarga = document.createElement("td");
        kolomHarga.textContent =
            "Rp " + Number(item.harga).toLocaleString("id-ID");

        const kolomAksi = document.createElement("td");

        const tombolEdit = document.createElement("button");
        tombolEdit.textContent = "Edit";
        tombolEdit.className = "btn-edit";

        tombolEdit.onclick = function() {
            editData(item);
        };

        const tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Delete";
        tombolHapus.className = "btn-delete";

        tombolHapus.onclick = function() {
            hapusData(item.id_makanan);
        };

        const aksi = document.createElement("div");
        aksi.className = "aksi";

        aksi.append(tombolEdit, tombolHapus);
        kolomAksi.appendChild(aksi);

        baris.append(
            kolomID,
            kolomNama,
            kolomHarga,
            kolomAksi
        );

        tabel.appendChild(baris);

    });

}


// =================================
// 4. INSERT - MENAMBAHKAN DATA
// =================================

document.getElementById("formMakanan")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const nama = document
        .getElementById("nama_makanan")
        .value.trim();

    const harga = Number(
        document.getElementById("harga").value
    );

    if (!nama || !Number.isFinite(harga) || harga <= 0) {
        tampilPesan("Nama dan harga harus diisi dengan benar!");
        return;
    }

    const tombol = document.getElementById("btnSimpan");

    tombol.disabled = true;

    let error;

    if (idEdit === null) {

        // MENAMBAHKAN DATA

        const hasil = await db
            .from("makanan")
            .insert([
                {
                    nama_makanan: nama,
                    harga: harga
                }
            ]);

        error = hasil.error;

    } else {

        // MENGEDIT DATA

        const hasil = await db
            .from("makanan")
            .update({
                nama_makanan: nama,
                harga: harga
            })
            .eq("id_makanan", idEdit);

        error = hasil.error;

    }

    tombol.disabled = false;

    if (error) {
        tampilPesan("Gagal: " + error.message);
        return;
    }

    if (idEdit === null) {
        tampilPesan("Data berhasil ditambahkan!");
    } else {
        tampilPesan("Data berhasil diperbarui!");
    }

    resetForm();
    tampilData();

});


// =================================
// 5. EDIT - MENGUBAH DATA
// =================================

function editData(item) {

    idEdit = item.id_makanan;

    document.getElementById("id_makanan").value =
        item.id_makanan;

    document.getElementById("nama_makanan").value =
        item.nama_makanan;

    document.getElementById("harga").value =
        item.harga;

    document.getElementById("btnSimpan").textContent =
        "Simpan Perubahan";

    tampilPesan("Sedang mengedit data ID " + idEdit);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =================================
// 6. DELETE - MENGHAPUS DATA
// =================================

async function hapusData(id) {

    const konfirmasi = confirm(
        "Apakah kamu yakin ingin menghapus data ini?"
    );

    if (!konfirmasi) {
        return;
    }

    const { error } = await db
        .from("makanan")
        .delete()
        .eq("id_makanan", id);

    if (error) {
        tampilPesan("Gagal menghapus: " + error.message);
        return;
    }

    tampilPesan("Data berhasil dihapus!");

    if (idEdit === id) {
        resetForm();
    }

    tampilData();

}


// =================================
// 7. RESET FORM
// =================================

function resetForm() {

    document.getElementById("formMakanan").reset();

    document.getElementById("id_makanan").value = "";

    idEdit = null;

    document.getElementById("btnSimpan").textContent =
        "+ Tambah Data";

    tampilPesan("");

}

document.getElementById("btnReset")
.addEventListener("click", resetForm);


// =================================
// 8. MENJALANKAN PROGRAM
// =================================

tampilData();
