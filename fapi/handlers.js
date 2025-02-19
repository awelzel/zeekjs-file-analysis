"use strict"
const G = require("./global");

zeek.on('file_new', (f) => {
  console.log("JS:", G.job.id, "file_new", G.job.id, "file.id", f.id);

  G.job.fileNew(f.id);

  // Always add the SHA1 analyzer
  zeek.invoke('Files::add_analyzer', [f, "Files::ANALYZER_SHA1"]);
});

zeek.on('file_state_remove', (f) => {
  G.job.fileStateRemove(f.id);
});

zeek.on('file_state_remove', { priority: -2000 }, (f) => {
  console.log("JS:", G.job.id, "file_state_remove", f.id, f.source, "len", G.job_queue.length, "file_ids",
    G.job.file_ids.size);

  if (G.job.haveActiveFiles())
    return;

  G.job.respond();
  G.job.delete();
  G.job = null;

  if (G.job_queue.length > 0) {
    console.log("next job!")
    let j = G.job_queue.pop();
    j.submit();
  }
});

/**
 * Hook the global log policy hook to store log created for the file.
 */
zeek.hook('Log::log_stream_policy', (rec, log_id) => {
  if (!G.job) // Ignore logs outside of file processing
    return;

  let entry = zeek.flatten(zeek.select_fields(rec, zeek.ATTR_LOG));
  G.job.addLog(log_id, entry);
});
