# WTTG3 hash çözümleme ve yerel save import araştırması

Tarih: 2 Ağustos 2026

## Sonuç

WTTG3 için yalnızca `indeks + 8 karakterlik şifreli hash` alıp her run'da doğru
`4 karakterlik çözülmüş parça` üreten doğrulanmış bir tarayıcı algoritması
bulunamadı. Güvenilir çözüm, aynı run'a ait `.sav` dosyasındaki
`EncryptedKeys` ve `DecryptedKeys` dizilerini indeks sırasına göre eşlemektir.

Bu nedenle Helper içindeki özellik bir kripto algoritması gibi davranmaz.
Araştırmada doğrulanan iki run'ın 16 yerleşik çifti, yüklenen save veya
kullanıcının key organizer içinde zaten doğruladığı çiftler üzerinden tam
eşleşme yapar:

```text
1 - 1ef9d5b6  ->  1 - 36ea
```

İndeks veya 8 karakterlik değer eşleşmiyorsa sonuç üretmez ve `eşleşme yok`
der. Tahmin edilen, örnek veya sabit bir 4 karakterlik değer hiçbir zaman
gösterilmez.

## Oyun yapısından elde edilen kanıt

WTTG3 save formatındaki `Keys` modülü üç ayrı alan saklıyor:

- `EncryptedKeys`: sekiz adet 8 karakterlik değer
- `DecryptedKeys`: sekiz adet 4 karakterlik değer
- `WinURL`: çözülmüş sekiz parçanın indeks sırasıyla birleştiği 32 karakterlik değer

Yerel oyun binary ve save incelemesinde key yöneticisinin bu dizileri run
durumu olarak tuttuğu, şifreli değerleri sitelere dağıttığı ve oyun içindeki
decryptor ajan akışının kayıtlı eşleşmenin çözülmüş tarafını teslim ettiği
görüldü. İstemci tarafında tekrar uygulanabilecek bağımsız bir dönüşüm tablosu
veya doğrulanabilir saf fonksiyon bulunmadı.

## İki ayrı run ile doğrulama

### Run A

| İndeks | Şifreli | Çözülmüş |
|---:|---|---|
| 1 | `1ef9d5b6` | `36ea` |
| 2 | `2f45095a` | `84be` |
| 3 | `b2a23ff2` | `ff6b` |
| 4 | `ac4742d5` | `7b6b` |
| 5 | `969a03ed` | `286d` |
| 6 | `5dd6f03c` | `052b` |
| 7 | `bbd6e8c6` | `741f` |
| 8 | `e01fdd64` | `f735` |

Birleşik `WinURL`:

```text
36ea84beff6b7b6b286d052b741ff735
```

### Run B

| İndeks | Şifreli | Çözülmüş |
|---:|---|---|
| 1 | `33044ba5` | `e09c` |
| 2 | `605349d8` | `d6bb` |
| 3 | `984b8bf2` | `2887` |
| 4 | `4f12d709` | `18f2` |
| 5 | `aca5a6a8` | `c635` |
| 6 | `c097dbaf` | `5716` |
| 7 | `a24dcae5` | `2d49` |
| 8 | `726e44cd` | `c48d` |

Birleşik `WinURL`:

```text
e09cd6bb288718f2c63557162d49c48d
```

On altı çiftin run'lar arasında tamamen değişmesi, WTTG2 için hazırlanmış
sabit veya oyun dışı bir key yaklaşımının WTTG3'e doğrudan taşınamayacağını
gösteriyor.

## Save okuyucu tasarımı

Uygulanan okuyucu salt okunurdur:

1. `GVAS` imzasını doğrular.
2. WTTG3'ün UE5.6 complete-type property biçimini doğrular.
3. SaveGame sınıfının `WTTGSDSaveGame` olduğunu doğrular.
4. `ModuleVersions` ve `ModuleBlobs` tablolarını güvenli sınırlarla ayrıştırır.
5. Yalnızca Helper için gerekli özet alanları çıkarır.

Çıkarılan alanlar:

- Sekiz şifreli ve sekiz çözülmüş key
- `WinURL`
- Oyun saati ve kalan saat
- Ziyaret edilen site sayısı
- DOSCoin bakiyesi
- VirtMesh makineleri ve miner durumundaki makineler

Tarayıcı ham save'i `localStorage` içine yazmaz, bir sunucuya göndermez ve
dosyayı değiştirmez. Kullanıcı ayrıca aktar düğmesine bastığında yalnızca key
çiftleri mevcut organizer durumuna yazılır.

## Hata ve güvenlik sınırları

- En yüksek dosya boyutu 64 MB.
- Geçersiz GVAS, eski UE paketi ve farklı SaveGame sınıfı reddedilir.
- Koleksiyon sayıları üst sınırla doğrulanır.
- FString uzunlukları dosya sınırından taşamaz.
- Hash resolver hem indeksin hem şifreli değerin eşleşmesini ister; farklı
  run'lardaki aynı indeksler birbirinin üstüne yazılmaz.
- Eksik veya uyuşmayan değer için çözülmüş parça uydurulmaz.

## Doğrulama

`save-reader-core.js`, mevcut gerçek save üzerinde şu sonucu verdi:

- 8 / 8 şifreli key
- 8 / 8 çözülmüş parça
- `WinURL` ile parçaların birleşimi birebir eşleşiyor
- Oyun saati `03:00`
- 4 aktif miner: WebTyk, GameDrux, OpsHax, Phoenix

Aynı parser bir yedek save üzerinde de hatasız çalıştı. Tarayıcı testinde
gerçek save yüklendi, 8 çift organizer'a aktarıldı ve resolver şu çıktıyı
üretti:

```text
1 - 36ea
2 - 84be
3 - eşleşme yok
```

## Kaynaklar

- Yerel save formatı uygulaması: `../WTTG3-Save-Editor/app/lib/gvas.ts`
- Yerel format notu: `../WTTG3-Save-Editor/docs/SAVE_FORMAT.md`
- WTTG3 resmi güncelleme notları: <https://steamcommunity.com/app/3869850/allnews/>
- Site saatleri ve VirtMesh referansı: <https://steamcommunity.com/sharedfiles/filedetails/?id=3767348828>
- 1.0.5 sonrası ölçülen VirtMesh hızları: <https://docs.google.com/document/d/1Z0_zZvZ6Sl6BQOplHtYPV76ZfxLpvfFSbPZk2HJZ3Eg/edit?tab=t>
- WTTG2 karşılaştırma projesi: <https://github.com/duckness/wttg2key>

Topluluk kaynakları yalnızca site saatleri ve ölçülen miner hızları için
kullanıldı. Save yapısı ve hash eşleştirme kararı yerel WTTG3 dosyaları ve iki
ayrı run save'i ile doğrulandı.
