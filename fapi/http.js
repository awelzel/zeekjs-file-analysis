"use strict"

const fs = require('fs');
const express = require('express');
const fileUpload = require('express-fileupload');

const Job = require("./job").Job;

const app = express();
app.use(fileUpload());
app.set('view engine', 'pug')

// Render BigInt (count) types as strings in JSON.
BigInt.prototype.toJSON = function () {
    return this.toString();
}

const host = zeek.global_vars["FAPI::listen_host"];
const port = zeek.global_vars["FAPI::listen_port"].port;
const work_dir = zeek.global_vars["FAPI::work_dir"];

if (!fs.existsSync(work_dir)) {
    fs.mkdirSync(work_dir);
}

app.get("/", (req, res) => {
    res.render("index.pug", { version: zeek.invoke("zeek_version") });
});

app.post("/upload", (req, res) => {
    if (!req.files || !req.files.file)
        return res.status(400).json({ "error": "No file field in request" });

    let job_id = zeek.invoke('unique_id', ["J"]);
    let job_dir = work_dir + "/" + job_id
    let file_path = job_dir + "/file";

    fs.mkdirSync(job_dir);

    req.files.file.mv(file_path, (err) => {
        if (err)
            return res.status(500).json({ "error": "Failed to store file" });

        let job = new Job(res, job_id, job_dir, file_path);

        job.submit();
        return;
    });
});

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
