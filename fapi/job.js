// job.js
const fs = require('fs');

const G = require("./global");

class Job {
    constructor(res, job_id, job_dir, file_path) {
        this.res = res;
        this.id = job_id;
        this.job_dir = job_dir;
        this.file_path = file_path;
        this.file_ids = new Set();
        this.logs = {}
    }

    fileNew(id) {
        this.file_ids.add(id);
    }

    fileStateRemove(id) {
        this.file_ids.delete(id);
    }

    haveActiveFiles() {
        return this.file_ids.size > 0;
    }

    /**
     * Delete the job's directory.
     */
    delete() {
        console.log(`JS: ${this.id} - deleting ${this.job_dir}`);
        fs.rmSync(this.job_dir, { recursive: true, force: true });

        // Remove the stream, else we leak memory!
        zeek.invoke('Input::remove', [this.id]);
    }

    /**
     * Submit this job to Zeek, or queue it.
     */
    submit() {
        // Is there a job in flight?
        if (G.job != null) {
            console.log("queue it!");
            G.job_queue.push(this);
            return;
        }

        // Keep a global reference to the job.
        G.job = this;

        // Invoke Zeek processing
        zeek.invoke('Input::add_analysis', [{
            source: this.file_path,
            name: this.id,
        }]);
    }

    /**
     * Record a log entry for the given stream.
     *
     * @param {string} stream
     * @param {object} entry
     */
    addLog(stream, entry) {
        let ll = this.logs[stream] || [];
        this.logs[stream] = ll;
        ll.push(entry);
    }

    respond() {
        this.res.status(200).json({ logs: this.logs });
    }
}

exports.Job = Job;
