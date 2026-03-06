const crypto = require('crypto');

exports.handler = async (event) => {
    // Sadece POST (Veri gönderme) isteklerini kabul et, izinsiz girişleri engelle
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Sadece POST istekleri kabul edilir.' }) 
        };
    }

    try {
        // 1. FRONTEND'DEN GELEN SİPARİŞ VERİLERİNİ YAKALA
        const data = JSON.parse(event.body);
        const { urunAdi, fiyat, musteriAd, musteriSoyad, musteriEmail, musteriTelefon, musteriAdres, musteriSehir } = data;

        // 2. SHOPIER GÜVENLİK ANAHTARLARI (Netlify panelinden çekeceğiz, şimdilik TEST yazıyoruz)
        const API_KEY = process.env.SHOPIER_API_KEY || "TEST_API_KEY";
        const API_SECRET = process.env.SHOPIER_API_SECRET || "TEST_API_SECRET";

        // 3. SİPARİŞ BİLGİLERİNİ HAZIRLA
        // Shopier her sipariş için benzersiz bir numara ister
        const siparisNo = Math.floor(Math.random() * 10000000).toString();
        const rastgeleSifre = Math.floor(Math.random() * 1000000).toString();
        const odemeTutari = parseFloat(fiyat).toFixed(2); // Örn: 149.90 formatına çevirir

        // 4. SHOPIER İÇİN GÜVENLİK MÜHRÜNÜ (SIGNATURE) OLUŞTUR
        // Şifreleme Algoritması: rastgele_sayı + siparis_no + tutar + para_birimi (0 = TL)
        const dataString = rastgeleSifre + siparisNo + odemeTutari + "0"; 
        
        const hmac = crypto.createHmac('sha256', API_SECRET);
        hmac.update(dataString);
        const signature = hmac.digest('base64');

        // 5. SHOPIER'İN İSTEDİĞİ FORMATTA PAKETİ HAZIRLA VE FRONTEND'E GERİ GÖNDER
        const shopierData = {
            API_key: API_KEY,
            website_index: 1, // Shopier panelindeki mağaza indexin
            platform_order_id: siparisNo,
            product_name: urunAdi || "Millionn Özel Tasarım",
            product_type: 1, // 1: Fiziksel Ürün, 2: Dijital Ürün
            buyer_name: musteriAd || "Misafir",
            buyer_surname: musteriSoyad || "Kullanıcı",
            buyer_email: musteriEmail || "info@millionnstudio.com",
            buyer_account_age: 0,
            buyer_id_nr: 11111111111, // TC Kimlik No (Zorunlu)
            buyer_phone: musteriTelefon || "05555555555",
            billing_address: musteriAdres || "Teslimat Adresi",
            billing_city: musteriSehir || "Izmir",
            billing_country: "TR",
            billing_postcode: "35000",
            shipping_address: musteriAdres || "Teslimat Adresi",
            shipping_city: musteriSehir || "Izmir",
            shipping_country: "TR",
            shipping_postcode: "35000",
            total_order_value: odemeTutari,
            currency: 0, // 0: TL, 1: USD, 2: EUR
            platform: 0,
            is_in_frame: 0,
            current_language: 0, // 0: TR
            modul_version: "1.0.4",
            random_nr: rastgeleSifre,
            signature: signature
        };

        // Bu bilgileri ön yüze dönüyoruz, ön yüz bunu form yapıp Shopier'e postlayacak
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Her yerden isteği kabul et (Geliştirme için)
            },
            body: JSON.stringify(shopierData)
        };

    } catch (error) {
        console.error("Ödeme başlatma hatası:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: 'Ödeme altyapısında bir sorun oluştu.' }) 
        };
    }
};