function FilterKata(data: { kata: string; filter: any[] }) {
  // pecah string menjadi array of karakter
  let karakter = data.kata.split("");

  // filter karakter yang tidak diinginkan
  let karakterBaru = karakter.filter(function (huruf: string) {
    let check = data.filter.find(
      (item) => item.toLowerCase() === huruf.toLowerCase()
    );
    if (!check) {
      return huruf;
    }
  });

  // gabungkan karakter yang tersisa menjadi string baru
  let kataBaru = karakterBaru.join("");

  return kataBaru;
}

export default FilterKata;
