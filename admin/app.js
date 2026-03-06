// Admin sayfalarını koruyan güvenlik fonksiyonu
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Oturum açılmamışsa giriş sayfasına yönlendir
        window.location.href = "index"; 
    }
}

// Sayfa yüklenir yüklenmez kontrolü çalıştır
checkAuth();
// --- MILLIONN STUDIO V2 - SUPABASE EDITION ---
import { supabase } from "../configs/supabase.js";

const saveBtn = document.getElementById('saveBtn');   // Yeşil Buton (Yayınla)
const draftBtn = document.getElementById('draftBtn'); // Sarı Buton (Taslak)
const imageInput = document.getElementById('imageInput');
const titleInput = document.querySelector('.title-input');
const promptInput = document.querySelector('.prompt-input');

// --- ORTAK KAYDETME FONKSİYONU ---
async function handleSave(statusType) {
    // 1. Kontrol
    if (!imageInput.files[0] || titleInput.value === "" || promptInput.value === "") {
        alert("LÜTFEN TÜM ALANLARI DOLDUR ŞAMPİYON! ⚠️");
        return;
    }

    // Hangi butona basıldıysa onu seçelim
    const activeBtn = statusType === 'active' ? saveBtn : draftBtn;
    const originalContent = activeBtn.innerHTML;

    // Butonu "Yükleniyor" moduna al
    activeBtn.innerHTML = "⏳";
    activeBtn.style.opacity = "0.7";
    saveBtn.disabled = true;
    draftBtn.disabled = true;

    try {
        console.log(`İşlem Başlıyor... Hedef: ${statusType.toUpperCase()}`);
        
        // A. GÖRSELİ YÜKLE
        const file = imageInput.files[0];
        const fileName = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.]/g, "_");

        const { data: imgData, error: imgError } = await supabase
            .storage
            .from('millions-bucket')
            .upload(fileName, file);

        if (imgError) throw imgError;

        // B. GÖRSEL URL'İNİ AL
        const { data: publicUrlData } = supabase
            .storage
            .from('millions-bucket')
            .getPublicUrl(fileName);
            
        const finalImageUrl = publicUrlData.publicUrl;

        // C. VERİYİ KAYDET (DURUMA GÖRE)
        const { error: dbError } = await supabase
            .from('prompts')
            .insert([
                {
                    title: titleInput.value.toUpperCase(),
                    prompt: promptInput.value,
                    image_url: finalImageUrl,
                    model: "Nano Banana",
                    ratio: "4:5",
                    status: statusType // 'active' veya 'draft'
                }
            ]);

        if (dbError) throw dbError;

        // D. BAŞARILI
        activeBtn.innerHTML = "✅";
        
        let message = "";
        if (statusType === 'active') {
            activeBtn.style.background = "#39ff14";
            message = "YAYINLANDI! 🚀";
        } else {
            activeBtn.style.background = "#f1c40f";
            message = "TASLAĞA ATILDI! 📒";
        }
        activeBtn.style.color = "#000";

        setTimeout(() => {
            alert(message);
            window.location.reload();
        }, 500);

    } catch (error) {
        console.error("HATA:", error);
        alert("BİR SORUN VAR: " + error.message);
        activeBtn.innerHTML = originalContent;
        activeBtn.style.opacity = "1";
        saveBtn.disabled = false;
        draftBtn.disabled = false;
    }
}

// --- TIKLAMA OLAYLARI ---

// Yeşil Buton (YAYINLA)
saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleSave('active');
});

// Sarı Buton (TASLAK)
draftBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleSave('draft');
});