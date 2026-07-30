# WTTG3 Key Organizer Araştırması

Tarih: 2026-07-30

## Sonuç

`duckness/wttg2key` içindeki fikir WTTG3'e taşınabilir, fakat veri biçimi ve “tamamlandı” hesabı aynı değildir.

- WTTG2 aracı sekiz adet 12 karakterlik düz anahtar parçasını toplar ve doğrudan birleştirir.
- WTTG3'te sitede bulunan şey düz anahtar değil, `indeks - 8 haneli hash` biçimindeki şifreli girdidir.
- Hash'i tarayıcıda çözen doğrulanmış bir algoritma bulunmadı. Oyunun kendi akışında hash ve indeks ACRS içindeki uygun Key Decryptor ajanına gönderilir, ücret ödenir ve ajan 4 haneli çözülmüş parçayı verir.
- WTTG3'ün nihai `WinURL` değeri, indeks 1'den 8'e kadar sekiz adet 4 haneli çözülmüş parçanın sıralı birleşimidir; toplam 32 hex karakterdir.

Bu nedenle yapılacak özellik bir “decryptor” değil, **sekiz indeksli hash + çözülmüş parça düzenleyicisi** olmalıdır.

## Kaynaklar ve inceleme yöntemi

### WTTG2

İncelenen depo [duckness/wttg2key](https://github.com/duckness/wttg2key), sabit commit:
[11ba45a0395b8889843a24dbb46cd62bc95ad5e0](https://github.com/duckness/wttg2key/commit/11ba45a0395b8889843a24dbb46cd62bc95ad5e0) (`Initial commit`, 2018-04-18).
Depoda yalnızca bu commit vardır; README davranışı tarif etmediği için gerçek davranış kaynak kodundan çıkarılmıştır.

Başlıca dosyalar:

- [`Content.vue`](https://github.com/duckness/wttg2key/blob/11ba45a0395b8889843a24dbb46cd62bc95ad5e0/src/components/Content.vue)
- [`InputField.vue`](https://github.com/duckness/wttg2key/blob/11ba45a0395b8889843a24dbb46cd62bc95ad5e0/src/components/InputField.vue)
- [`App.vue`](https://github.com/duckness/wttg2key/blob/11ba45a0395b8889843a24dbb46cd62bc95ad5e0/src/App.vue)
- [`package.json`](https://github.com/duckness/wttg2key/blob/11ba45a0395b8889843a24dbb46cd62bc95ad5e0/package.json)

### WTTG3

Orijinal İngilizce temel oyun kanıtı şu yerel IoStore dosyalarından çıkarıldı:

- `G:\SteamLibrary\steamapps\common\Welcome to the Game III\WTTGSD\Content\Paks\WTTGSD-Windows.utoc`
- `G:\SteamLibrary\steamapps\common\Welcome to the Game III\WTTGSD\Content\Paks\WTTGSD-Windows.ucas`
- `G:\SteamLibrary\steamapps\common\Welcome to the Game III\WTTGSD\Content\Paks\WTTGSD-Windows.pak`
- `G:\SteamLibrary\steamapps\common\Welcome to the Game III\WTTGSD\Binaries\Win64\WTTGSD-Win64-Shipping.exe`

Türkçe yama katmanı incelemeye katılmadı. Temel container, yerel `retoc` aracıyla legacy pakete dönüştürülüp ilgili Unreal assetlerinin İngilizce stringleri okundu. Önemli container üyeleri:

- `/Game/UI/Widgets/Computer/Tutorial/KeyFinding/WBP_KeyFindingSlide3`
- `/Game/UI/Widgets/Computer/Tutorial/KeyFinding/WBP_KeyFindingSlide4`
- `/Game/UI/Widgets/Computer/Tutorial/KeyFinding/WBP_KeyFindingSlide5`
- `/Game/UI/Widgets/Computer/Tutorial/KeyFinding/WBP_KeyFindingSlide6`
- `/Game/UI/Widgets/Computer/Tutorial/KeyFinding/WBP_KeyFindingSlide7`
- `/Game/Data/DataAssets/Agents/KeyDecryptors/Dialog/Ping/*`
- `/Game/Data/DataAssets/Agents/KeyDecryptors/Dialog/HaveKey/*`
- `/Game/Data/DataAssets/Agents/KeyDecryptors/Dialog/DecryptingKey/*`
- `/Game/Data/DataAssets/Agents/KeyDecryptors/Dialog/DeliverKey/*`
- `/Game/Data/DataAssets/Agents/KeyDecryptors/Dialog/ErrorInvalidIndex/*`
- `/Game/Data/DataAssets/Agents/KeyDecryptors/Dialog/ErrorInvalidHash/*`
- `/Game/Data/DataAssets/Agents/KeyDecryptors/Dialog/ErrorNoHashFound/*`

İki farklı yerel kayıt da incelendi:

1. `G:\SteamLibrary\steamapps\common\Welcome to the Game III\_TurkceYama_Calisma\QA\save_site_audit_20260729_001\input\WTTGSD\Saved\SaveGames\WTTGSD_SaveGame.sav`  
   Boyut: `731969`; SHA-256: `B664407490D6D6BA3D0273EB0AAB6B9E5B15C20FD63DD4A3242ED0B507B872A8`
2. `G:\SteamLibrary\steamapps\common\Welcome to the Game III\_TurkceYama_Calisma\QA\save_site_audit_20260729_001\input\WTTGSD\SaveGames\WTTGSD_SaveGame.sav`  
   Boyut: `646195`; SHA-256: `E76E4A994E07C63C060B4636386802EFA7A8B9897AF29EA3CC6B102C4DDCC343`

Kayıtların GVAS özellikleri yerel parser ile okundu. Biçim açıklaması:
`G:\SteamLibrary\steamapps\common\Welcome to the Game III\WTTG3-Save-Editor\docs\SAVE_FORMAT.md`.

Ronald'ın özgün İngilizce yönergesini taşıyan yerel kaynakta da nihai anahtarın her çözülmüş parçanın indeks sırasına konup tek parça halinde birleştirilmesi açıkça yazılıdır:
`G:\SteamLibrary\steamapps\common\Welcome to the Game III\_TurkceYama_Calisma\Scripts\port_ronald_4am_dialog_24359942.js:41`.

## WTTG2 aracının tam davranışı

### Girdi

Arayüz sabit sekiz satır açar. Her satır:

- serbest metin alanı,
- Wiki 1/2/3 radyo seçimi,
- doğrulama mesajı içerir.

Tam anahtar arama regex'i:

```js
/(?:\s|^)([\da-f]{12})(?![\w\d])/g
```

Bunun sonucu:

- Yalnızca 12 adet küçük harfli hex karakter (`0-9`, `a-f`) geçerlidir.
- Anahtar metnin başında ya da bir whitespace sonrasında olmalıdır.
- Büyük `A-F` kabul edilmez.
- Metinde bir eşleşme varsa alınır; birden fazla varsa hata verilir.
- Hiç tam eşleşme yoksa 9-11 karakterlik kısmi eşleşme aranıp eksik karakter sayısı gösterilir.
- Boş alanın durumu `Awaiting input.` mesajıdır.

Kaynak: [`InputField.vue`, satır 45 ve 68-102](https://github.com/duckness/wttg2key/blob/11ba45a0395b8889843a24dbb46cd62bc95ad5e0/src/components/InputField.vue#L45-L102).

### Wiki gruplaması

Araç Wiki 1, 2 ve 3'e atanmış anahtarları sayar. Herhangi bir grubun sayısı 3'ü geçince o sayaç kırmızı/kalın olur. Bu yalnızca görsel uyarıdır; final çıktıyı engellemez.

Kaynak: [`Content.vue`, satır 47-70](https://github.com/duckness/wttg2key/blob/11ba45a0395b8889843a24dbb46cd62bc95ad5e0/src/components/Content.vue#L47-L70).

### “Çözülmüş” anlamı

Sekiz satırın her birinde tam 12 karakter varsa araç parçaları satır sırasıyla birleştirir:

```js
final = key1 + key2 + key3 + key4 + key5 + key6 + key7 + key8
```

Çıktı 96 karakterdir. Kriptografik çözme, yeniden sıralama veya Wiki seçimine bağlı hesap yapılmaz.

Kaynak: [`Content.vue`, satır 72-82](https://github.com/duckness/wttg2key/blob/11ba45a0395b8889843a24dbb46cd62bc95ad5e0/src/components/Content.vue#L72-L82).

## WTTG3'te doğrulanan akış

### 1. Sekiz anahtar vardır

Temel oyun tutorial Slide 3 oyuncunun hedefini sekiz key'i bulmak olarak tanımlar. Slide 4-6 üç saklama biçimini anlatır: sayfada görünür metin, tıklanan element/dosya ve kaynak kod.

### 2. Bulunan veri indeksli 8 haneli hash'tir

Slide 3'ün örneği ve Slide 7'nin yönergesi:

```text
1 - 2bfc88a4
```

Slide 7, hem indeksin hem hash'in kopyalanması gerektiğini söyler. Kayıt içindeki key struct da bu modeli `FoundKeyString`, `KeyIndex` ve `bIsDecrypted` alanlarıyla temsil eder.

Dolayısıyla WTTG3 için canonical şifreli girdi:

```text
[1-8] - [8 hex karakter]
```

### 3. Decryption oyun içindeki ajan akışıdır

Key Decryptor `Ping` diyalogları indeks ve hash'in aynı mesajda gönderilmesini ister. Akış assetleri şu durumları ayırır:

1. tam indeks + hash al,
2. ajanın bu indeksi destekleyip desteklemediğini doğrula,
3. DOS Coin fiyatı bildir,
4. ödemeyi doğrula,
5. `Decrypted key: [KEY]` biçiminde çözülmüş parçayı teslim et.

`ErrorInvalidIndex`, `ErrorInvalidHash` ve `ErrorNoHashFound` dalları bunun yalnızca metin biçimi kontrolü olmadığını; uygun ajan, geçerli hash ve oyun durumunun gerektiğini gösterir. Profil metinleri de fiyatın encryption strength'e bağlı olduğunu belirtir.

Executable string/simge kanıtı aynı modeli destekler:

- `UKeyManager`, `NumberOfKeys`, `EncryptedKeys`, `DecryptedKeys`, `WinURL`
- `SupportedKeyIndexes`, `RequestedKeyIndex`, `CurrentKeyBeingDecrypted`
- `Agents_BuildKeyDecryptors`, `Agents_NumOfKeyDecryptors`
- `Agents_DecryptCostIndexToBasePrice`, `Agents_KeyDecryptorPool`

İncelenen bir kayıtta seçilmiş ajanların `SavedAgent.KeyIndexes` değerleri indeks çiftlerine ayrılmıştır; ancak ajan isimleri ve atamaları kayıt durumudur. Site ajan adı → indeks eşlemesi hardcode etmemelidir.

### 4. Çözülmüş parça 4, final değer 32 karakterdir

Birinci kayıt:

```text
EncryptedKeys:
1ef9d5b6, 2f45095a, b2a23ff2, ac4742d5,
969a03ed, 5dd6f03c, bbd6e8c6, e01fdd64

DecryptedKeys:
36ea, 84be, ff6b, 7b6b, 286d, 052b, 741f, f735

WinURL:
36ea84beff6b7b6b286d052b741ff735
```

İkinci kayıt:

```text
EncryptedKeys:
33044ba5, 605349d8, 984b8bf2, 4f12d709,
aca5a6a8, c097dbaf, a24dcae5, 726e44cd

DecryptedKeys:
e09c, d6bb, 2887, 18f2, c635, 5716, 2d49, c48d

WinURL:
e09cd6bb288718f2c63557162d49c48d
```

Her iki kayıtta da:

```text
WinURL === DecryptedKeys[0] + ... + DecryptedKeys[7]
```

İki kayıt arasındaki hash ve çözülmüş değerlerin tamamen değişmesi bunların sabit oyun listesi olmadığını, kayıt/run bazında üretildiğini gösterir. Örnek değerler siteye varsayılan veri olarak konmamalıdır.

### 5. Wiki grupları yardımcı bilgidir

Tutorial key'lerin farklı Wiki sayfalarındaki sitelere yayıldığını söyler. Executable'da ikinci ve üçüncü Wiki kilitlerinin açılmasına ilişkin özellikler vardır. İncelenen kayıtlardan birinde sekiz key üç Wiki'ye `3 / 2 / 3` dağılmıştır.

WTTG2'deki Wiki 1/2/3 seçimi bu nedenle iyi bir organizasyon özelliğidir. Ancak elimizdeki kanıt “her run'da bir Wiki kesinlikle en fazla 3 key içerir” kuralını evrensel biçimde ispatlamaz. `> 3` durumu hata değil, en fazla uyarı olmalıdır.

## Karşılaştırma

| Konu | WTTG2 aracı | WTTG3 için doğru model |
|---|---|---|
| Slot sayısı | 8 | 8 |
| Sitede bulunan parça | 12 küçük-hex karakter | `indeks - 8 hex hash` |
| İndeks | Satır konumundan | Metnin açık parçası, 1-8 |
| Çözme | Yok; girilenler zaten final parça | ACRS Key Decryptor ajanı + ödeme |
| Çözülmüş parça | 12 karakter | 4 hex karakter |
| Final | 8 × 12 = 96 karakter | 8 × 4 = 32 karakter `WinURL` |
| Wiki | 1/2/3, >3 uyarısı | 1/2/3 yardımcı gruplama; >3 yalnızca uyarı |
| Run'a bağlı veri | Araçta sabit key yok | Hash, decrypted değer ve ajan eşlemesi hardcode edilemez |

## Site için önerilen uygulama sözleşmesi

### Veri modeli

Sekiz slot sabit olarak oluşturulmalı:

```js
{
  index: 1,          // 1..8
  hash: "",          // normalize edilmiş 8 küçük-hex
  decrypted: "",     // normalize edilmiş 4 küçük-hex
  wiki: null,        // null | 1 | 2 | 3
  agentNote: ""      // isteğe bağlı, doğrulama mantığına girmez
}
```

`index` kullanıcı tarafından yeniden sıralanabilir bir liste konumu değil, oyunun key indeksidir.

### Parser

Toplu veya tam satır yapıştırma:

```js
const indexedHashPattern = /\b([1-8])\s*-\s*([0-9a-f]{8})\b/gi;
```

Belirli indeks satırındaki yalın hash:

```js
const bareHashPattern = /^\s*([0-9a-f]{8})\s*$/i;
```

Yalın çözülmüş parça:

```js
const bareDecryptedPattern = /^\s*([0-9a-f]{4})\s*$/i;
```

Ajan yanıtından çözülmüş parça:

```js
const agentReplyPattern = /decrypted\s+key\s*:\s*([0-9a-f]{4})\b/i;
```

Kabul edilen girdi küçük harfe normalize edilmelidir. Oyundaki gerçek örnekler küçük harftir; büyük harfi kabul etmek kullanıcı dostu normalizasyondur, oyun mekaniği iddiası değildir.

Toplu yapıştırmada:

- birden fazla farklı indeks tek seferde yerleştirilebilir;
- aynı indeks + aynı hash tekrarında sessiz dedupe yapılabilir;
- aynı indeks + farklı hash çatışmasında mevcut veri otomatik ezilmemeli, kullanıcıya seçim sunulmalıdır;
- indeks dışındaki 0/9 ve 8'den kısa/uzun hash reddedilmelidir.

### İlerleme ve final hesabı

İki ayrı ilerleme gösterilmelidir:

- `Bulunan hash: x / 8`
- `Çözülen key: y / 8`

Bir slotun durumları:

1. boş,
2. hash bulundu,
3. çözülmüş parça girildi.

Final yalnızca sekiz slotun tümünde geçerli 4 haneli `decrypted` değeri varsa üretilmelidir:

```js
const winURL = slots
  .slice()
  .sort((a, b) => a.index - b.index)
  .map((slot) => slot.decrypted)
  .join("");
```

Başarı koşulu `winURL.length === 32` ve `/^[0-9a-f]{32}$/` olmalıdır. “Solved/Çözüldü” ifadesi ancak bu aşamada kullanılmalıdır.

### UX

Minimal entegrasyon için:

- Sekiz kompakt indeks satırı.
- Her satırda hash, decrypted key ve isteğe bağlı Wiki 1/2/3 seçimi.
- Hash yanında canonical metni kopyalama: `n - hash`.
- Final hazır olduğunda 32 haneli `WinURL` için kopyala düğmesi.
- İsteğe bağlı ajan notu; ajan eşlemesi otomatik tahmin edilmemeli.
- Yerel tarayıcı saklama (`localStorage`) ve açık onaylı “Tümünü temizle”.
- Mevcut sitenin TR/EN sözlüğüne bağlı etiketler; organizer kendi başına ikinci bir dil algılama mekanizması kurmamalı.
- Karanlık tema ve mevcut minimalist görsel sistem kullanılmalı; WTTG2'nin eski Buefy/Bulma görünümü kopyalanmamalı.

Wiki sayaçları ayrı bir organizasyon yardımcısıdır. Wiki ataması eksik olsa bile doğru sekiz decrypted parça finali üretebilmelidir.

## Taşınmaması gereken davranışlar

1. **12 karakter validator:** WTTG3 formatı değildir.
2. **Sekiz hash'i doğrudan birleştirme:** WTTG3 `WinURL` üretmez.
3. **Tarayıcıda “decrypt” düğmesi:** Doğrulanmış formül/lookup yoktur; oyunun gerçek ajan ve ödeme akışını yanlış temsil eder.
4. **Örnek save hashlerini prefill etme:** Değerler run bazında değişir.
5. **Ajan isimlerini indekslere hardcode etme:** Atamalar kayıt durumudur.
6. **Wiki başına 3'ü kesin validation hatası yapmak:** Mevcut kanıt bunu evrensel kural olarak doğrulamaz.
7. **Wiki seçimini final için zorunlu yapmak:** WTTG2'de bile final hesabını etkilemez; WTTG3'te de yalnızca düzenleme bilgisidir.
8. **DOS Coin fiyatı hesaplamak:** Oyun durumu/encryption strength'e bağlıdır ve dış araçta güvenilir şekilde bilinmez.

## Kabul testleri

1. `1 - 2bfc88a4` indeks 1'e hash olarak yerleşir.
2. `1-2BFC88A4` kabul edilir ve `2bfc88a4` olarak normalize edilir.
3. Sekiz farklı indexed hash'in tek yapıştırmada doğru slotlara dağıtılması sağlanır.
4. `0 - 2bfc88a4`, `9 - 2bfc88a4`, 7 veya 9 haneli hash reddedilir.
5. Aynı indeks ve aynı hash yeniden yapıştırıldığında çoğaltılmaz.
6. Aynı indeks için farklı hash otomatik olarak mevcut değeri ezmez.
7. `Decrypted key: 36ea` ilgili slotta `36ea` olarak ayrıştırılır.
8. Dört haneli olmayan decrypted değer reddedilir.
9. Sekiz hash dolu, decrypted alanlar eksikken final gösterilmez.
10. Sekiz decrypted parça dolunca indeks 1→8 sırasıyla 32 haneli final oluşur.
11. Wiki seçimi boşken de sekiz decrypted parça final oluşturur.
12. Wiki sayısı 3'ü geçince yalnızca uyarı oluşur; veri/final engellenmez.
13. Yenileme sonrası yerel kayıt geri gelir.
14. “Tümünü temizle” kullanıcı onayı olmadan veri silmez.
15. TR/EN değişiminde veriler korunur, yalnızca etiketler değişir.

## Güven sınırı

Kesin doğrulananlar: sekiz indeks, 8 haneli encrypted hash, ajanla decryption, 4 haneli decrypted parça ve indeks sıralı 32 haneli `WinURL`.

Tek/az sayıda save gözlemine dayanan ve validation kuralı yapılmaması gerekenler: Wiki başına azami key sayısı, belirli ajanların desteklediği indeksler ve fiyatlar.

Bulunmayan kanıt: 8 haneli hash'i 4 haneli parçaya dışarıda çeviren güvenilir algoritma. Organizer bu işlevi varmış gibi sunmamalıdır.
