# WTTG3 hash çözümleyici: save dosyası olmadan çözüm araştırması

## Sonuç

WTTG3'te ekranda görünen 8 haneli değer, aynı slottaki 4 haneli parçanın şifrelenmiş veya hash'lenmiş biçimi değil. Oyun, iki değer için **iki ayrı rastgele metin** üretiyor ve bunları ayrı ayrı MD5'liyor:

```text
EncryptedKeys[i] = MD5(random_alphanumeric(6..8))[0..8]
DecryptedKeys[i] = MD5(random_alphanumeric(6..8))[0..4]
WinURL           = DecryptedKeys[0] + ... + DecryptedKeys[7]
```

Buradaki iki `random_alphanumeric` çağrısı farklıdır. Bu nedenle `1ef9d5b6 -> 36ea` gibi bir eşleşmede `36ea`, `1ef9d5b6` değerinden klasik bir hash/CRC formülüyle geri hesaplanamaz. `0000..ffff` arasındaki 65.536 adayı hash'leyerek aramak da gerçek üretim modelini temsil etmez.

Save dosyası olmadan çalışan yol bulundu ve uygulandı: aynı UCRT `rand()` durumunun 2^32 olasılığı WebGPU ile taranıyor. İlk encrypted hash state adaylarını buluyor; ikinci ve varsa kalan hashler doğru run'ı doğruluyor. Doğru state ile arada üretilen 4 haneli parçalar yeniden oluşturuluyor. Bu doğrudan bir hash ters çevirme formülü değil, **PRNG-state recovery** saldırısıdır.

Üretim aracı iki bağımsız gerçek run'da uçtan uca doğrulandı. RTX 3060 Ti üzerinde tam 2^32 tarama, tarayıcı/GPU ısınma durumuna göre testlerde yaklaşık `1.1–17.0` saniye sürdü. WebGPU olmayan tarayıcılarda save import kesin fallback olarak korunur.

## Yerel oyun binary'sindeki kesin kanıt

Araştırılan sürüm:

| Alan | Değer |
|---|---|
| Dosya | `WTTGSD/Binaries/Win64/WTTGSD-Win64-Shipping.exe` |
| Boyut | `161,746,944` bayt |
| UE sürümü | `++UE5+Release-5.6-CL-44394996` |
| SHA-256 | `DDD1CBDDA97B6197B4707E48191BDC94854315B26C8FCB9BE03650EBCFE09A26` |
| Binary tarihi (UTC) | `2026-07-30 15:34:16` |

`UKeyManager` reflection alanları ve constructor'ı dizilerin yerini doğruluyor:

| Nesne ofseti | Alan |
|---:|---|
| `+0xE0` | `EncryptedKeys` |
| `+0xF0` | `DecryptedKeys` |
| `+0x100` | `WinURL` |

Constructor RVA `0x4CE2570` bu alanları başlatıyor. Alan ofsetleriyle birebir örtüşen üretim rutini RVA `0x4CFC3F0`'dır. Önemli komut akışı:

| RVA / VA | Gözlem |
|---|---|
| `0x4CFC41E` | `this + 0xE0`, yani encrypted dizisini alır |
| `0x4CFC429` | `this + 0xF0`, yani decrypted dizisini alır |
| `0x4CFC43D` | normal oyunda 8 slotluk döngü |
| `0x4CFC450` | encrypted uzunluğu için UCRT `rand()` |
| `0x4CFC47E` | ilk rastgele metni üretir |
| `0x4CFC499` | metni MD5 helper'a verir |
| `0x4CFC4B9..0x4CFC4DB` | sonucu en fazla 8 karaktere keser ve encrypted dizisine ekler |
| `0x4CFC543` | decrypted için **yeni** bir uzunluk `rand()` çağrısı |
| `0x4CFC571` | **yeni** bir rastgele metin üretir |
| `0x4CFC58C` | ikinci metni aynı MD5 helper'a verir |
| `0x4CFC5AC..0x4CFC5D2` | sonucu en fazla 4 karaktere keser ve decrypted dizisine ekler |
| `0x4CFC644..0x4CFC677` | decrypted dizisini sırayla `this + 0x100` içindeki `WinURL`'ye ekler |

Üretim rutini RVA `0x4CE99DD` adresinden doğrudan çağrılıyor.

### Rastgele metin ayrıntıları

RVA `0x4CFE8D0`'daki helper'a iki durumda da `r8b = 0` gönderiliyor. Kullanılan 62 karakterlik alfabe binary'de açıkça bulunuyor:

```text
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890
```

Her metnin uzunluğu `6`, `7` veya `8`. Uzunluk seçimindeki float sabiti `0x38C00180` (`0.00009155552834272385`), karakter seçimindeki sabit `0x38000100` (`0.000030518509447574615`). Her karakter için ayrı bir `rand()` çağrısı yapılıyor.

### MD5 olduğunun kanıtı

RVA `0x3A2B560`'daki helper:

- RVA `0x13645A0` ile bağlamı `67452301 EFCDAB89 98BADCFE 10325476` sabitleriyle başlatıyor; bunlar MD5'in dört başlangıç kelimesidir.
- Girdiyi update/final akışından geçiriyor.
- 16 digest baytının tamamı üzerinde dönüyor.
- Her baytı binary'deki `%02x` formatıyla yazıyor; sonuç 32 karakterlik lowercase hex oluyor.

MD5'in 128 bit digest ürettiği resmi tanım [RFC 1321](https://www.rfc-editor.org/rfc/rfc1321)'de bulunuyor. Oyun daha sonra bu 32 karakterin yalnızca ilk 8 veya ilk 4 karakterini saklıyor.

## UCRT PRNG bulguları

PE import tablosu şunları doğruluyor:

| IAT adresi | DLL | Fonksiyon |
|---|---|---|
| `0x1470FDF60` | `api-ms-win-crt-utility-l1-1-0.dll` | `srand` |
| `0x1470FDF68` | `api-ms-win-crt-utility-l1-1-0.dll` | `rand` |
| `0x1470FCA98` | `KERNEL32.dll` | `QueryPerformanceCounter` |

Binary'de `srand` için tek statik xref var: VA `0x1444CFCEC`. Hemen öncesinde `QueryPerformanceCounter` çağrılıyor ve sayacın düşük 32 biti `srand` seed'i olarak veriliyor. Aynı binary'de `rand` importuna **778 statik xref** bulundu. Bu nedenle sadece yaklaşık başlatma saatinden seed'i tahmin edip oyunun bütün `rand()` tüketimini yeniden oynatmak kolay veya sabit bir yol değil.

Makinedeki Windows SDK'nın UCRT kaynağı (`C:/Program Files (x86)/Windows Kits/10/Source/10.0.26100.0/ucrt/stdlib/rand.cpp`) algoritmayı doğruluyor:

```cpp
state = state * 214013 + 2531011; // uint32 wrap
return (state >> 16) & 32767;
```

Microsoft'un [`rand` belgesi](https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/rand?view=msvc-170) dönüş aralığının `0..32767` olduğunu ve bunun kriptografik olarak güvenli olmadığını; [`srand` belgesi](https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/srand?view=msvc-170) aynı seed'in aynı sözde-rastgele diziyi yeniden ürettiğini belirtiyor.

Bir slot iki metin için toplam `14..18`, sekiz slot ise `112..144` `rand()` sonucu tüketiyor. Dolayısıyla üretim rutininin girişindeki 32 bit state tam olarak bilinse encrypted ve decrypted listeleri deterministik olarak yeniden üretilebilir.

## 2^32 state recovery yolu: doğrulandı ve ürüne alındı

Seed zamanını ve önceki 778 olası `rand()` tüketimini yeniden oynatmak yerine, üretim rutini başındaki state doğrudan taranabilir:

1. `0x00000000..0xffffffff` arasındaki her state adayı için ilk uzunluğu ve ilk 6–8 karakteri üret.
2. Metnin MD5'inin ilk 8 hex karakterini kullanıcının ilk encrypted değeriyle karşılaştır.
3. Eşleşen az sayıdaki state adayından rutinin geri kalanını çalıştır.
4. Sekiz encrypted değerin tamamını doğrula; doğrulanan adayın aradaki decrypted üretimlerini sonuç olarak ver.

Bu aramanın ham uzayı `4,294,967,296` state'tir. Run A'nın ilk encrypted değeri için tam tarama gerçekten dört aday buldu. Bunlardan `0x509574ae` ve `0xd09574ae` sekiz encrypted değerin tamamını geçti ve aynı run'ı üretti; üst bit farkı UCRT'nin 15 bitlik çıktısında eşdeğer kaldı. Diğer iki aday ikinci ve sonraki hash doğrulamasında elendi.

Doğrulanan Run A çıktısı:

```text
1ef9d5b6 ... e01fdd64
       ↓ 2^32 WebGPU state scan
36ea 84be ff6b 7b6b 286d 052b 741f f735
```

Run B de yalnızca indeks 1 ve 2 girilerek üretim arayüzünden çözüldü; araç sekiz parçanın tamamını `e09c d6bb 2887 18f2 c635 5716 2d49 c48d` olarak yeniden üretti ve save'deki sekiz değerle birebir eşleştirdi.

Uygulama seçenekleri:

- Üretim uygulaması `gpu-hash-solver.js` içindeki WebGPU compute kernel'ini kullanır.
- GitHub Pages yalnız statik dosyaları sunar; bütün hesap kullanıcının GPU'sunda yerel yapılır.
- Arayüz ilerleme ve iptal desteği verir, çözümden sonra sekiz çifti organizer'a kaydeder.
- WebGPU olmayan veya sürücü hatası yaşayan kullanıcılar aynı run'ın `.sav` dosyasını yükleyebilir.
- CPU WebAssembly + worker fallback'i eklenmedi; 4,3 milyar aday CPU için gereksiz derecede ağır olabilir.

Bu yol, "encrypted hash'in içinden decrypted parçayı matematiksel olarak çıkarma" değil; rastgele üretecin gizli ara durumunu exhaustive search ile geri bulma yöntemidir.

## 65.536 aday ve yaygın hash testleri

4 hex karakterin alanı 65.536 değerdir. Fakat oyun `encrypted = H(decrypted)` yapmadığı için şu arama yanlış modele dayanır:

```text
for candidate in 0000..ffff:
    if H(candidate) == encrypted:
        return candidate
```

İki gerçek run'dan 16 eşleşme üzerinde destekleyici negatif testler de yapıldı:

| Test ailesi | Kapsam | Konfigürasyon | En iyi sonuç |
|---|---|---:|---:|
| Kriptografik digest | MD5, SHA-1, SHA-224/256/384/512, SHA3-256, BLAKE2s | 960 | `0/16` |
| 32 bit hash/checksum | CRC32, CRC32C, FNV-1, FNV-1a, Adler32, DJB2, SDBM, Jenkins, Murmur3 | 1.080 | `0/16` |

Varyantlar ASCII, UTF-16LE ve raw-hex girdi; null terminatorlu/terminatorsuz; uppercase; indeks önek/sonek ve ayırıcı şablonları; ilk/son digest baytları ve 32 bit byte-swap biçimlerini kapsadı. Tek bir çiftte bile eşleşme çıkmadı. Bunlar tek başına sonsuz algoritma uzayını kanıtlamaz; belirleyici kanıt yukarıdaki üretim rutininin iki ayrı rastgele metin kullanmasıdır.

Sekiz decrypted parçayı körlemesine tahmin etmenin başarı olasılığı `1 / 65536^8 = 1 / 2^128`'dir.

## Gerçek eşleşmelerle kontrol

Save'lerden okunan iki bağımsız run:

| Slot | Run A encrypted | Run A decrypted | Run B encrypted | Run B decrypted |
|---:|---|---|---|---|
| 1 | `1ef9d5b6` | `36ea` | `33044ba5` | `e09c` |
| 2 | `2f45095a` | `84be` | `605349d8` | `d6bb` |
| 3 | `b2a23ff2` | `ff6b` | `984b8bf2` | `2887` |
| 4 | `ac4742d5` | `7b6b` | `4f12d709` | `18f2` |
| 5 | `969a03ed` | `286d` | `aca5a6a8` | `c635` |
| 6 | `5dd6f03c` | `052b` | `c097dbaf` | `5716` |
| 7 | `bbd6e8c6` | `741f` | `a24dcae5` | `2d49` |
| 8 | `e01fdd64` | `f735` | `726e44cd` | `c48d` |

```text
Run A WinURL = 36ea84beff6b7b6b286d052b741ff735
Run B WinURL = e09cd6bb288718f2c63557162d49c48d
```

Her iki run'da da `WinURL === DecryptedKeys.join("")` birebir doğrulandı.

## WTTG2 aracı neden algoritma sağlamıyor?

[`duckness/wttg2key`](https://github.com/duckness/wttg2key/tree/11ba45a0395b8889843a24dbb46cd62bc95ad5e0) bir decryption aracı değil, organizer'dır:

- [`InputField.vue`](https://github.com/duckness/wttg2key/blob/11ba45a0395b8889843a24dbb46cd62bc95ad5e0/src/components/InputField.vue#L71-L98) metinden 12 hex karakterlik hazır parçayı regex ile alır.
- [`Content.vue`](https://github.com/duckness/wttg2key/blob/11ba45a0395b8889843a24dbb46cd62bc95ad5e0/src/components/Content.vue#L67-L79) sekiz parçanın her biri 12 karakterse bunları sırayla birleştirir.

Dolayısıyla bu repo WTTG3 için 8-hex'ten 4-hex'e dönüşüm algoritması vermiyor.

## Ürün kararı

1. Normal “Eşleşenleri çöz” butonu bilinen run/save/organizer çiftleri için anlık lookup yapar.
2. “Save'siz GPU ile çöz” butonu yeni run için indeks 1 ve 2 başta olmak üzere girilen hashleri kullanır, 2^32 UCRT state'ini tarar ve sekiz parçayı üretir.
3. WebGPU desteği olmayan kullanıcılar için save import kesin fallback olarak kalır.
4. Çözüm sonucu organizer'a yerel olarak kaydedilir; dosya veya hashler bir sunucuya gönderilmez.
5. Topluluk eşleşme veritabanı yalnız daha önce görülmüş tam run'ları hızlandırır; genel save'siz çözümü sağlayan kısım PRNG-state taramasıdır.

## Yerel kaynaklar ve tekrar üretilebilirlik

- `hashler/save-reader-core.js`: mevcut save parser ve alan doğrulaması.
- `hashler/gpu-hash-solver.js`: UCRT simülasyonu, MD5 prefix ve 2^32 WebGPU state taraması.
- `WTTG3-Save-Editor/docs/SAVE_FORMAT.md`: `Keys` yapısının save formatı.
- `hashler/docs/hash-decryptor-and-save-import-research.md`: save tabanlı gerçek run eşleşmeleri.
- `hashler/docs/key-organizer-research.md`: WTTG2/WTTG3 veri modeli karşılaştırması.
- `_TurkceYama_Calisma/QA/hash_decrypt_research_tools.tmp/dump-functions.cjs`: RVA tabanlı disassembly aracı.
- `_TurkceYama_Calisma/QA/hash_decrypt_research_tools.tmp/find-xrefs.cjs`: IAT/xref tarama aracı.
- `C:/Program Files (x86)/Windows Kits/10/Source/10.0.26100.0/ucrt/stdlib/rand.cpp`: kurulu Microsoft UCRT `rand`/`srand` kaynağı.

### Sınır

Bu rapor belirtilen EXE SHA-256'sı için geçerlidir. Oyun güncellenirse RVA'lar ve hatta üretim mantığı yeniden doğrulanmalıdır.
