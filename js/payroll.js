// Payroll table — click a column heading to sort it.
// The table ships fully rendered in payroll.html, so with JavaScript off it
// still reads top to bottom by 2025 pay. Each cell carries its raw value in
// data-v; blank values (the "—" cells) always sort to the bottom.

(function () {
  var table = document.getElementById('pay-table');
  if (!table) return;

  var headers = table.querySelectorAll('thead th');
  var tbody = table.tBodies[0];

  function sortBy(index, type, dir) {
    var rows = Array.prototype.slice.call(tbody.rows);
    rows.sort(function (a, b) {
      var x = a.cells[index].getAttribute('data-v');
      var y = b.cells[index].getAttribute('data-v');
      if (x === '' && y === '') return 0;
      if (x === '') return 1;
      if (y === '') return -1;
      var cmp = type === 'num' ? parseFloat(x) - parseFloat(y) : x.localeCompare(y);
      return dir === 'ascending' ? cmp : -cmp;
    });
    rows.forEach(function (row) { tbody.appendChild(row); });
  }

  Array.prototype.forEach.call(headers, function (th, index) {
    var button = th.querySelector('button');
    if (!button) return;
    button.addEventListener('click', function () {
      var type = th.getAttribute('data-type');
      // Numbers start high-to-low (biggest raise first); text starts A–Z.
      var current = th.getAttribute('aria-sort');
      var dir = current
        ? (current === 'ascending' ? 'descending' : 'ascending')
        : (type === 'num' ? 'descending' : 'ascending');
      Array.prototype.forEach.call(headers, function (h) { h.removeAttribute('aria-sort'); });
      th.setAttribute('aria-sort', dir);
      sortBy(index, type, dir);
    });
  });
})();
