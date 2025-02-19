## File analysis API
module FAPI;

export {
	const listen_host: string = "127.0.0.1" &redef;
	const listen_port: port = 1234/tcp &redef;
	const work_dir: string = "./fapi_workdir" &redef;
}

@load ./http.js
@load ./handlers.js
