# WTTG III Hash Atlası

Bu klasör, kurulu oyunun `WTTGSD/Content/RawFiles/WebSites` verilerinden
üretilmiş yerel bir hash konumu rehberidir.

## Kullanım

1. `baslat.bat` dosyasına çift tıkla.
2. Açılan komut penceresini siteyi kullanırken kapatma.
3. Sitede bir sayfaya basarak oyunun gerçek sayfasını işaretlenmiş biçimde aç.

Ana sayfa doğrudan `index.html` ile de açılır; fakat tüm oyun görsellerinin ve
fontlarının sorunsuz yüklenmesi için `baslat.bat` önerilir.

## İşaretler

- `P` (`PTAG`): Hash metninin doğrudan yerleştirilebileceği konum.
- `C` (`CPTAG`): Hash veren doğru tıklama adayı.
- `F` (`CFTAG`): Aynı imleç ipucunu taklit edebilen sahte/tuzak aday.

Bir koşuda bu adayların tamamı aktif olmaz. Oyun uygun site ve sayfayı seçtikten
sonra ilgili sınıflardan rastgele bir konum kullanır.

## Veriyi yeniden üretme

Oyun güncellendikten sonra bu klasörde:

```powershell
node .\tools\generate.mjs
```

komutunu çalıştır. `data.js` ve `previews/` klasörü güncel oyun dosyalarından
yeniden oluşturulur.

Ardından bütünlük kontrolü için:

```powershell
node .\tools\verify.mjs
```
