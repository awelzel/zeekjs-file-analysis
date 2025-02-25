// job.js
const fs = require("fs");

class Job {
  constructor(res, job_id, job_dir, file_path, file_name) {
    this.res = res;
    this.id = job_id;
    this.job_dir = job_dir;
    this.file_path = file_path;
    this.file_name = file_name;
    this.file_ids = new Set();
    this.logs = {};
  }

  fileNew(id) {
    this.file_ids.add(id);
  }

  fileStateRemove(id) {
    this.file_ids.delete(id);
  }

  hasActiveFiles() {
    return this.file_ids.size > 0;
  }

  addLog(stream, entry) {
    let ll = this.logs[stream] || [];
    this.logs[stream] = ll;
    ll.push(entry);
  }
}

exports.Job = Job;

// managing jobs.
var job = null;
var job_queue = [];

exports.getCurrent = () => {
  return job;
};

/**
 * Schedule the job j for analysis, or queue it.
 */
exports.queueJob = (j) => {
  if (job != null) {
    job_queue.push(j);
    return false;
  }

  job = j;

  let analysis_desc = {
    source: j.file_path,
    name: j.id,
  };

  zeek.invoke("Input::add_analysis", [analysis_desc]);
  return true;
};

/**
 * Delete the directory for j and remove it from Zeek.
 */
exports.deleteJob = (j) => {
  console.log(`JS: ${j.id} - deleting ${j.job_dir}`);
  fs.rmSync(j.job_dir, { recursive: true, force: true });

  // Remove the input stream, else we leak FDs and memory.
  zeek.invoke("Input::remove", [j.id]);

  job = null;
};

exports.nextJob = () => {
  if (job_queue.length == 0) return false;

  let j = job_queue.pop();
  exports.queueJob(j);
  return true;
};
