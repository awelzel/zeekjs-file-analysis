// FAPI JS side
const http = require('http');
const fs = require('fs');
const crypto = require("crypto");

const host = zeek.global_vars["FAPI::listen_host"];
const port = zeek.global_vars["FAPI::listen_port"].port;
const work_dir = zeek.global_vars["FAPI::work_dir"];

if (!fs.existsSync(work_dir)) {
  fs.mkdirSync(work_dir);
}

// Request listener slurping the body of a POST
// as file, storing it in a job folder and starting
// Zeek side analysis via FAPI::process_file()
//
// You want to do multipart or JSON/base64 for further
// configurability around which analyzers to attach etc.
const requestListener = function (req, res) {
  if ( req.method != 'POST') {
    res.writeHead(400);
    res.end();
    return;
  }

  let job_uuid = crypto.randomUUID();
  let job_dir = path = work_dir + "/" + job_uuid
  fs.mkdirSync(job_dir);
  let file_path = job_dir + "/file";

  // Should probably stream to disk directly instead.
  var buf = '';
  req.on('data', (data) => {
    buf += data;
  });

  req.on('end', () => {
    fs.writeFile(file_path, buf, (err) => {
      if (err) {
        console.error(err);
        res.writeHead(200);
        res.end(err);
      } else {
        let job = {
          job_uuid: job_uuid,
          job_dir: job_dir,
          file_path: file_path,
          size: buf.length,
        };

        // Trigger Zeek processing.
        zeek.invoke('FAPI::process_file', [job]);

        // Could make this async and wait before replying
        // only after file_state_remove ran for the uuid
        // and respond with f$info as json form.
        res.writeHead(200);
        res.end(JSON.stringify(job));
      }
    });
  });
}

zeek.on('file_state_remove', {priority: -1000}, (f) => {
  let job_dir = f.info.job.job_dir;
  console.log(`JS: ${f.source} - deleting ${job_dir}`);
  fs.rmSync(job_dir, { recursive: true, force: true });
});


const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
