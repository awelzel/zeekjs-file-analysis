## File analysis API
module FAPI;

export {
	const listen_host: string = "127.0.0.1";
	const listen_port: port = 1234/tcp;
	const work_dir: string = "./work";

	type Job: record {
		job_uuid: string;
		job_dir: string;
		file_path: string;
	};

	global process_file: hook(j: Job);

	# Keeping track of the active jobs.
	global jobs: table[string] of Job;
}

redef record Files::Info += {
	job: Job &optional;
};

hook FAPI::process_file(job: Job) {
	print fmt("ZEEK: Got %s", job$job_uuid);
	jobs[job$job_uuid] = job;
	Input::add_analysis([$source=job$file_path, $name=job$job_uuid]);
}

event file_new(f: fa_file) {
	# Always SHA1 and SHA256.
	Files::add_analyzer(f, Files::ANALYZER_SHA1);
	Files::add_analyzer(f, Files::ANALYZER_SHA256);

	# This seems to work because $source is
	# set to job_uuid based on the file_path?
	f$info$job = jobs[f$source];
}

event file_state_remove(f: fa_file) {
	delete jobs[f$source];
}

@load ./api.js
