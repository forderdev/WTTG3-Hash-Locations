# WTTG3 Helper

Welcome to the Game III için koyu temalı TR/EN ikinci ekran yardımcısı.

- 51 site, 132 sayfa ve 1.156 işaretli konum
- Orijinal İngilizce ve Türkçe site ön izlemeleri
- Tarayıcı diline göre otomatik TR/EN seçimi
- Oyun dakikasına göre açık site listesi
- 30 VirtMesh makinesi için miner planlayıcı
- Tarayıcıda otomatik kaydedilen run notları
- Düşük, Hash ve Tam spoiler seviyeleri
- Yalnızca tarayıcıda çalışan, hiçbir dosya yüklemeyen `.sav` okuyucu
- Bilinen doğrulanmış run'ları ve yerel save'i kullanarak `1 - 8hex` girdilerini `1 - 4hex` çıktısına dönüştüren hash çözümleyici
- 8 şifreli hash ve 8 çözülmüş parçadan 32 karakterlik master key oluşturma
- GitHub Pages ile tamamen statik çalışma

Yerelde açmak için `baslat.bat` dosyasını çalıştır. Veri ve organizer
doğrulaması:

```powershell
node tools/verify.mjs
```

Varsayılan save yolu:

```text
%LOCALAPPDATA%\WTTGSD\Saved\SaveGames\WTTGSD_SaveGame.sav
```

Araştırma notları:

- [WTTG2 ve WTTG3 key mekanikleri](docs/key-organizer-research.md)
- [WTTG3 hash çözümleme ve save import](docs/hash-decryptor-and-save-import-research.md)

Bu proje resmî değildir.
