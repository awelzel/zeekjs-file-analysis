"use strict";
const job = require("./job");

/**
 * Store the job's ID on the Files::Info record.
 */
zeek.on("file_new", (f) => {
  let j = job.getCurrent();
  console.log(`JS: ${j.id} file_new ${f.id} ${f.source}`);

  f.info.job_id = j.id;

  if (f.source == j.id) f.info.filename = j.file_name;
});

zeek.on("file_new", (f) => {
  // Always add the SHA1 and SHA256 analyzers
  zeek.invoke("Files::add_analyzer", [f, "Files::ANALYZER_SHA1"]);
  zeek.invoke("Files::add_analyzer", [f, "Files::ANALYZER_SHA256"]);

  job.getCurrent().fileNew(f.id);
});

zeek.on("file_state_remove", (f) => {
  job.getCurrent().fileStateRemove(f.id);
});

/**
 * Hook the global log policy hook to store log created for the file.
 */
zeek.hook("Log::log_stream_policy", (rec, log_id) => {
  let j = job.getCurrent();
  // Ignore logs outside of file processing
  if (!j) return;

  let entry = zeek.flatten(zeek.select_fields(rec, zeek.ATTR_LOG));
  j.addLog(log_id, entry);

  return false;
});

/**
 * Check if the Job has any files left and if not respond
 * to the pending HTTP request.
 */
zeek.on("file_state_remove", { priority: -2000 }, (f) => {
  let j = job.getCurrent();
  console.log(`JS: ${j.id} file_state_remove ${f.id} ${f.source}`);

  if (j.hasActiveFiles()) return;

  j.res.status(200).json({
    job_id: j.id,
    logs: j.logs,
  });

  job.deleteJob(j);
  job.nextJob();
});
