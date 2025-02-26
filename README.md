# FAPI - File Analysis API

Provide an API hosted by Zeek for file analysis.

    $ npm install
    $ zeek fapi/api.zeek

You may also provide to http://localhost:1234 to get a very basic
interface.

In a separate terminal:

    $ curl -F  file=@test-files/putty.exe localhost:1234/upload | jq
    {
      "job_id": "JUEZz1FBUY16",
      "logs": {
        "PE::LOG": [
          {
            "ts": 1740559879.961207,
            "id": "FSV6b31E9xULHA9Amc",
            "machine": "AMD64",
            "compile_ts": 1732564691,
            "os": "Windows Vista or Server 2008",
            "subsystem": "WINDOWS_GUI",
            "is_exe": true,
            "is_64bit": true,
            "uses_aslr": true,
            "uses_dep": true,
            "uses_code_integrity": false,
            "uses_seh": true,
            "has_import_table": true,
            "has_export_table": false,
            "has_cert_table": true,
            "has_debug_data": false,
            "section_names": [
              ".text",
              ".rdata",
              ".data",
              ".pdata",
              ".00cfg",
              ".gxfg",
              ".tls",
              "_RDATA",
              ".rsrc",
              ".reloc"
            ]
          }
        ]
      ...
      }
    ...
    }
