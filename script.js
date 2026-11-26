
// 1. KONEKSI SUPABASE

const SUPABASE_URL = "MASUKKAN_URL_SUPABASE";
const SUPABASE_KEY = "MASUKKAN_PUBLISHABLE_KEY";

const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let idEdit = null;


// 2. MENAMPILKAN DATA (SELECT)

async function tampilData() {

    const tabel = document.getElementById("tabelMakanan");

    tabel.innerHTML = "<tr><td colspan='4'>Memuat data...</td></tr>";

    const { data, error } = await db
        .from("makanan")
        .select("*")
        .order("id_makanan");

    if (error) {
        tabel.innerHTML = "<tr><td colspan='4'>Gagal mengambil data</td></tr>";
        tampilPesan(error.message);
        return;
    }

    tabel.innerHTML = "";

    if (data.length === 0) {
        tabel.innerHTML = "<tr><td colspan='4'>Data kosong</td></tr>";
        return;
    }

    data.forEach(item => {

        const baris = document.createElement("tr");

        const kolomID = document.createElement("td");
        kolomID.textContent = item.id_makanan;

        const kolomNama = document.createElement("td");
        kolomNama.textContent = item.nama_makanan;

        const kolomHarga = document.createElement("td");
        kolomHarga.textContent =
            "Rp " + Number(item.harga).toLocaleString("id-ID");

        const kolomAksi = document.createElement("td");

        const btnEdit = document.createElement("button");
        btnEdit.textContent = "Edit";
        btnEdit.className = "btn-edit";
        btnEdit.onclick = () => editData(item);

        const btnHapus = document.createElement("button");
        btnHapus.textContent = "Delete";
        btnHapus.className = "btn-delete";
        btnHapus.onclick = () => hapusData(item.id_makanan);

        const aksi = document.createElement("div");
        aksi.className = "aksi";
        aksi.append(btnEdit, btnHapus);

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


// 3. INSERT DAN UPDATE

document.getElementById("formMakanan")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const nama = document.getElementById("nama_makanan").value.trim();
    const harga = Number(document.getElementById("harga").value);

    if (!nama || !Number.isFinite(harga) || harga <= 0) {
        tampilPesan("Masukkan nama dan harga dengan benar!");
        return;
    }

    let hasil;

    if (idEdit === null) {

        // INSERT
        hasil = await db
            .from("makanan")
            .insert([{
                nama_makanan: nama,
                harga: harga
            }]);

    } else {

        // UPDATE / EDIT
        hasil = await db
            .from("makanan")
            .update({
                nama_makanan: nama,
                harga: harga
            })
            .eq("id_makanan", idEdit);

    }

    if (hasil.error) {
        tampilPesan(hasil.error.message);
        return;
    }

    tampilPesan(
        idEdit === null
        ? "Data berhasil ditambahkan!"
        : "Data berhasil diedit!"
    );

    resetForm();
    tampilData();

});


// 4. EDIT DATA

function editData(item) {

    idEdit = item.id_makanan;

    document.getElementById("id_makanan").value = item.id_makanan;

    document.getElementById("nama_makanan").value =
        item.nama_makanan;

    document.getElementById("harga").value =
        item.harga;

    document.getElementById("btnSimpan").textContent =
        "Simpan Perubahan";

}


// 5. DELETE DATA

async function hapusData(id) {

    const konfirmasi = confirm(
        "Yakin ingin menghapus data ini?"
    );

    if (!konfirmasi) return;

    const { error } = await db
        .from("makanan")
        .delete()
        .eq("id_makanan", id);

    if (error) {
        tampilPesan(error.message);
        return;
    }

    tampilPesan("Data berhasil dihapus!");

    if (idEdit === id) {
        resetForm();
    }

    tampilData();

}


// 6. RESET FORM

function resetForm() {

    document.getElementById("formMakanan").reset();

    document.getElementById("id_makanan").value = "";

    idEdit = null;

    document.getElementById("btnSimpan").textContent =
        "Tambah Data";

}


// 7. MENAMPILKAN PESAN

function tampilPesan(teks) {
    document.getElementById("pesan").textContent = teks;
}


// 8. MENJALANKAN PROGRAM

tampilData();
