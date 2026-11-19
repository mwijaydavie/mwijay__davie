function latestRequest(lookup, paint) {
  let latest = 0;
  async function run(query) {
    const id = ++latest;
    paint({ query, status: 'loading', rows: [] });
    let rows;
    try {
      rows = await lookup(query);
    } catch {
      if (id !== latest) return;
      paint({ query, status: 'error', rows: [] });
      return;
    }
    if (id !== latest) return;
    paint({ query, status: 'ready', rows });
  }
  function clear() {
    ++latest;
    paint({ query: '', status: 'idle', rows: [] });
  }
  return { run, clear };
}

// Local simulation: no fetch, timer or API key.
const jobs = [];
let view;
const ui = latestRequest(
  () => new Promise((ok, fail) => {
    jobs.push({ ok, fail });
  }),
  state => { view = state; },
);
const a = ui.run('pilau'); // request #1
const b = ui.run('chai');  // request #2
jobs[1].ok(['Chai']);
await b;
if (process.argv.includes('--old-error')) {
  jobs[0].fail(new Error('Demo failure'));
} else {
  jobs[0].ok(['Pilau']);
}
await a;
console.log(view.query, view.rows[0], view.status);
