export const HitungSelisih = (tanggalPertama: any, tanggalKedua: any) => {
  // Buat objek Date untuk masing-masing tanggal
  var datePertama: any = new Date(tanggalPertama);
  var dateKedua: any = new Date(tanggalKedua);

  // Hitung selisih waktu (dalam milidetik)
  var selisihWaktu = Math.abs(dateKedua - datePertama);

  // Konversi selisih waktu ke dalam jam, menit, dan detik
  var selisihJam = Math.floor(selisihWaktu / (1000 * 60 * 60)); // Menit * Detik * Milidetik
  selisihWaktu %= 1000 * 60 * 60;

  var selisihMenit = Math.floor(selisihWaktu / (1000 * 60));
  selisihWaktu %= 1000 * 60;

  var selisihDetik = Math.floor(selisihWaktu / 1000);

  // Mengembalikan objek berisi selisih waktu
  return {
    jam: selisihJam,
    menit: selisihMenit,
    detik: selisihDetik,
  };
};
