A a static website as a lightweight file server for downloading/uploading files. On the server side, all you need is an nginx executable file. On the client side (mobile or desktop), any brower will work.

## Features
* File list: support sorting by name/date.
* Download files.
* Upload files: support uploading multiple files, selecting destination and creating arbitrary subfolders. Only `tmp` (and its subfolders) are writable. Change the config file if you want.
* Delete files/folders. Only the subfiles/subfolders of `tmp` can be deleted. Change the config file if you want.
* Read/write text messages.
* Support file names with special characters (`" ' ? * <> \ @ & :` ...).

## Set up

### Download this repository:
```
git clone https://github.com/liuqx0717/nginx-file-server.git
```

### If you want to use a standalone nginx executable:
1. Get the nginx executable:
    * (For Windows) Download nginx from [official website](http://nginx.org/en/download.html) and extract the executable file `nginx.exe` into this repository. Only `nginx.exe` is needed.
    * (For Unix-like systems) compile nginx source, and copy the nginx executable into this repository. Only one executable file `nginx` is needed.

2. Prepare the nginx config file: copy `nginx-standalone-example.conf` to `nginx.conf`. Make some modification in `nginx.conf` if you want.

3. Run nginx:
    * (For Windows) `cd` into this repository and run `nginx.exe -p . -c nginx.conf`. Press `Ctrl-C` to stop.
    * (For Unix-like systems) `cd` into this repository and run `./nginx -p . -c nginx.conf`. Run `./nginx -c nginx.conf -s quit` to stop. Note that root privilege is required to listen on port `80`. Change the port in `nginx.conf` to something above `1024` if you don't want to use `sudo`.

### If you want to use the nginx from your distro:

1. Prepare the nginx config file: open `nginx-distro-example.conf`, and edit `/etc/nginx/nginx.conf` manually. **DON'T** replace `/etc/nginx/nginx.conf` with this file directly.

2. The nginx from your distro may run under a different user (e.g. `nginx` user). Make sure it has **read** access to this repository, and **read/write** access to `tmp` folder. `sudo chown nginx:nginx ./tmp`

3. If your system has SELinux enabled, you need to set `allow_httpd_anon_write` boolean to `on`, tag this repository to `public_content_t`, and tag `tmp` folder to `public_content_rw_t`:
```
# Set the boolean
sudo setsebool -P allow_httpd_anon_write on

# Add a permanent rule
sudo semanage fcontext -a -t public_content_t '/absolute/path/to/this/repository(/.*)?'

# Add a permanent rule
sudo semanage fcontext -a -t public_content_rw_t '/absolute/path/to/this/repository/tmp(/.*)?'

# Note: Use -d in place of -a to delete the permanent rules you added

# Apply the SELinux rules
sudo restorecon -Rv path/to/this/repository
```

4. Start nginx: `sudo systemctl start nginx`.