import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2";

// ---------- Koneksi MySQL (pakai .env.local) ----------
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

type Siswa = RowDataPacket & {
  id: number;
  nama: string;
  kelas: string;
  jurusan: string;
};

export const dynamic = "force-dynamic";

// ---------- Create & Update ----------
async function simpan(formData: FormData) {
  "use server";
  const id = formData.get("id");
  const nama = formData.get("nama");
  const kelas = formData.get("kelas");
  const jurusan = formData.get("jurusan");

  let pesan = "";
  try {
    if (id) {
      await db.query(
        "UPDATE siswa SET nama = ?, kelas = ?, jurusan = ? WHERE id = ?",
        [nama, kelas, jurusan, id]
      );
    } else {
      await db.query(
        "INSERT INTO siswa (nama, kelas, jurusan) VALUES (?, ?, ?)",
        [nama, kelas, jurusan]
      );
    }
  } catch (e) {
    pesan = (e as Error).message;
  }

  if (pesan) redirect(`/?error=${encodeURIComponent(pesan)}`);
  redirect("/");
}

// ---------- Delete ----------
async function hapus(formData: FormData) {
  "use server";
  let pesan = "";
  try {
    await db.query("DELETE FROM siswa WHERE id = ?", [formData.get("id")]);
  } catch (e) {
    pesan = (e as Error).message;
  }

  if (pesan) redirect(`/?error=${encodeURIComponent(pesan)}`);
  revalidatePath("/");
}

const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 outline-none transition focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; error?: string }>;
}) {
  const params = await searchParams;

  // ---------- Read ----------
  let siswa: Siswa[] = [];
  let error = params.error ?? "";
  try {
    const [rows] = await db.query<Siswa[]>("SELECT * FROM siswa ORDER BY id");
    siswa = rows;
  } catch (e) {
    error = (e as Error).message;
  }

  const dataEdit = siswa.find((s) => s.id === Number(params.edit));

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Daftar Siswa</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Total {siswa.length} siswa
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Pesan error */}
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-200 rounded-xl p-4 text-sm">
            <b>Gagal:</b> {error}
          </div>
        )}

        {/* Form */}
        <form
          key={dataEdit?.id ?? "baru"}
          action={simpan}
          className="bg-white rounded-xl shadow p-4 sm:p-6"
        >
          <h2 className="font-semibold text-lg mb-4">
            {dataEdit ? "Edit Siswa" : "Tambah Siswa"}
          </h2>

          <input type="hidden" name="id" defaultValue={dataEdit?.id} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              name="nama"
              className={inputClass}
              placeholder="Nama"
              defaultValue={dataEdit?.nama}
              required
            />
            <input
              name="kelas"
              className={inputClass}
              placeholder="Kelas"
              defaultValue={dataEdit?.kelas}
              required
            />
            <input
              name="jurusan"
              className={inputClass}
              placeholder="Jurusan"
              defaultValue={dataEdit?.jurusan}
              required
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white px-5 py-2 rounded-lg font-medium">
              {dataEdit ? "Update" : "Tambah"}
            </button>
            {dataEdit && (
              <Link
                href="/"
                className="flex-1 sm:flex-none text-center bg-slate-200 hover:bg-slate-300 active:scale-95 transition px-5 py-2 rounded-lg font-medium"
              >
                Batal
              </Link>
            )}
          </div>
        </form>

        {/* Tabel (layar besar) */}
        <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Jurusan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {siswa.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-t border-slate-100 hover:bg-indigo-50 transition"
                >
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{s.nama}</td>
                  <td className="px-4 py-3">{s.kelas}</td>
                  <td className="px-4 py-3">{s.jurusan}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/?edit=${s.id}`}
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:scale-95 transition px-3 py-1 rounded-lg text-sm"
                      >
                        Edit
                      </Link>
                      <form action={hapus}>
                        <input type="hidden" name="id" value={s.id} />
                        <button className="bg-red-100 text-red-700 hover:bg-red-200 active:scale-95 transition px-3 py-1 rounded-lg text-sm">
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Kartu (layar HP) */}
        <div className="md:hidden space-y-3">
          {siswa.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl shadow p-4 active:scale-[0.98] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                  {s.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{s.nama}</p>
                  <p className="text-sm text-slate-500">
                    {s.kelas} • {s.jurusan}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Link
                  href={`/?edit=${s.id}`}
                  className="flex-1 text-center bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:scale-95 transition py-2 rounded-lg text-sm font-medium"
                >
                  Edit
                </Link>
                <form action={hapus} className="flex-1">
                  <input type="hidden" name="id" value={s.id} />
                  <button className="w-full bg-red-100 text-red-700 hover:bg-red-200 active:scale-95 transition py-2 rounded-lg text-sm font-medium">
                    Hapus
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {siswa.length === 0 && !error && (
          <p className="text-center text-slate-500 py-8">
            Belum ada data siswa
          </p>
        )}
      </main>
    </div>
  );
}
