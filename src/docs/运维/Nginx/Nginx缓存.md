---
isOriginal: true
category: 
    - 运维
    - Nginx
tag: 
  - 缓存
  - 协商缓存
  - ETag
  - Expires
  - Cache-Control
  - max-age
  - Last-Modified
  - If-Modified-Since
  - If-None-Match
---

# Nginx 缓存

 私有缓存：只为单一用户存储，如个人浏览器的缓存；

共享缓存可为多个用户提供，如代理服务器的缓存

## 浏览器缓存

### 强缓存

通过HTTP响应头中的`Cache-Control`和`Expires`字段控制。当资源有效时，浏览器不会向服务器发送请求，直接从缓存中加载资源。

```
Cache-Control: public, max-age=3600  可以被公共缓存，并且在3600秒（1小时）内保持新鲜。
```

- `Expires`: 提供资源到期的日期/时间（s秒,m分,h时,d天），已被`Cache-Control max-age`指令所替代

- `Cache-Control`: 定义缓存策略，如`max-age`指定资源可缓存的最大时间。

  - **max-age=秒**: 资源在客户端缓存中可以保持新鲜的最大时间（以秒为单位）。过了这个时间，缓存的资源被认为是过时的。

  2. **no-cache**: 强制客户端每次请求时都向服务器验证资源的有效性。即使资源已缓存，也必须先进行确认它是否已更新。

  3. **no-store**: 禁止缓存。这通常用于包含敏感信息的响应，确保信息不会被存储在本地缓存中。

  4. **public**: 指示响应可以被任何缓存存储，即使是通常不缓存私有响应的共享缓存（如CDN、代理服务器的缓存）

  5. **private**: 响应只能为单个用户缓存，不能由共享缓存缓存。这通常用于个人化的响应。如个人浏览器的缓存

  6. **must-revalidate**: 一旦资源过期（例如，超过了`max-age`），缓存必须向服务器验证资源的有效性，不能使用过期的资源。

  7. **proxy-revalidate**: 类似于`must-revalidate`，但是它是专门为代理缓存设定的。

  8. **s-maxage=秒**: 类似于`max-age`，但仅适用于共享缓存（如代理服务器）。`s-maxage`的优先级高于`max-age`。

  9. **immutable**: 表示响应正文不会随时间而改变。一旦缓存，客户端就不应该发送有关该资源的条件请求

  10. **stale-while-revalidate=秒**: 在资源过期后的一段时间内，允许客户端在后台异步检查新版本，同时仍然提供旧版本的资源。

  - **stale-if-error=秒**: 如果在重新验证资源时服务器错误（如5xx错误），允许客户端在指定的时间内使用过期的缓存。

### 协商缓存

Validation Cache：当强缓存失效时，浏览器会向服务器发送请求，通过Last-Modified / If-Modified-Since或ETag/ If-None-Match 头部进行资源验证，如果服务器响应304（Not Modified），浏览器会从缓存中加载资源。

- `Last-Modified`/`If-Modified-Since`: 资源的最后修改时间 / 询问自提供日期以来是否资源已被修改。

  - 多级集群负载时last-modified必须保持一致

- `ETag`/`If-None-Match`: 资源的唯一标识符，用来检查资源是否已更改 / 询问资源的ETag是否已更改

  - Entity Tag 的缩写，中文译过来就是实体标签的意思.
  - HTTP中并没有指定如何生成ETag，哈希是比较理想的选择
  - 在计算Etag的时候，会产生CPU的耗费，所以也可以用时间戳，但这样直接使用Last-Modified即可。
  - 和last-modified很像，区别是last-modified精确到秒，ETag可以用hash算法来生成更精确的比对内容。
  - 当用户首次请求资源的时候返回给用户数据和200状态码并生成ETag，再次请求的时候服务器比对ETag，没有发生变化的话返回304
  - 异步加载的接口数据，可以使用ETag来校验。

- `Last-Modified` 和 SSI 可能会有冲突

  - 页面内容动态变化，但是文件时间戳却没有变，`Last-Modified` 仅代表静态部分的最后修改时间，而不考虑通过SSI插入的动态内容。如果客户端根据 `Last-Modified` 进行缓存，可能会缓存到包含过时动态内容的页面

  - **使用ETag**: ETag（Entity Tag）是另一个HTTP响应头，提供资源的一个唯一标识（通常是一个哈希值）。只要整个页面内容发生变化，ETag也会改变，这可以更精确地控制缓存。

  

> Cache-Control直接是通过不请求来实现，而ETag是会发请求的，只不过服务器根据请求的东西的内容有无变化来判断是否返回请求的资源

### 失效策略

**版本号 / 时间戳**

在请求合并文件的 URL 中添加一个查询参数，如版本号或时间戳，以表示文件的更新状态。当文件更新时，更新这个参数以确保 URL 的唯一性。

```html
<!-- 添加版本号作为查询参数 -->
<link rel="stylesheet" href="/concat?/css/file1.css,/css/file2.css,/css/file3.css?v=12345">
<script src="/concat?/js/script1.js,/js/script2.js,/js/script3.js?v=12345"></script>
```

每次文件更新，`v=12345` 需要更改为新的值，如 `v=12346`。

**文件指纹 / 内容哈希**

在文件名中添加一个基于文件内容的哈希值。这样，只有当文件内容改变时，文件名才会改变，从而触发新的下载。

```html
<!-- 文件名中包含内容哈希 -->
<link rel="stylesheet" href="/concat?/css/file1-abcdef.css,/css/file2-123456.css,/css/file3-abcd1234.css">
<script src="/concat?/js/script1-abcdef.js,/js/script2-123456.js,/js/script3-abcd1234.js"></script>
```

在构建流程中，每次文件更改后，都会生成新的文件名。

**自动化构建工具**（最方便）

使用工具如 Webpack、Gulp 或 Grunt，可以自动化处理版本控制。这些工具在构建过程中可以为资源文件添加版本号或哈希值，生成新的文件名，并自动更新引用这些资源的 HTML 文件。

**Cache-Control 头**

适当配置 HTTP `Cache-Control` 响应头，可以指示浏览器和代理服务器如何缓存资源。例如，设置 `must-revalidate` 可以要求浏览器在使用缓存的资源前先验证其有效性。

```nginx
location ~* \.(css|js)$ {
    expires 1y;
    add_header Cache-Control "public, must-revalidate, proxy-revalidate";
}
```

**ETag / Last-Modified 头**

`ETag` 和 `Last-Modified` 响应头可以用来验证资源是否已更改。当浏览器发送条件请求时，只有当资源发生变化，服务器才会发送新的资源，否则服务器会返回一个 `304 Not Modified` 状态码。

**策略组合**

通常，为了确保缓存控制的有效性，会将上述策略结合起来使用。例如，同时使用文件指纹和 Cache-Control 头，可以确保当内容更新时，用户能够接收到最新的资源，同时还能享受到当内容没有变化时的缓存优势

### 缓存原则

- 还有一些场景下我们希望禁用浏览器缓存。比如轮训api上报数据数据，3XX这类跳转的页面不需要缓存。

  ```nginx
  location / {
      ...
      # 禁用缓存的配置
      add_header Cache-Control "no-cache, no-store, must-revalidate";
      add_header Pragma "no-cache"; # 兼容 HTTP/1.0
      expires 0; # 设置内容过期时间为0
  }
  ```

- 在服务器添加Server头，有利于排查错误 `add_header Server "MyCustomServerName";`

  - 生产环境不要加
  - `server_tokens off; `# 关闭 Nginx 的服务器标识(版本号等)

- 分为手机APP和Client以及是否遵循http协议

- 在没有联网的状态下可以展示数据

- 流量消耗过多

- 提前下发  避免秒杀时同时下发数据造成流量短时间暴增

- 兜底数据 在服务器崩溃和网络不可用的时候展示

- 固定缓存  展示框架这种，可能很长时间不会更新，可用随客户端下发

  - **首页**有的时候可以看做是框架 应该禁用缓存，以保证加载的资源都是最新的

- 父子连接 页面跳转时有一部分内容不需要重新加载，可用从父菜单带过来

- 预加载     某些逻辑可用判定用户接下来的操作，那么可用异步加载那些资源

- 漂亮的加载过程 异步加载 先展示框架，然后异步加载内容，避免主线程阻塞

## Nginx缓存

### 核心模块

[ngx_http_core_module](https://nginx.org/en/docs/http/ngx_http_core_module.html)

> 先看看 sendfile 执行流程，使用 strace 命令跟踪
>
> > `strace` 跟踪系统调用和信号。
> >
> > - 当一个进程执行系统调用（如打开文件、读写数据、分配内存等）时，`strace` 可以捕获并记录下这些调用的详细信息，包括调用的名称、传递给它们的参数以及返回的结果。
> > - strace [options] [command] ，其中 `[options]` 是可选的参数，用于修改 `strace` 的行为，而 `[command]` 是要跟踪的程序。
> >   - 跟踪进程 -p 进程id，如 strace -p 1234
> >   - 跟踪系统调用 ，如 strace ls -l 跟踪ls -l
>
> ```sh
> ps aux | grep nginx			## 查询nginx的进程id，选worker那个
> strace -p <nginx_pid>		## 跟踪 nginx
> ```
>
> - 开始时，是阻塞的，正在等待事件的发生
>
>   - 8是 epoll 实例的文件描述符
>   - `epoll`是一个用于监视多个文件描述符（通常是套接字或其他文件描述符）上的事件（如可读、可写等）的高效机制
>
>   ```sh
>   epoll_wait(8, 
>   ```
>
> - 发送请求后
>
>   - 事件数组中就是事件对象，包含了事件类型、关联的文件描述符相关信息
>     - 事件类型：`EPOLLIN`表示可读事件、`EPOLLOUT`表示可写事件
>     - 关联的文件描述符相关信息，如 {u32=1904243152, u64=140709327827408}
>   - `=2`表示有两个事件被触发并返回
>
>   ```sh
>   ## 等待事件发生，其中文件描述符为8（可能是一个 epoll 实例）。这里有两个事件，都是 EPOLLIN（可读）事件。
>   epoll_wait(8, [{EPOLLIN, {u32=1904243152, u64=140709327827408}}, {EPOLLIN, {u32=1904242704, u64=140709327826960}}], 512, 25215) = 2
>   ## 从文件描述符为10的套接字中接收数据，读取了475字节的数据。
>   recvfrom(10, "GET / HTTP/1.1\r\nHost: 192.168.44"..., 1024, 0, NULL, NULL) = 475
>   ## 获取文件"/usr/local/nginx/html/index.html"的信息，包括文件类型、权限和大小
>   stat("/usr/local/nginx//html/index.html", {st_mode=S_IFREG|0644, st_size=1429, ...}) = 0
>   ## 以只读非阻塞模式打开文件"/usr/local/nginx/html/index.html"，返回一个文件描述符为11。
>   open("/usr/local/nginx//html/index.html", O_RDONLY|O_NONBLOCK) = 11
>   ## 获取文件描述符为11的文件信息，包括文件类型、权限和大小。
>   fstat(11, {st_mode=S_IFREG|0644, st_size=1429, ...}) = 0
>   ## 向文件描述符为10的套接字写入数据，发送HTTP响应给客户端。这里写入了263字节的数据
>   writev(10, [{iov_base="HTTP/1.1 200 OK\r\nServer: nginx/1"..., iov_len=263}], 1) = 263
>   ## 使用零拷贝技术，将文件描述符为11的文件内容发送给文件描述符为10的套接字，发送了1429字节的数据
>   sendfile(10, 11, [0] => [1429], 1429)   = 1429
>   ## 向文件描述符为4的文件写入数据，记录日志信息
>   write(4, "192.168.44.1 - - [27/May/2022:14"..., 193) = 193
>   ## 关闭文件描述符为11的文件
>   close(11)
>   ```

- **open_file_cache max=N [inactive=time];** 缓存打开文件的描述符、其大小和最后修改时间，以及查找文件的结果

  - `max=N`：这里的 `N` 表示缓存中最多可以存储的文件描述符数量。

  - `inactive=time`：在这段时间内文件没有被请求，那么文件描述符会从缓存中删除。

- **open_file_cache_min_uses**：被访问到多少次后会开始缓存

- **open_file_cache_valid**：间隔多长时间去检查文件是否有变化

- **open_file_cache_errors**：对错误信息是否缓存
  - `on` 表示开启错误信息缓存。
  - `off` 表示关闭错误信息缓存。

### 缓存模块

[ngx_http_proxy_module](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache)

- **proxy_cache_path** - 定义缓存的存储路径和参数。在http块中配置
  - levels：缓存的层次结构级别：从1到3，每个级别接受值1或2
  - use_temp_path=on|off
    - on：响应先放到 proxy_temp_path 指令配置的临时文件路径，然后重命名（默认）
    - off：直接放到缓存目录
  - keys_zone=name:size：共享内存，用来存储缓存键和元数据
  - inactive=time：指定的时间内未访问的缓存数据将删除，默认10min
  - max_size: 设置缓存目录可以使用的最大磁盘空间
  - min_free: 设置保留在存储介质上的最小自由空间量

- **proxy_cache** - 指定使用哪个缓存区域。与proxy_cache_path中的keys_zone保持一致

- **proxy_cache_key** - 定义如何创建缓存键，该键是用于存储和检索缓存内容的标识符。

- **proxy_cache_use_stale** ：使用缓存的策略

  - `error` | `timeout` | `invalid_header` | `updating` | `http_500` | `http_502` | `http_503` | `http_504` | `http_403` | `http_404` | `http_429` | `off` ...;
  - 和[proxy_next_upstream](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_next_upstream)指令的参数匹配 。

- **proxy_cache_background_update** ：默认off，运行开启子请求更新过期的内容，但会先把过期的返回给客户端

- **proxy_no_cache**：参数非空非0时，不缓存上游服务器的响应（不存）

- **proxy_cache_bypass**：参数非空非0时，不查缓存，直接请求上游服务器（不查）

- **proxy_cache_convert_head** 默认 on

  - 是否把head请求转换成get请求后再发送给上游服务器 以便缓存body里的内容

  - 如果关闭 需要在 `proxy_cache_key` 中添加 $request_method 以便区分缓存内容

- **proxy_cache_lock** 默认off，缓存更新锁，只允许一个请求更新缓存的响应

- **proxy_cache_lock_age** 默认5s，缓存锁超时时间

- **proxy_cache_methods** 默认 head get

- **proxy_cache_min_uses** 默认1，被请求多少次之后才做缓存

- **proxy_cache_revalidate** 如果缓存过期了，向上游服务器发送“If-Modified-Since” and “If-None-Match来验证是否改变，如果没有就不需要重新下载资源了

- **proxy_cache_valid** - 根据不同响应状态码，设置缓存时间。any指其他任意状态码

```nginx
http {
    proxy_cache_path /ngx_tmp levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;

    server {
        ...
        location / {
            proxy_pass http://my_backend;
            proxy_cache my_cache;
            proxy_cache_key "$scheme$host$request_uri";
            proxy_cache_valid 200 302 60m;
            proxy_cache_valid 404 1m;
            proxy_cache_bypass $cookie_nocache $arg_nocache$arg_comment;
            proxy_no_cache $http_pragma $http_authorization;
            add_header X-Cache-Status $upstream_cache_status;
            ...
        }
    }
}
```

### 断点续传

- 当有完整的 content-length 之后，可以做断点续传

- 前端请求头带上 `range:bytes=2-5,8-10`

- 在反向代理中需要向后端透传 Range请求头

  ```nginx
  proxy_set_header Range $http_range;
  ```

- 在 proxy_cache_key 中增加 $http_range

- **proxy_cache_max_range_offset** range最大值，超过之后不做缓存，默认情况下 不需要对单文件较大的资源做缓存

- 使用 slice 模块

  - 可以用于处理大文件的分片下载，它允许客户端并行下载文件的多个部分，这样可以提高大文件传输的效率，特别是在带宽有限的情况下

  - 编译安装 添加`--with-http_slice_module`

  - 配置

    ```nginx
    location / {
        slice 1m;
        proxy_cache cache;
        proxy_cache_key $uri$is_args$args$slice_range;  ## 一定要加上$slice_range
        proxy_set_header Range $slice_range;
        proxy_cache_valid 200 206 1h;
        #proxy_set_header Range $http_range;
        proxy_pass http://127.0.0.1:8080;
    
    }
    ```

  - 如果不带 Range 请求，后端大文件在本地 cache 时，会按照配置的 slice 大小进行切片缓存

  - 如果带 Range 请求，则 Nginx 会用合适的 Range 大小（以 slice 为边界）去后端请求

    - 这个大小跟客户端请求的 Range 可能不一样，并将以 slice 为大小的切片存储到本地，并以正确的206响应客户端
    - 因为无论你请求的Range 如何，Nginx 到后端总是以 slice 大小为边界，
    - 将客户端请求分割成若干个子请求到后端，
    - 假设配置的 slice 大小为1M,即1024字节，那么如果客户端请求 Range 为0-1023范围以内任何数字，均会落到第一个切片上，
    - 如果请求的 Range 横跨了几个 slice 大小，则nginx会向后端发起多个子请求，将这几个 slice 缓存下来。
    - 而对客户端，均以客户端请求的 Range 为准。如果一个请求中，有一部分文件之前没有缓存下来，则 Nginx 只会去向后端请求缺失的那些切片。

    > 由于这个模块是建立在子请求的基础上，会有这么一个潜在问题：当文件很大或者 slice 很小的时候，会按照 slice 大小分成很多个子请求，而这些个子请求并不会马上释放自己的资源，可能会导致文件描述符耗尽等情况。

### 清理缓存

需要第三方模块支持

需要第三方模块支持

https://github.com/FRiCKLE/ngx_cache_purge

配置

- 第一个参数是 keys_zone 与proxy_cache_path一致
- 第二个参数是 proxy_cache_key
- 下面的`$1` 表示 正则捕获，小括号表示一个分组，`$1`就是捕获的第一个分组，如`/purge/some/path`，那么 `$1` 就是 `/some/path`

```nginx
location ~ /purge(/.*) {
	# 只允许特定的 IP 地址调用清除缓存
    allow 127.0.0.1;
    deny all;

    # 清除缓存			
    proxy_cache_purge my_cache "$scheme$request_method$host$1";
}
```

### 缓存命中检测

```nginx
add_header X-Cache-Status $upstream_cache_status;
```

- `MISS`– 在缓存中找不到响应，因此从原始服务器获取响应。然后响应可能已被缓存。
- BYPASS– 响应是从源服务器获取的，而不是从缓存提供的，因为请求与指令匹配proxy_cache_bypass
- `EXPIRED`– 缓存中的条目已过期
- `STALE`– 内容已过时，因为源服务器未正确响应且`proxy_cache_use_stale`已配置。
- `UPDATING`– 内容已过时，因为当前正在更新条目以响应先前的请求并`proxy_cache_use_stale updating`进行配置。
- `REVALIDATED`– 该`proxy_cache_revalidate`指令已启用，NGINX 验证当前缓存的内容仍然有效（`If-Modified-Since`或`If-None-Match`）。
- `HIT`– 响应包含直接来自缓存的有效、新鲜内容。

## Nginx外置缓存

### redis

在`ngx_http_redis_module`。编译添加 `--add-module=path/to/redis2-nginx-module`

测试

```nginx
location = /foo {
    redis2_pass 192.168.199.161:6379;	## 将请求转发给 redis
    redis2_query auth 123123;  		## redis 密码
    set $value 'first';				## 定义一个变量
    redis2_query set one $value;		## 添加 k=one v=first
 }
```





get

```nginx
location = /get {
    redis2_pass 192.168.199.161:6379;	## 将请求命令转发给 redis
    redis2_query auth 123123;
    set_unescape_uri $key $arg_key; 	## 从请求中获取名为key的参数值
    redis2_query get $key;				## 获取
}
```

set

```nginx
# GET /set?key=one&val=first%20value

location = /set {
    redis2_pass 192.168.199.161:6379;
    redis2_query auth 123123;			
    set_unescape_uri $key $arg_key;  	## 从请求中获取名为 key 的参数值
    set_unescape_uri $val $arg_val;  	## 从请求中获取名为 value 的参数值
    redis2_query set $key $val;			## set命令
 }
```

集群

```nginx
upstream redis_cluster {
     server 192.168.199.161:6379;
     server 192.168.199.162:6379;
 }

location = /redis {
    redis2_pass redis_cluster;
    redis2_next_upstream error timeout invalid_response;
    redis2_query get "foo";
}
```

### memcached

在ngx_http_memcached_module，编译时需要添加`--with-http_memcached_module`

```nginx
location / {
    set $memcached_key "$uri?$args"; # 设置 Memcached 的键值为请求的 URI
    memcached_pass 127.0.0.1:11211; # Memcached 服务的地址和端口，集群可以配 upstream
    error_page 404 = @fallback; # 如果 Memcached 中没有找到内容，则处理 fallback
}

location @fallback {
    # 这里定义当 Memcached 中没有找到内容时的处理逻辑，即上游服务器
    proxy_pass http://backend_server;
}
```

#### 