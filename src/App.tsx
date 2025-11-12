// src/App.tsx (KODE LENGKAP - Versi Rapor Guru
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// 1. KONFIGURASI SUPABASE (GANTI DENGAN KREDENSIAL ASLI ANDA)
const SUPABASE_URL = "https://yijpduuhmgdjvwsoxlgn.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpanBkdXVobWdkanZ3c294bGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTc2NDQsImV4cCI6MjA3ODI3MzY0NH0.KYpUzqIDfFm9-nc_bhdHozeFXUUOTxtSn5sRM3kTZNc"; // GANTI DENGAN KUNCI ANON ASLI ANDA

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ====================================================================
// Komponen Utama: Controller Aplikasi (Tidak Berubah)
// ====================================================================
function App() {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-lg loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-base-200">
      {!session ? (
        <AuthForm />
      ) : !selectedClass ? (
        <ClassDashboard
          session={session}
          onSelectClass={(kelas) => setSelectedClass(kelas)}
        />
      ) : (
        <ClassroomView
          session={session}
          selectedClass={selectedClass}
          onBack={() => setSelectedClass(null)}
        />
      )}
    </div>
  );
}

// ====================================================================
// Komponen Form: AuthForm (Tidak Berubah)
// ====================================================================
function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SISWA");

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role: role } },
        });
        if (error) throw error;
        alert("Registrasi berhasil! Cek email Anda untuk verifikasi.");
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero min-h-[80vh]">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left lg:ml-10">
          <h1 className="text-5xl font-bold">Selamat Datang!</h1>
          <p className="py-6">
            Silakan login atau registrasi untuk masuk ke Portal Guru & Siswa.
          </p>
        </div>
        <div className="card w-full max-w-sm shadow-2xl bg-base-100 shrink-0">
          <form className="card-body" onSubmit={handleAuthAction}>
            <h1 className="card-title text-2xl justify-center mb-4">
              {isLogin ? "Login Portal" : "Registrasi Akun"}
            </h1>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {!isLogin && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Daftar sebagai:</span>
                </label>
                <select
                  className="select select-bordered"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="SISWA">Siswa</option>
                  <option value="GURU">Guru</option>
                </select>
              </div>
            )}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading && (
                  <span className="loading loading-spinner text-xs"></span>
                )}
                {loading ? "Loading..." : isLogin ? "Login" : "Registrasi"}
              </button>
            </div>
            <p className="text-center text-sm mt-4">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="btn btn-link btn-sm"
              >
                {isLogin ? "Registrasi" : "Login"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// Komponen: ClassDashboard (Tidak Berubah)
// ====================================================================
function ClassDashboard({
  session,
  onSelectClass,
}: {
  session: any;
  onSelectClass: (kelas: any) => void;
}) {
  const { user } = session;
  const userRole = user.user_metadata.role || "SISWA";
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [className, setClassName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const cardColors = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-info",
    "bg-success",
    "bg-warning",
  ];

  useEffect(() => {
    fetchMyClasses();
  }, []);

  async function fetchMyClasses() {
    setLoading(true);
    let query;
    if (userRole === "GURU") {
      query = supabase.from("classes").select("*").eq("teacher_id", user.id);
    } else {
      query = supabase
        .from("classes")
        .select(`*, class_members ( student_id )`)
        .eq("class_members.student_id", user.id);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching classes:", error);
    } else {
      if (userRole === "SISWA") {
        setClasses(data.filter((c) => c.class_members.length > 0));
      } else {
        setClasses(data || []);
      }
    }
    setLoading(false);
  }

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    if (!className.trim()) return;
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from("classes")
      .insert({ name: className, teacher_id: user.id, invite_code: newCode })
      .select();
    if (error) {
      alert("Error: " + error.message);
    } else if (data) {
      setClasses([data[0], ...classes]);
      setClassName("");
    }
  }

  async function joinClass(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    const { data: classData, error: findError } = await supabase
      .from("classes")
      .select("id")
      .eq("invite_code", inviteCode.trim())
      .single();
    if (findError || !classData) {
      alert("Kode Undangan tidak valid!");
      return;
    }
    const { error: joinError } = await supabase
      .from("class_members")
      .insert({ class_id: classData.id, student_id: user.id });
    if (joinError) {
      if (joinError.code === "23505") {
        alert("Anda sudah bergabung di kelas ini!");
      } else {
        alert("Error: " + joinError.message);
      }
    } else {
      alert("Berhasil bergabung ke kelas!");
      fetchMyClasses();
      setInviteCode("");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="navbar bg-base-100 rounded-box shadow-lg mb-6">
        <div className="flex-1">
          <span className="text-xl font-bold ml-4">Dashboard Kelas</span>
        </div>
        <div className="flex-none gap-2">
          <div className="text-right mr-4">
            <p className="text-sm font-semibold">{user.email}</p>
            <span
              className={`badge ${
                userRole === "GURU" ? "badge-primary" : "badge-accent"
              } badge-sm`}
            >
              {userRole}
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-error btn-sm mr-2">
            Logout
          </button>
        </div>
      </div>
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          {userRole === "GURU" ? (
            <form onSubmit={createClass}>
              <h2 className="card-title">Buat Kelas Baru</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama Kelas (misal: Fisika 10A)"
                  className="input input-bordered w-full"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Buat
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={joinClass}>
              <h2 className="card-title">Gabung Kelas Baru</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masukkan Kode Undangan"
                  className="input input-bordered w-full"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Gabung
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Kelas Saya</h2>
      {loading && (
        <div className="text-center">
          <span className="loading loading-lg loading-spinner text-primary"></span>
        </div>
      )}
      {!loading && classes.length === 0 && (
        <p className="text-center text-lg opacity-70">
          Anda belum memiliki/bergabung dengan kelas apapun.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((kelas, index) => {
          const colorClass = cardColors[index % cardColors.length];
          const textClass = colorClass.replace("bg-", "text-");
          return (
            <div
              key={kelas.id}
              className={`card ${colorClass} ${textClass}-content shadow-xl hover:shadow-2xl transition-shadow`}
            >
              <div className="card-body">
                <h2 className="card-title">{kelas.name}</h2>
                {userRole === "GURU" && (
                  <p className="text-sm">
                    Kode Undangan:{" "}
                    <span className="font-mono bg-neutral text-neutral-content p-1 rounded ml-2">
                      {kelas.invite_code}
                    </span>
                  </p>
                )}
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-secondary"
                    onClick={() => onSelectClass(kelas)}
                  >
                    Masuk Kelas
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================================
// Komponen: ClassroomView (INI YANG DIMODIFIKASI BESAR)
// ====================================================================
function ClassroomView({
  session,
  selectedClass,
  onBack,
}: {
  session: any;
  selectedClass: any;
  onBack: () => void;
}) {
  const { user } = session;
  const userRole = user.user_metadata.role || "SISWA";

  type ViewTab = "materi" | "tugas" | "anggota" | "progres";
  const [activeTab, setActiveTab] = useState<ViewTab>("materi");

  // States untuk Materi
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [editMaterialTitle, setEditMaterialTitle] = useState("");
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States untuk Anggota
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true); // Default-kan ke true

  // States untuk Tugas
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true); // Default-kan ke true
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentDesc, setNewAssignmentDesc] = useState("");
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState("");
  const [assignmentFileUpload, setAssignmentFileUpload] = useState<File | null>(
    null
  );
  const assignmentFileInputRef = useRef<HTMLInputElement>(null);

  // States untuk Modal
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(
    null
  );
  const [viewingMaterial, setViewingMaterial] = useState<any | null>(null);

  // --- MODIFIKASI: useEffect sekarang memuat data dasar untuk semua tab ---
  useEffect(() => {
    // Data ini dibutuhkan oleh hampir semua tab
    fetchMaterials(selectedClass.id);
    fetchAssignments(selectedClass.id);
    if (userRole === "GURU") {
      fetchClassMembers(selectedClass.id);
    }
  }, [selectedClass.id, userRole]); // Hanya bergantung pada ini

  // --- Fungsi Anggota (Tidak Berubah) ---
  async function fetchClassMembers(classId: string) {
    setLoadingMembers(true);
    const { data, error } = await supabase
      .from("class_members")
      .select(`student_id, joined_at, users ( email )`)
      .eq("class_id", classId);
    if (error) console.error("Error fetching members:", error);
    else setMembers(data || []);
    setLoadingMembers(false);
  }
  async function kickMember(studentId: string) {
    if (!confirm("Anda yakin ingin mengeluarkan siswa ini dari kelas?")) return;
    const { error } = await supabase
      .from("class_members")
      .delete()
      .eq("class_id", selectedClass.id)
      .eq("student_id", studentId);
    if (error) alert("Gagal mengeluarkan siswa: " + error.message);
    else {
      alert("Siswa berhasil dikeluarkan.");
      setMembers(members.filter((m) => m.student_id !== studentId));
    }
  }

  // --- Fungsi Materi (Tidak Berubah) ---
  async function uploadMaterialFile(file: File) {
    if (!file) return null;
    setUploading(true);
    const fileName = `materials/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("material-files")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from("material-files")
      .getPublicUrl(data.path);
    setUploading(false);
    return publicUrlData?.publicUrl || null;
  }
  async function fetchMaterials(classId: string) {
    setLoadingMaterials(true);
    const { data, error } = await supabase
      .from("materials")
      .select("*, users ( email )")
      .eq("class_id", classId)
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching materials:", error);
    else setMaterials(data || []);
    setLoadingMaterials(false);
  }
  async function createMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (!newMaterialTitle.trim()) return;
    setLoadingMaterials(true);
    let fileUrl: string | null = null;
    if (fileUpload) {
      fileUrl = await uploadMaterialFile(fileUpload);
      if (!fileUrl) {
        setLoadingMaterials(false);
        return;
      }
    }
    const { data, error } = await supabase
      .from("materials")
      .insert([
        {
          title: newMaterialTitle,
          file_url: fileUrl,
          class_id: selectedClass.id,
          user_id: user.id,
        },
      ])
      .select();
    if (error) console.error("Error creating material:", error);
    else if (data) {
      const newMaterial = { ...data[0], users: { email: user.email } };
      setMaterials([newMaterial, ...materials]);
    }
    setNewMaterialTitle("");
    setFileUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLoadingMaterials(false);
  }
  async function updateMaterial(materialId: string) {
    if (!editMaterialTitle.trim()) return;
    setLoadingMaterials(true);
    let fileUrl: string | null = null;
    if (fileUpload) {
      fileUrl = await uploadMaterialFile(fileUpload);
      if (!fileUrl) {
        setLoadingMaterials(false);
        return;
      }
    }
    const updateData: { title: string; file_url?: string | null } = {
      title: editMaterialTitle,
    };
    if (fileUpload) {
      updateData.file_url = fileUrl;
    }
    const { error } = await supabase
      .from("materials")
      .update(updateData)
      .eq("id", materialId);
    if (error) console.error("Error updating material:", error);
    else {
      setMaterials(
        materials.map((m) =>
          m.id === materialId
            ? {
                ...m,
                title: editMaterialTitle,
                file_url: updateData.file_url || m.file_url,
              }
            : m
        )
      );
      setEditingMaterial(null);
      setEditMaterialTitle("");
      setFileUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setLoadingMaterials(false);
  }
  async function deleteMaterial(materialId: string, fileUrl: string | null) {
    if (!confirm("Anda yakin ingin menghapus materi ini?")) return;
    setLoadingMaterials(true);
    if (fileUrl) {
      try {
        const fileName = fileUrl.split("materials/").pop();
        if (fileName) {
          await supabase.storage
            .from("material-files")
            .remove([`materials/${fileName}`]);
        }
      } catch (e) {
        console.error("Error parsing file URL:", e);
      }
    }
    const { error } = await supabase
      .from("materials")
      .delete()
      .eq("id", materialId);
    if (error) console.error("Error deleting material:", error);
    else {
      setMaterials(materials.filter((m) => m.id !== materialId));
    }
    setLoadingMaterials(false);
  }

  // --- Fungsi Tugas (Tidak Berubah) ---
  async function uploadAssignmentFile(file: File) {
    if (!file) return null;
    setUploading(true);
    const fileName = `assignments/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("material-files")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      console.error("Error uploading assignment file:", error);
      setUploading(false);
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from("material-files")
      .getPublicUrl(data.path);
    setUploading(false);
    return publicUrlData?.publicUrl || null;
  }
  async function fetchAssignments(classId: string) {
    setLoadingAssignments(true);
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("class_id", classId)
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching assignments:", error);
    else setAssignments(data || []);
    setLoadingAssignments(false);
  }
  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!newAssignmentTitle.trim()) {
      alert("Judul tugas tidak boleh kosong!");
      return;
    }
    setLoadingAssignments(true);
    let fileUrl: string | null = null;
    if (assignmentFileUpload) {
      fileUrl = await uploadAssignmentFile(assignmentFileUpload);
      if (!fileUrl) {
        setLoadingAssignments(false);
        return;
      }
    }
    const { data, error } = await supabase
      .from("assignments")
      .insert([
        {
          class_id: selectedClass.id,
          title: newAssignmentTitle,
          description: newAssignmentDesc,
          due_date: newAssignmentDueDate || null,
          file_url: fileUrl,
        },
      ])
      .select();
    if (error) {
      console.error("Error creating assignment:", error);
    } else if (data) {
      setAssignments([data[0], ...assignments]);
    }
    setNewAssignmentTitle("");
    setNewAssignmentDesc("");
    setNewAssignmentDueDate("");
    setAssignmentFileUpload(null);
    if (assignmentFileInputRef.current)
      assignmentFileInputRef.current.value = "";
    setLoadingAssignments(false);
  }
  async function deleteAssignment(
    assignmentId: string,
    fileUrl: string | null
  ) {
    if (!confirm("Anda yakin ingin menghapus tugas ini?")) return;
    setLoadingAssignments(true);
    if (fileUrl) {
      try {
        const fileName = fileUrl.split("assignments/").pop();
        if (fileName) {
          await supabase.storage
            .from("material-files")
            .remove([`assignments/${fileName}`]);
        }
      } catch (e) {
        console.error("Error parsing file URL:", e);
      }
    }
    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId);
    if (error) console.error("Error deleting assignment:", error);
    else {
      setAssignments(assignments.filter((a) => a.id !== assignmentId));
    }
    setLoadingAssignments(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navbar (Tidak Berubah) */}
      <div className="navbar bg-base-100 rounded-box shadow-lg mb-6">
        <div className="flex-1">
          <button className="btn btn-ghost" onClick={onBack}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            Kembali
          </button>
          <span className="text-xl font-bold ml-4">{selectedClass.name}</span>
        </div>
      </div>

      {/* Konten Utama (Dimodifikasi dengan Tab) */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* --- NAVIGASI TAB DIMODIFIKASI (Tambah Progres) --- */}
          <div role="tablist" className="tabs tabs-boxed mb-6">
            <a
              role="tab"
              className={`tab ${activeTab === "materi" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("materi")}
            >
              Materi
            </a>
            <a
              role="tab"
              className={`tab ${activeTab === "tugas" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("tugas")}
            >
              Tugas
            </a>
            <a
              role="tab"
              className={`tab ${activeTab === "progres" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("progres")}
            >
              Progres
            </a>
            {userRole === "GURU" && (
              <a
                role="tab"
                className={`tab ${activeTab === "anggota" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("anggota")}
              >
                Anggota Kelas
              </a>
            )}
          </div>

          {/* 1. Tampilan Tab Materi */}
          {activeTab === "materi" && (
            <div>
              {userRole === "GURU" && (
                <>
                  <h2 className="card-title mb-4">Tambah Materi Baru</h2>
                  <form
                    onSubmit={createMaterial}
                    className="flex flex-col gap-4 mb-4"
                  >
                    <input
                      type="text"
                      placeholder="Judul materi..."
                      className="input input-bordered w-full"
                      value={newMaterialTitle}
                      onChange={(e) => setNewMaterialTitle(e.target.value)}
                      disabled={uploading || loadingMaterials}
                    />
                    <input
                      type="file"
                      className="file-input file-input-bordered w-full"
                      onChange={(e) =>
                        setFileUpload(e.target.files ? e.target.files[0] : null)
                      }
                      ref={fileInputRef}
                      disabled={uploading || loadingMaterials}
                      accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={uploading || loadingMaterials}
                    >
                      {(uploading || loadingMaterials) && (
                        <span className="loading loading-spinner text-xs"></span>
                      )}
                      {uploading
                        ? "Mengunggah File..."
                        : loadingMaterials
                        ? "Menyimpan..."
                        : "Tambah Materi"}
                    </button>
                  </form>
                  <div className="divider"></div>
                </>
              )}
              <h2 className="card-title mt-4">Daftar Materi di Kelas Ini</h2>
              {loadingMaterials ? (
                <div className="text-center p-10">
                  <span className="loading loading-lg loading-spinner text-primary"></span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {materials.length === 0 ? (
                    <p className="text-center p-4">
                      Belum ada materi di kelas ini.
                    </p>
                  ) : (
                    <ul className="space-y-3 mt-4">
                      {materials.map((material) => (
                        <li
                          key={material.id}
                          className="bg-base-200 p-4 rounded-lg shadow-sm flex justify-between items-center flex-wrap"
                        >
                          {editingMaterial?.id === material.id ? (
                            <div className="flex flex-col w-full gap-2 items-start">
                              <input
                                type="text"
                                className="input input-bordered input-sm w-full"
                                value={editMaterialTitle}
                                onChange={(e) =>
                                  setEditMaterialTitle(e.target.value)
                                }
                                disabled={uploading || loadingMaterials}
                              />
                              <input
                                type="file"
                                className="file-input file-input-bordered w-full file-input-sm"
                                onChange={(e) =>
                                  setFileUpload(
                                    e.target.files ? e.target.files[0] : null
                                  )
                                }
                                ref={fileInputRef}
                                disabled={uploading || loadingMaterials}
                                accept=".pdf,.doc,.docx,image/png,image/jpeg"
                              />
                              {material.file_url && (
                                <a
                                  href={material.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-link btn-xs"
                                >
                                  Lihat File Saat Ini
                                </a>
                              )}
                              <div className="flex gap-2 mt-2 w-full">
                                <button
                                  className="btn btn-success btn-sm flex-1"
                                  onClick={() => updateMaterial(material.id)}
                                  disabled={uploading || loadingMaterials}
                                >
                                  {(uploading || loadingMaterials) && (
                                    <span className="loading loading-spinner text-xs"></span>
                                  )}
                                  {uploading
                                    ? "Mengunggah File..."
                                    : loadingMaterials
                                    ? "Menyimpan..."
                                    : "Simpan"}
                                </button>
                                <button
                                  className="btn btn-ghost btn-sm flex-1"
                                  onClick={() => {
                                    setEditingMaterial(null);
                                    setEditMaterialTitle("");
                                    setFileUpload(null);
                                    if (fileInputRef.current) {
                                      fileInputRef.current.value = "";
                                    }
                                  }}
                                  disabled={uploading || loadingMaterials}
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 min-w-0">
                              <button
                                className="text-lg text-left font-semibold hover:text-primary transition-colors"
                                onClick={() => setViewingMaterial(material)}
                              >
                                {material.title}
                              </button>
                              {material.file_url && (
                                <a
                                  href={material.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-link btn-xs"
                                >
                                  Lihat File
                                </a>
                              )}
                              <p className="text-xs text-opacity-70 mt-1">
                                Diunggah oleh: {material.users?.email || "N/A"}{" "}
                                -{" "}
                                {new Date(material.created_at).toLocaleString()}
                              </p>
                            </div>
                          )}
                          {userRole === "GURU" && !editingMaterial && (
                            <div className="flex gap-2 mt-2 sm:mt-0">
                              <button
                                className="btn btn-info btn-xs"
                                onClick={() => {
                                  setEditingMaterial(material);
                                  setEditMaterialTitle(material.title);
                                  setFileUpload(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-error btn-xs"
                                onClick={() =>
                                  deleteMaterial(material.id, material.file_url)
                                }
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. Tampilan Tab Tugas */}
          {activeTab === "tugas" && (
            <div>
              {userRole === "GURU" && (
                <>
                  <h2 className="card-title mb-4">Buat Tugas Baru</h2>
                  <form
                    onSubmit={createAssignment}
                    className="flex flex-col gap-4 mb-4"
                  >
                    <input
                      type="text"
                      placeholder="Judul Tugas..."
                      className="input input-bordered w-full"
                      value={newAssignmentTitle}
                      onChange={(e) => setNewAssignmentTitle(e.target.value)}
                      disabled={uploading || loadingAssignments}
                    />
                    <textarea
                      className="textarea textarea-bordered w-full"
                      placeholder="Deskripsi/Instruksi Tugas..."
                      value={newAssignmentDesc}
                      onChange={(e) => setNewAssignmentDesc(e.target.value)}
                      disabled={uploading || loadingAssignments}
                    ></textarea>
                    <input
                      type="datetime-local"
                      className="input input-bordered w-full"
                      value={newAssignmentDueDate}
                      onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                      disabled={uploading || loadingAssignments}
                    />
                    <input
                      type="file"
                      className="file-input file-input-bordered w-full"
                      onChange={(e) =>
                        setAssignmentFileUpload(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                      ref={assignmentFileInputRef}
                      disabled={uploading || loadingAssignments}
                      accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={uploading || loadingAssignments}
                    >
                      {(uploading || loadingAssignments) && (
                        <span className="loading loading-spinner text-xs"></span>
                      )}
                      {uploading
                        ? "Mengunggah File..."
                        : loadingAssignments
                        ? "Menyimpan..."
                        : "Buat Tugas"}
                    </button>
                  </form>
                  <div className="divider"></div>
                </>
              )}
              <h2 className="card-title mt-4">Daftar Tugas di Kelas Ini</h2>
              {loadingAssignments ? (
                <div className="text-center p-10">
                  <span className="loading loading-lg loading-spinner text-primary"></span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {assignments.length === 0 ? (
                    <p className="text-center p-4">
                      Belum ada tugas di kelas ini.
                    </p>
                  ) : (
                    <ul className="space-y-3 mt-4">
                      {assignments.map((assignment) => (
                        <li
                          key={assignment.id}
                          className="bg-base-200 p-4 rounded-lg shadow-sm"
                        >
                          <div className="flex justify-between items-center flex-wrap">
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-semibold">
                                {assignment.title}
                              </p>
                              {assignment.due_date && (
                                <p className="text-sm text-error font-medium">
                                  Batas Waktu:{" "}
                                  {new Date(
                                    assignment.due_date
                                  ).toLocaleString()}
                                </p>
                              )}
                              <p className="text-sm opacity-80 mt-2">
                                {assignment.description}
                              </p>
                              {assignment.file_url && (
                                <a
                                  href={assignment.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-link btn-xs mt-1"
                                >
                                  Lihat Lampiran Soal
                                </a>
                              )}
                            </div>
                            <div className="flex gap-2 mt-2 sm:mt-0">
                              {userRole === "GURU" ? (
                                <>
                                  <button
                                    className="btn btn-info btn-xs"
                                    onClick={() =>
                                      setSelectedAssignment(assignment)
                                    }
                                  >
                                    Lihat Pengumpulan
                                  </button>
                                  <button
                                    className="btn btn-error btn-xs"
                                    onClick={() =>
                                      deleteAssignment(
                                        assignment.id,
                                        assignment.file_url
                                      )
                                    }
                                  >
                                    Hapus
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="btn btn-primary btn-xs"
                                  onClick={() =>
                                    setSelectedAssignment(assignment)
                                  }
                                >
                                  Kumpulkan Tugas
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Tampilan Tab Anggota */}
          {activeTab === "anggota" && userRole === "GURU" && (
            <div>
              <h2 className="card-title mt-4">Daftar Anggota di Kelas Ini</h2>
              {loadingMembers ? (
                <div className="text-center p-10">
                  <span className="loading loading-lg loading-spinner text-primary"></span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {members.length === 0 ? (
                    <p className="text-center p-4">
                      Belum ada siswa yang bergabung.
                    </p>
                  ) : (
                    <table className="table w-full mt-4">
                      <thead>
                        <tr>
                          <th>Email Siswa</th>
                          <th>Bergabung Pada</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr key={member.student_id}>
                            <td>
                              {member.users?.email || "Email tidak diketahui"}
                            </td>
                            <td>
                              {new Date(member.joined_at).toLocaleString()}
                            </td>
                            <td>
                              <button
                                className="btn btn-error btn-xs"
                                onClick={() => kickMember(member.student_id)}
                              >
                                Keluarkan
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4. Tampilan Tab Progres (BARU) */}
          {activeTab === "progres" && (
            <div>
              {userRole === "GURU" ? (
                // TAMPILAN GURU BARU
                <TeacherProgressViewComponent
                  classId={selectedClass.id}
                  assignments={assignments} // Kirim daftar tugas yang sudah di-fetch
                  members={members} // Kirim daftar anggota yang sudah di-fetch
                />
              ) : (
                // TAMPILAN SISWA (Yang lama, diganti nama)
                <StudentProgressViewComponent
                  classId={selectedClass.id}
                  studentId={user.id}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL UNTUK TUGAS (TIDAK BERUBAH) --- */}
      {selectedAssignment && (
        <dialog id="task_modal" className="modal modal-open">
          <div className="modal-box w-11/12 max-w-3xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setSelectedAssignment(null)}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-2">
              Tugas: {selectedAssignment.title}
            </h3>
            <p className="text-sm opacity-70 mb-4">
              {selectedAssignment.description}
            </p>
            {selectedAssignment.file_url && (
              <a
                href={selectedAssignment.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-link"
              >
                Lihat Lampiran Soal
              </a>
            )}
            <div className="divider"></div>
            {userRole === "GURU" ? (
              <GradeViewComponent
                assignmentId={selectedAssignment.id}
                classMembers={members}
              />
            ) : (
              <SubmitViewComponent
                assignment={selectedAssignment}
                studentId={user.id}
                onSubmitted={() => setSelectedAssignment(null)}
              />
            )}
          </div>
        </dialog>
      )}

      {/* --- MODAL UNTUK KOMENTAR (TIDAK BERUBAH) --- */}
      {viewingMaterial && (
        <MaterialDetailModal
          material={viewingMaterial}
          onClose={() => setViewingMaterial(null)}
          userId={user.id}
          userRole={userRole}
          classId={selectedClass.id}
        />
      )}
    </div>
  );
}

// ====================================================================
// Komponen: SubmitViewComponent (Tidak Berubah)
// ====================================================================
function SubmitViewComponent({
  assignment,
  studentId,
  onSubmitted,
}: {
  assignment: any;
  studentId: string;
  onSubmitted: () => void;
}) {
  const [mySubmission, setMySubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [fileAnswer, setFileAnswer] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMySubmission();
  }, [assignment.id, studentId]);

  async function fetchMySubmission() {
    setLoading(true);
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignment.id)
      .eq("student_id", studentId)
      .single();
    if (data) {
      setMySubmission(data);
      setTextAnswer(data.text_answer || "");
    }
    setLoading(false);
  }

  async function uploadSubmissionFile(file: File) {
    if (!file) return null;
    setUploading(true);
    const fileName = `submissions/${studentId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("submission-files")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      console.error("Error uploading submission file:", error);
      setUploading(false);
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from("submission-files")
      .getPublicUrl(data.path);
    setUploading(false);
    return publicUrlData?.publicUrl || null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!textAnswer && !fileAnswer) {
      alert("Anda harus mengisi jawaban teks atau mengunggah file.");
      return;
    }
    setLoading(true);
    let fileUrl: string | null = mySubmission?.file_url || null;
    if (fileAnswer) {
      fileUrl = await uploadSubmissionFile(fileAnswer);
      if (!fileUrl) {
        setLoading(false);
        return;
      }
    }
    const { error } = await supabase.from("submissions").upsert({
      id: mySubmission?.id,
      assignment_id: assignment.id,
      student_id: studentId,
      text_answer: textAnswer,
      file_url: fileUrl,
      submitted_at: new Date().toISOString(),
    });
    if (error) {
      alert("Gagal mengumpulkan: " + error.message);
    } else {
      alert("Tugas berhasil dikumpulkan!");
      onSubmitted();
    }
    setLoading(false);
  }

  if (loading)
    return (
      <div className="text-center">
        <span className="loading loading-spinner"></span>
      </div>
    );
  if (mySubmission?.grade) {
    return (
      <div className="p-4 bg-base-200 rounded-lg">
        <h4 className="font-bold text-lg">Tugas Sudah Dinilai</h4>
        <p className="text-sm">
          Terkumpul pada: {new Date(mySubmission.submitted_at).toLocaleString()}
        </p>
        <div className="divider"></div>
        <h5 className="font-semibold">Jawaban Anda:</h5>
        {mySubmission.text_answer && (
          <p className="prose">{mySubmission.text_answer}</p>
        )}
        {mySubmission.file_url && (
          <a
            href={mySubmission.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-link"
          >
            Lihat File Jawaban
          </a>
        )}
        <div className="divider"></div>
        <h5 className="font-semibold text-success">
          Nilai: {mySubmission.grade}
        </h5>
        <h5 className="font-semibold">Feedback Guru:</h5>
        <p className="prose">
          {mySubmission.feedback || "(Tidak ada feedback)"}
        </p>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit}>
      {mySubmission && !mySubmission.grade && (
        <div className="alert alert-info mb-4">
          <span>
            Anda sudah mengumpulkan tugas ini. Mengirim lagi akan menimpa
            jawaban sebelumnya.
          </span>
        </div>
      )}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Jawaban Teks (Opsional)</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Ketik jawaban Anda di sini..."
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
        ></textarea>
      </div>
      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Unggah File Jawaban (Opsional)</span>
        </label>
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          onChange={(e) =>
            setFileAnswer(e.target.files ? e.target.files[0] : null)
          }
          ref={fileInputRef}
        />
        {mySubmission?.file_url && !fileAnswer && (
          <a
            href={mySubmission.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-link btn-xs"
          >
            Lihat file yang sudah diunggah
          </a>
        )}
      </div>
      <div className="modal-action">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={uploading || loading}
        >
          {(uploading || loading) && (
            <span className="loading loading-spinner text-xs"></span>
          )}
          {uploading
            ? "Mengunggah..."
            : mySubmission
            ? "Kirim Ulang"
            : "Kirim Jawaban"}
        </button>
      </div>
    </form>
  );
}

// ====================================================================
// Komponen: GradeViewComponent (Tidak Berubah)
// ====================================================================
function GradeViewComponent({
  assignmentId,
  classMembers,
}: {
  assignmentId: string;
  classMembers: any[];
}) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSubmission, setCurrentSubmission] = useState<any | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  async function fetchSubmissions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignmentId);
    if (error) {
      console.error("Error fetching submissions:", error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  }

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!currentSubmission) return;
    setLoading(true);
    const { error } = await supabase
      .from("submissions")
      .update({ grade: grade, feedback: feedback })
      .eq("id", currentSubmission.submission.id);
    if (error) {
      alert("Gagal memberi nilai: " + error.message);
    } else {
      alert("Nilai berhasil disimpan!");
      setSubmissions(
        submissions.map((s) =>
          s.id === currentSubmission.submission.id
            ? { ...s, grade, feedback }
            : s
        )
      );
      setCurrentSubmission(null);
      setGrade("");
      setFeedback("");
    }
    setLoading(false);
  }

  const memberSubmissions = classMembers.map((member) => {
    const submission = submissions.find(
      (s) => s.student_id === member.student_id
    );
    return {
      student_email: member.users.email,
      student_id: member.student_id,
      submission: submission || null,
    };
  });

  if (loading)
    return (
      <div className="text-center">
        <span className="loading loading-spinner"></span>
      </div>
    );
  if (currentSubmission) {
    return (
      <form onSubmit={handleGrade}>
        <button
          className="btn btn-link btn-xs"
          onClick={() => setCurrentSubmission(null)}
        >
          ← Kembali ke daftar
        </button>
        <h4 className="font-bold text-lg">
          Menilai: {currentSubmission.student_email}
        </h4>
        <div className="p-4 bg-base-200 rounded-lg my-4">
          <h5 className="font-semibold">Jawaban Siswa:</h5>
          {currentSubmission.submission?.text_answer && (
            <p className="prose">{currentSubmission.submission.text_answer}</p>
          )}
          {currentSubmission.submission?.file_url && (
            <a
              href={currentSubmission.submission.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-link"
            >
              Lihat File Jawaban
            </a>
          )}
          {!currentSubmission.submission?.text_answer &&
            !currentSubmission.submission?.file_url && (
              <p className="opacity-70">(Siswa tidak memberikan jawaban)</p>
            )}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Nilai (misal: A+, 90, B-)</span>
          </label>
          <input
            type="text"
            placeholder="Masukkan nilai"
            className="input input-bordered"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
          />
        </div>
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Feedback / Komentar</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Tulis feedback untuk siswa..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
        </div>
        <div className="modal-action">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && (
              <span className="loading loading-spinner text-xs"></span>
            )}
            Simpan Nilai
          </button>
        </div>
      </form>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Siswa</th>
            <th>Status</th>
            <th>Nilai</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {memberSubmissions.map((ms) => (
            <tr key={ms.student_id}>
              <td>{ms.student_email}</td>
              <td>
                {ms.submission ? (
                  <span className="badge badge-success">
                    Sudah Mengumpulkan
                  </span>
                ) : (
                  <span className="badge badge-ghost">Belum</span>
                )}
              </td>
              <td>{ms.submission?.grade || "-"}</td>
              <td>
                <button
                  className="btn btn-primary btn-xs"
                  disabled={!ms.submission}
                  onClick={() => {
                    setCurrentSubmission(ms);
                    setGrade(ms.submission?.grade || "");
                    setFeedback(ms.submission?.feedback || "");
                  }}
                >
                  Beri Nilai
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ====================================================================
// Komponen: MaterialDetailModal (Tidak Berubah)
// ====================================================================
function MaterialDetailModal({
  material,
  onClose,
  userId,
  userRole,
  classId,
}: {
  material: any;
  onClose: () => void;
  userId: string;
  userRole: string;
  classId: string;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();
    const channel = supabase
      .channel(`comments_for_material_${material.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `material_id=eq.${material.id}`,
        },
        async (payload) => {
          const { data: userData, error } = await supabase
            .from("users")
            .select("email")
            .eq("id", payload.new.user_id)
            .single();
          if (!error && userData) {
            const commentWithUser = { ...payload.new, users: userData };
            setComments((currentComments) => [
              ...currentComments,
              commentWithUser,
            ]);
          } else {
            setComments((currentComments) => [...currentComments, payload.new]);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [material.id]);

  async function fetchComments() {
    setLoadingComments(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*, users ( email )")
      .eq("material_id", material.id)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
    setLoadingComments(false);
  }

  async function handleCreateComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    const { error } = await supabase.from("comments").insert({
      content: newComment,
      user_id: userId,
      material_id: material.id,
      class_id: classId,
    });
    if (error) {
      alert("Gagal mengirim komentar: " + error.message);
    } else {
      setNewComment("");
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Anda yakin ingin menghapus komentar ini?")) return;
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) {
      alert("Gagal menghapus komentar: " + error.message);
    } else {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  }

  return (
    <dialog id="comment_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg mb-2">{material.title}</h3>
        <p className="text-xs text-opacity-70">
          Diunggah oleh: {material.users?.email || "N/A"} -{" "}
          {new Date(material.created_at).toLocaleString()}
        </p>
        {material.file_url && (
          <a
            href={material.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm mt-4"
          >
            Download Lampiran
          </a>
        )}
        <div className="divider"></div>
        <h4 className="font-semibold text-md mb-4">Diskusi / Komentar</h4>
        <div className="max-h-60 overflow-y-auto bg-base-200 p-4 rounded-lg space-y-4">
          {loadingComments && (
            <div className="text-center">
              <span className="loading loading-spinner"></span>
            </div>
          )}
          {!loadingComments && comments.length === 0 && (
            <p className="text-center text-sm opacity-70">
              Belum ada komentar.
            </p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="chat chat-start">
              <div className="chat-header text-xs opacity-70">
                {comment.users?.email || "User"}
                <time className="text-xs opacity-50 ml-1">
                  {new Date(comment.created_at).toLocaleTimeString()}
                </time>
              </div>
              <div className="chat-bubble flex items-center group">
                <div>{comment.content}</div>
                {(userRole === "GURU" || comment.user_id === userId) && (
                  <button
                    className="btn btn-error btn-xs opacity-0 group-hover:opacity-100 ml-4"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleCreateComment} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Tulis komentar..."
            className="input input-bordered w-full"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Kirim
          </button>
        </form>
      </div>
    </dialog>
  );
}

// ====================================================================
// Komponen: StudentProgressViewComponent (Nama Baru)
// ====================================================================
function StudentProgressViewComponent({
  classId,
  studentId,
}: {
  classId: string;
  studentId: string;
}) {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProgress();
  }, [classId, studentId]);

  async function fetchStudentProgress() {
    setLoading(true);

    // 1. Ambil semua tugas di kelas ini
    const { data: assignments, error: assignError } = await supabase
      .from("assignments")
      .select("id, title, due_date")
      .eq("class_id", classId);

    if (assignError) {
      console.error("Error fetching assignments for progress:", assignError);
      setLoading(false);
      return;
    }

    // 2. Ambil semua submisi milik siswa ini
    const { data: submissions, error: subError } = await supabase
      .from("submissions")
      .select("assignment_id, grade, feedback")
      .eq("student_id", studentId);

    if (subError) {
      console.error("Error fetching submissions for progress:", subError);
      setLoading(false);
      return;
    }

    // 3. Gabungkan datanya
    const progressData = assignments.map((assignment) => {
      const submission = submissions.find(
        (s) => s.assignment_id === assignment.id
      );
      return { ...assignment, submission: submission || null };
    });

    setProgress(progressData);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-center p-10">
        <span className="loading loading-lg loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="card-title mt-4 mb-4">Progres Saya</h2>
      <div className="overflow-x-auto">
        {progress.length === 0 ? (
          <p className="text-center p-4">Belum ada tugas di kelas ini.</p>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nama Tugas</th>
                <th>Status</th>
                <th>Nilai</th>
                <th>Feedback Guru</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((item) => (
                <tr key={item.id}>
                  <td className="font-semibold">{item.title}</td>
                  <td>
                    {item.submission ? (
                      item.submission.grade ? (
                        <span className="badge badge-success">
                          Sudah Dinilai
                        </span>
                      ) : (
                        <span className="badge badge-info">
                          Sudah Dikumpulkan
                        </span>
                      )
                    ) : (
                      <span className="badge badge-ghost">
                        Belum Dikerjakan
                      </span>
                    )}
                  </td>
                  <td className="font-bold text-lg">
                    {item.submission?.grade || "-"}
                  </td>
                  <td className="prose prose-sm">
                    {item.submission?.feedback || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ====================================================================
// Komponen BARU: TeacherProgressViewComponent (Rapor Kelas)
// ====================================================================
function TeacherProgressViewComponent({
  classId,
  assignments,
  members,
}: {
  classId: string;
  assignments: any[];
  members: any[];
}) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kita hanya perlu mengambil SEMUA submisi untuk kelas ini
    fetchAllSubmissions();
  }, [classId]);

  async function fetchAllSubmissions() {
    setLoading(true);
    // 1. Dapatkan dulu ID semua tugas di kelas ini
    const assignmentIds = assignments.map((a) => a.id);

    if (assignmentIds.length === 0) {
      setLoading(false);
      return;
    }

    // 2. Ambil semua submisi yang assignment_id-nya ada di daftar
    const { data, error } = await supabase
      .from("submissions")
      .select("assignment_id, student_id, grade")
      .in("assignment_id", assignmentIds);

    if (error) {
      console.error("Error fetching all submissions:", error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-center p-10">
        <span className="loading loading-lg loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="card-title mt-4 mb-4">Progres Kelas (Rapor)</h2>
      <div className="overflow-x-auto">
        {members.length === 0 ? (
          <p className="text-center p-4">Belum ada siswa di kelas ini.</p>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                {/* Buat kolom header untuk setiap tugas */}
                {assignments.map((a) => (
                  <th key={a.id} className="text-center">
                    {a.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Buat baris untuk setiap siswa */}
              {members.map((member) => (
                <tr key={member.student_id}>
                  <td className="font-semibold">{member.users.email}</td>

                  {/* Buat sel untuk setiap tugas */}
                  {assignments.map((assignment) => {
                    // Cari submisi siswa ini untuk tugas ini
                    const submission = submissions.find(
                      (s) =>
                        s.student_id === member.student_id &&
                        s.assignment_id === assignment.id
                    );

                    return (
                      <td key={assignment.id} className="text-center">
                        {submission ? (
                          <span
                            className={`badge ${
                              submission.grade ? "badge-success" : "badge-info"
                            }`}
                          >
                            {submission.grade || "Terkumpul"}
                          </span>
                        ) : (
                          <span className="badge badge-ghost">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
