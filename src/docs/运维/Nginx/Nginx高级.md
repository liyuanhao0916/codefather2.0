---
isOriginal: true
category: 
    - 运维
    - Nginx
tag: 
  - GeoIP
  - 会话
  - hash
  - sticky
  - KeepAlive
  - 真实IP
  - 压缩
  - 合并
  - 同步
  - 容错
  - 健康
  - 重试
  - 限流
  - 熔断
---
# Nginx 高级

## 高可用


> 管理nginx集群
>
> keepalived虚拟出一个ip在多台nginx来回横跳
>
> 不仅可以检测nginx

- 安装keepalived

  ```sh
  yum install keepalived
  ```

- 配置

  ```sh
  vim /etc/keepalived/keepalived.conf
  ```

  ```yml
  ! Configuration File for keepalived
  
  global_defs {
     router_id LVS_DEVEL #路由id：两台机器不一致
  }
  
  vrrp_instance VI_1 { #vrrp协议的一个自定义实例名称
      state MASTER #主机  由优先级决定，自己更改，备用机为 BACKUP
      interface ens33 #与系统网卡名一致
      virtual_router_id 51
      priority 100 #优先级
      advert_int 1
      authentication { #与第二台一致
          auth_type PASS
          auth_pass 1111
      }
      virtual_ipaddress { #身份认证：可配置多个
          192.168.10.200
          #192.168.10.201
      }
  }
  ```

- 启动

  ```sh
  systemctl start keepalived
  ```

- 查看

  ```sh
  ip addr
  #ip a
  ```

- 一旦主机停掉，从机马上切为虚拟ip

  ```sh
  init 0
  ```

## 会话管理

### hash 指令

> 做不到会话保持

**ip_hash**

- 会导致流量倾斜，ip集中
- 若后端服务器宕机，对应ip的服务将无法提供
- 应用场景：中小型项目**快速扩容**时，不想修改代码，只需增加几台服务器使用ip_hash就可临时实现

**hash $cookie_jsessionid;**

- 根据cookie中的jsessionid的不同转发到对应的服务器
- 无法确保一个客户端的请求都转发到一个服务器

**hash $request_uri;**

- 根据uri的不同转发到对应的服务器
- 适用于无状态的请求
- 有状态的就会丢失cookie，如购物车、登录状态，若分发到不同服务器，会导致会话丢失

```nginx
http {
    upstream httpds {
       ip_hash;							# 根据 ip 地址
        # hash $cookie_jsessionid;		# 根据 Tomcat 的 jsessionid
        # hash $request_uri				# 根据 uri
       server 192.168.44.102 ;
       server 192.168.44.103 ;
    }
    server{
        ...
    }
```

### sticky 模块

**使用sticky模块完成对Nginx的负载均衡**

- 对比

  - hash 指令是Nginx内置的，主要目的是通过hash计算实现负载均衡，可以hash任意变量，也可自定义hash算法，灵活，简单
  - sticky 是第三方模块，主要目的就是用来保持会话的，只能使用预定义的hash键（如：客户端ip、会话id）和固定的hash算法，但目的单纯，无需额外的中间层或数据库来存储和管理会话状态就可以实现会话管理

- [参考文档](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#sticky)

- Tengine 引入中的session_sticky模块，由于是第三方模块，需要重新编译Nginx

- 下载

  - [官网下载](https://bitbucket.org/nginx-goodies/nginx-sticky-module-ng/downloads/?tab=tags)

  - [GitHub地址](https://github.com/bymaximus/nginx-sticky-module-ng)

- 上传、解压

- 重新编译 -- 记得加上自己原本有的模块

  - --prefix：nginx安装目录
  - --add-module：第三方模块路径

  ```sh
  cd /opt/nginx-1.21.6	#根据自己的实际目录
  ./configure --prefix=/usr/local/nginx --add-module=/root/nginx-goodies-nginx-sticky-module-ng-c78b7dd79d0d
  ```

  - 报错 MD5 DIGEST LENGTH 未声明，就打开sticky文件夹中 `ngx_http_sticky_misc.c`文件，引入头

    ```c
    #include <openssl/sha.h>
    #include <openssl/md5.h>
    ```

  - 若缺少依赖`openssl-devel`，就安装

    ```sh
    yum intall -y openssl-devel
    ```

- 最好备份一下原来的nginx程序

  ```sh
  mv /usr/local/nginx/sbin/nginx /usr/local/nginx/sbin/nginx.old
  ```

- 将编译好的nginx程序替换进去

  ```sh
  cp objs/nginx /usr/local/nginx/sbin/
  ```

- 检测

  ```sh
  # 升级检测
  make upgrade
  # 检查模块
  nginx -V
  ```

- 配置Nginx

  ```nginx
  upstream httpget {
  
      ## 默认cookie的key是route，切记不要设置成 jsessionid 和Tomcat 冲突导致失效
  	sticky name=route expires=6h;
  
      server 192.168.44.102;
      server 192.168.44.103;
  }
  
  ```

**使用lua逻辑定向分发**

**Redis + SpringSession**

## KeepAlive

> 用于在客户端和服务器之间维持持久连接，以减少每次请求的延迟和资源消耗。
>
> 当Keep-Alive被启用时，客户端和服务器之间的TCP连接在完成一个请求-响应周期后不会立即关闭，而是保持打开状态，可以用于发送更多的请求。
>
> Keep-Alive并不是默认开启的，需要在HTTP请求中添加 `Connection: Keep-Alive` 头部字段来启用
>
> 大部分浏览器开启了Keep-Alive，但是APP等其他客户端需要配置开启

**优点**

- 减少连接的建立和关闭开销：在没有Keep-Alive的情况下，每个HTTP请求都需要建立和关闭一个TCP连接，这会产生较大的开销，尤其是在频繁请求多个资源时。启用Keep-Alive后，多个请求可以通过同一个TCP连接发送，减少了连接的建立和关闭开销。
- 减少网络延迟：TCP连接的建立需要经过三次握手的过程，这会增加请求的延迟。启用Keep-Alive后，TCP连接可以被重复使用，避免了重复的握手过程，从而减少了请求的延迟。
- 提高并发量：由于Keep-Alive允许多个请求共享同一个连接，减少了连接的数量，可以提高服务器资源的利用率。同时，也减轻了服务器的负载，提升了系统的整体性能

### 对客户端的配置

> 当明显预知用户在当前连接有下一步操作时开启，复用连接，减少握手
>
> 访问内联资源（比如html中引用css、js等）一般用缓存，不需要keeplive，长时间的tcp连接导致资源无效占用

- 配置在http字段中
- **keepalive_disable**：不对某些浏览器建立长连接，默认msie6
- **keepalive_request**：单个连接中可处理的请求数，默认1000，完全够用，太大可能会oom
- **keepalive_timeout**：与客户端保持连接的超时时间，剔除不活动的连接，默认75s
  - 0 代表关闭Keepalive
  - 第二个参数可选，代表请求头中显示的`Keep-Alive: timeout=`，两个值可能不同，http1.0时配上第二个参数，其他时候一般不用配
- **keepalive_time**：保持连接的最大时间，超过之后 强制失效，默认1h，避免长时间空闲导致的资源浪费
- **send_timeout**：在发送响应到客户端时，两次写操作之间的超时时间。如果在这个时间段内，客户端没有接收到任何数据，那么连接将被关闭。只影响长时间没有数据被发送的情况。如果客户端持续地读取数据，那么连接可以保持开启，即使超过了 `send_timeout` 指定的时间。

```nginx
http {
    include       mime.types;
	...
    keepalive_timeout  65 65; 	# 超过这个时间 没有活动，会让keepalive失效,需要重新建立连接
    keepalive_time 1h; 			# 一个tcp连接总时长，超过之后 强制失效
    send_timeout 60;			# 默认60s  此处有坑！！ 系统中 若有耗时操作，超过 send_timeout 强制断开连接。 注意：准备过程中，不是传输过程
    keepalive_requests 1000;  	#一个tcp复用中 可以并发接收的请求个数
    
    ...
```



### 对上游服务器配置

> upstream中配置的服务器默认都是http1.0，短连接，使用http1.1建立更高效的传输
>
> **启用**
>
> - **proxy_http_version** 1.1;		默认使用的是http1.0，需要配置为http1.1
> - **proxy_set_header** Connection "";			配置一个请求头传递给上游服务器，Connection默认是close，清除close信息 

**配置**

- **keepalive 100;**用于设置持久的缓存大小，表示每个工作进程将保持最多 100 个空闲的 keep-alive 连接到上游服务器
- **keepalive_requests** ：每个keep-alive连接上可以发送的最大请求数
- **keepalive_timeout**

```nginx
worker_processes  1; #默认为1，表示开启一个业务进程，和硬件有关，不超过内核数
events {
    worker_connections  1024; #单个业务进程可接受连接数,一般不用改
}
http {
    include       mime.types; #引入mime.types配置文件（定义http mime类型）
    default_type  application/octet-stream; #如果mime类型没匹配上，默认使用二进制流的方式传输
    sendfile        on; #高效网络传输，也就是数据0拷贝
    keepalive_timeout  65;  #保持连接超时的时间
    ## 负载
    upstream myfzjh {
     	## 针对上游服务器关于 keeplive 的配置
        keepalive_requests 1000;  	#一个tcp复用中 可以并发接收的请求个数
        keepalive_timeout  65;  #保持连接超时的时间
        keepalive 100;
        server 42.193.100.99 weight=3;
    	server 192.168.10.106 weight=1;   
    }
    server {
        listen       80; #监听端口号
        server_name  localhost; #主机名

        location / {
            ## 对上游服务器启用keepalive
    		proxy_http_version 1.1;
        	proxy_set_header Connection "";			#清除close信息
            proxy_pass http://myfzjh;
        }
    }
}
```

### AB压测

直连Nginx静态资源：Requests per second:    7671.48 [#/sec] (mean)

反向代理：Requests per second:    3850.85 [#/sec] (mean)

反向代理Tomcat：Requests per second:    2957.32 [#/sec] (mean)

直连Tomcat：Requests per second:    3222.38 [#/sec] (mean)

反向代理Tomcat + keepalive：Requests per second:    4277.41 [#/sec] (mean)

## upstream工作流程

### 处理 HTTP 请求的过程

1. 阶段：客户端请求初始化（Post-read）

   - **作用**: 接收完整的客户端请求头后的初始化处理。

   - **常用指令**: `post_read_timeout`


2. 阶段：服务器名称解析（Server Rewrite）

   - **作用**: 基于请求的服务器名称，重写请求的 URI（在 `server` 上下文）。

   - **常用指令**: `server_name`, `rewrite`


3. 阶段：找到匹配的 Location 块（Find Config）
   - **作用**: 根据请求的 URI 找到匹配的 `location` 块。


4. 阶段：重写请求 URI（Rewrite）

   - **作用**: 重写请求的 URI（在 `location` 上下文），并检查是否需要进行内部重定向。

   - **常用指令**: `rewrite`, `set`, `if`

   - **Lua 相关指令**: `rewrite_by_lua*`


5. 阶段：访问权限控制（Access）

   - **作用**: 检查客户端是否有权限访问请求的资源。

   - **常用指令**: `allow`, `deny`

   - **Lua 相关指令**: `access_by_lua*`


6. **阶段：内容生成（Content）**

- **作用**: 生成响应内容，这是定义响应正文的关键阶段。

- **常用指令**: `proxy_pass`, `fastcgi_pass`, `empty_gif`, `return`, `try_files`

- **Lua 相关指令**: `content_by_lua*`


7. 阶段：日志记录（Log）

   - **作用**: 记录请求日志。

   - **常用指令**: `access_log`

   - **Lua 相关指令**: `log_by_lua*`

8. 阶段：响应头过滤（Header Filter）

   - **作用**: 在发送响应头给客户端之前，可以修改或添加响应头。
   - **常用指令**: `add_header`、`expires`
   - **Lua 相关指令**: `header_filter_by_lua*`在发送响应头之前执行，可以用来修改响应头。

9. 阶段：响应体过滤（Body Filter）

   - **作用**: 在发送响应体给客户端之前，可以修改响应体内容。
   - **常用指令**: `sub_filter`
   - **Lua 相关指令**: `body_filter_by_lua*` 在发送响应体时执行，可以用来修改响应体内容。

- 其他相关处理阶段：

  - **阶段**: `init_by_lua*`在 Nginx 启动时执行，初始化全局 Lua 环境。

  - **阶段**: `init_worker_by_lua*`在 Nginx 工作进程启动时执行，初始化工作进程的 Lua 环境。

  - **阶段**: `balancer_by_lua*` 在负载均衡决策时执行，可以实现复杂的负载均衡算法。

### 对上游服务器的配置

proxy_pass 向上游服务器请求数据的阶段

- 初始化
- 与上游服务器建立连接

  - **proxy_connect_timeout**：与上游服务器连接超时时间、快速失败
  - **proxy_send_timeout**：定义nginx向后端服务发送请求的间隔时间(不是耗时)。默认60秒，超过这个时间会关闭连接
  - **proxy_read_timeout**：后端服务给nginx响应的时间，规定时间内后端服务没有给nginx响应，连接会被关闭，nginx返回504 Gateway Time-out。默认60秒
- 向上游服务器发送请求

  - **proxy_requset_buffering**：是否完全读到**请求体**之后再向上游服务器发送请求，默认值on，可选off
- 处理响应头、处理响应体 ---- **Header缓冲区**、**Body缓冲区**

  - **proxy_buffer_size**：header缓冲区大小，但实际上也可缓冲body

  - `proxy_buffering` :  缓冲从上游服务器接收的**响应**主体，如`proxy_buffering on;`
  - `proxy_buffers`：设置存储从上游服务器接收的响应主体的缓冲区数量和大小。
    - 第一个参数是缓冲区个数
    - 第二个参数是每个缓冲区大小，如`proxy_buffers 8 16k;`

  - **proxy_max_temp_file_size 1024m;**临时文件最大值

  - **proxy_temp_path**：临时文件位置
    - 第一个参数：绝对路径
    - 第二个参数：一级目录的字符数
    - 第三个参数：二级目录的字符数，如`proxy_temp_path /spool/nginx/proxy_temp 1 2;`
  - `proxy_temp_file_write_size` ：写入临时文件之前，Nginx 可以接收的最大数据量。默认1MB

### 对客户端的限制

> 可配置在 http、server、location

- **client_body_buffer_size**：客户端请求body缓冲区大小，默认32位8k 64位16k，如果请求体大于配置，则写入临时文件  `client_body_temp_path`

- **client_header_buffer_size**：设置读取客户端请求头的缓冲区大小

  > 如果一个请求行或者一个请求头字段不能放入这个缓冲区，那么就会使用large_client_header_buffers

- **large_client_header_buffers**：默认8k

- **client_max_body_size 1000M;**：默认1m，

  > 如果一个请求的大小超过配置的值，会返回**413 (request Entity Too Large)**
  >
  > 将size设置为 **0 将禁用对客户端请求正文大小的检查**

- **client_body_timeout**：指定客户端与服务端建立连接后发送 request body 的超时时间。如果客户端在指定时间内没有发送任何内容，Nginx 返回 HTTP **408（Request Timed Out）**

- **client_header_timeout**：客户端向服务端发送一个完整的 request header 的超时时间。如果客户端在指定时间内没有发送一个完整的 request header，Nginx 返回 HTTP **408（Request Timed Out）**。

- **client_body_temp_path** *path*` [`*level1*` [`*level2*` [`*level3*`]]]：在磁盘上客户端的body临时缓冲区位置

  > 改配置可能造成nginx空间不足，报错 **failed (28: No space left on device)**

- **client_body_in_file_only on;**：把body写入磁盘文件，请求结束也不会删除

- **client_body_in_single_buffer**：尽量缓冲body的时候在内存中使用连续单一缓冲区，在*二次开发时使用*$request_body读取数据时性能会有所提高

> `client_body_temp_path` 在 Nginx 配置中的作用是指定一个目录路径，用于存放从客户端接收的请求体的临时文件。这在处理 POST 或 PUT 请求时特别重要，特别是当请求体较大时（比如文件上传），超出了 Nginx 配置的 `client_body_buffer_size` 大小限制。
>
> 以下是 `client_body_temp_path` 的一些关键点：
>
> - **临时存储**：当客户端发送的请求体太大，无法全部存放在内存中时，Nginx 会使用 `client_body_temp_path` 指定的目录来存放临时文件。
>
> - **缓冲区溢出**：如果请求体大于 `client_body_buffer_size` 设置的值，Nginx 就会把请求体的一部分或全部写入到 `client_body_temp_path` 指定的目录。
>
> - **默认位置**：如果没有明确设置 `client_body_temp_path`，Nginx 会使用编译时指定的默认路径。

## 使上游获取真实IP

### X-Real-IP

额外模块，不推荐使用

### setHeader

```nginx
proxy_set_header X-Forwarded-For $remote_addr;
```

## 压缩

### Gzip

作用域 `http, server, location`

```nginx
gzip on;
gzip_buffers 16 8k;
gzip_comp_level 6;
gzip_http_version 1.1;
gzip_min_length 256;
gzip_proxied any;
gzip_vary on;
gzip_types text/plain application/x-javascript text/css application/xml;
gzip_types
    text/xml application/xml application/atom+xml application/rss+xml application/xhtml+xml image/svg+xml
    text/javascript application/javascript application/x-javascript
    text/x-json application/json application/x-web-app-manifest+json
    text/css text/plain text/x-component
    font/opentype application/x-font-ttf application/vnd.ms-fontobject
    image/x-icon;
gzip_disable "MSIE [1-6]\.(?!.*SV1)";
```

**gzip on;**

- 开关，默认关闭

**gzip_buffers 32 4k|16 8k**

- 缓冲区大小

**gzip_comp_level** 1；

- 压缩等级 1-9，数字越大压缩比越高

**gzip_http_version 1.1;**

- 使用gzip的最小版本

**gzip_min_length**

- 设置将被gzip压缩的响应的最小长度。 长度仅由“Content-Length”响应报头字段确定

**gzip_proxied**

- 多选，针对上游服务器返回的头信息，选择是否压缩

- expired - 启用压缩，如果header头中包含 "Expires" 头信息
- no-cache - 启用压缩，如果header头中包含 "Cache-Control:no-cache" 头信息
- no-store - 启用压缩，如果header头中包含 "Cache-Control:no-store" 头信息
- private - 启用压缩，如果header头中包含 "Cache-Control:private" 头信息
- no_last_modified - 启用压缩,如果header头中不包含 "Last-Modified" 头信息
- no_etag - 启用压缩 ,如果header头中不包含 "ETag" 头信息
- auth - 启用压缩 , 如果header头中包含 "Authorization" 头信息
- any - 无条件启用压缩

**gzip_vary on;**

- 增加一个header，适配老的浏览器 `Vary: Accept-Encoding`

**gzip_types**

- 哪些mime类型的文件进行压缩

**gzip_disable**

- 禁止某些浏览器使用gzip

### ngx_http_gunzip_module

帮助不支持gzip的客户端解压本地文件

增加 http_gzip_static_module 模块

需要重新编译nginx

```
./configure --with-http_gzip_static_module
```

### Brotli

Brotli是一种用于数据压缩的开源压缩算法，由Google开发。

与传统的压缩算法（如Gzip）相比，Brotli具有更高的压缩率

**安装**

- 官网
  - `https://github.com/google/ngx_brotli`
  - `https://codeload.github.com/google/brotli/tar.gz/refs/tags/v1.0.9`

- 下载 两个项目

- 解压缩

模块化编译

```shell
./configure --with-compat --add-dynamic-module=/root/ngx_brotli-1.0.0rc --prefix=/usr/local/nginx/
```

或

```
--add-dynamic-module=brotli目录
```

- make

- 将`ngx_http_brotli_filter_module.so` `ngx_http_brotli_static_module.so`拷贝到`/usr/local/nginx/modules/`
- 复制nginx主程序

**配置**

```nginx
load_module "/usr/local/nginx/modules/ngx_http_brotli_filter_module.so";
load_module "/usr/local/nginx/modules/ngx_http_brotli_static_module.so";
```

```nginx
brotli on;
brotli_static on;
brotli_comp_level 6;
brotli_buffers 16 8k;
brotli_min_length 20;
brotli_types text/plain text/css text/javascript application/javascript text/xml application/xml application/xml+rss application/json image/jpeg image/gif image/png;
```



**测试**

默认http协议是没有br的

```
curl -H 'Accept-Encoding: gzip' -I http://localhost
```

## 合并

### Concat

用于实现服务端的资源合并功能。通过这个模块，客户端可以通过一个请求获取多个文件的合并内容，这样可以减少HTTP请求的数量，提高页面加载速度。如`http://example.com/concat?file1.css&file2.css&file3.css`

- 只有当客户端对这些资源文件的请求都指向同一个 Nginx 服务器（即使用相同的域名和端口）时，这种合并才有效。
- 这种合并方式不支持跨域请求的资源文件。
- 考虑到缓存的问题，当其中任何一个单独的文件更新时，浏览器可能需要刷新缓存以获取最新的合并资源。因此，可能需要一些缓存失效策略，比如添加版本号或时间戳作为查询参数

**Concat模块**

- Tengine 提供

- Nginx官方介绍 https://www.nginx.com/resources/wiki/modules/concat/

- git地址 https://github.com/alibaba/nginx-http-concat

- 安装

下载源码解压缩编译安装

**配置**

```nginx
concat on;
concat_max_files 30;
# 设置Concat模块的分隔符，这里使用逗号
concat_delimiter ",";		## http://example.com/concat?file1.css,file2.css,file3.css
# 设置允许合并的文件类型
concat_types application/javascript text/css;
```

前端也需要作出相应修改

```html
<link rel="stylesheet" href="/css/file1.css">
<link rel="stylesheet" href="/css/file2.css">
<link rel="stylesheet" href="/css/file3.css">
<script src="/js/script1.js"></script>
<script src="/js/script2.js"></script>
<script src="/js/script3.js"></script>

<!-- 修改后 -->
<link rel="stylesheet" href="/concat?/css/file1.css,/css/file2.css,/css/file3.css">
<script src="/concat?/js/script1.js,/js/script2.js,/js/script3.js"></script>
```



### SSI

是一种简单的服务器端脚本语言，用于将网页的某些部分包含在其他网页中。它通常用于将常用的页面内容（如页头、页脚、导航菜单等）插入到多个页面中，从而避免重复内容的维护工作。

**SSI**

官方文档 http://nginx.org/en/docs/http/ngx_http_ssi_module.html

编译时需要包含 `ngx_http_ssi_module` 模块

**SSI 配置指令 **

- ssi：开关（on、off，默认关闭）

- ssi_min_file_chunk ：向磁盘存储并使用sendfile发送，文件大小最小值（默认1k）
- ssi_last_modified ：是否保留lastmodified标头字段，以方便响应缓存（on、off，默认关闭）
- ssi_silent_errors ：如果启用，如果在 SSI 处理期间发生错误， 则抑制“an error occurred while processing the directive”字符串的输出。（on、off，默认关闭）
- ssi_value_length：限制脚本参数最大长度（默认256）
- ssi_types ：默认text/html; 如果需要其他mime类型 需要设置，*表任意



**SSI 命令** --- 用于html文件 --- 通用格式`<!--# 命令 参数1=值1 参数2=值2 ... -->`

- block：定义一个块

  ```html
  <!--# block name="块名" -->
  默认的响应结果、其他命令
  <!--# endblock -->
  ```

- include ：将另一个请求的结果包含到响应中

  - file：指定包含的文件，注意格式，不是注释哦 ---- 静态文件直接引用

  ```html
  <!--# include file="footer.html" -->
  ```

  -  virtual：指定包含的请求，不一定是具体文件，可以指向另一个 location 块的虚拟路径或 FastCGI/uwsgi/SCGI/gRPC 服务器处理的多个请求并行运行，如果需要顺序处理，使用`wait`参数。

  ```html
  <!--# include virtual="/remote/body.php?argument=value" -->
  ```

  - stub：请求结果为空正文或在请求处理期间发生错误，则将输出其内容的块

  ```html
  <!--# block name="one" -->&nbsp;<!--# endblock -->
  
  <!--# include virtual="/remote/body.php?argument=value" stub="one" -->
  ```

  - wait：在继续 SSI 处理之前等待请求完全完成

  ```html
  <!--# include virtual="/remote/body.php?argument=value" wait="yes" -->
  ```

  - set：将请求处理成功的结果写入指定变量（块）

  ```html
  <!--# include virtual="/remote/body.php?argument=value" set="one" -->
  ```

  ​		响应的最大大小由 [subrequest_output_buffer_size](https://nginx.org/en/docs/http/ngx_http_core_module.html#subrequest_output_buffer_size) 指令配置

  ```nginx
  location /remote/ {
      subrequest_output_buffer_size 64k;
      ...
  }
  ```

- set：设置临时变量

  - var：变量名
  - value：变量值


- if：目前仅支持一层嵌套。

  - expr：条件表达式

  ```
  存在检查
  <!--# if expr="$name" -->
  
  文本比较
  <!--# if expr="$name = text" -->
  <!--# if expr="$name != text" -->
  
  正则比较
  <!--# if expr="$name = 正则表达式" -->
  
  <!--# else -->
  <!--# endif -->
  ```

  - 正则表示式的部分可以拆分提取为变量

  ```
  <!--# if expr="$name = /(.+)@(?P<domain>.+)/" -->
      <!--# echo var="1" -->				提取第一个括号（.+）匹配到的内容，并输出
      <!--# echo var="domain" -->			输出命名捕获组捕获到的内容	
  <!--# endif -->
  ```

  > **命名捕获组（Named Capture Groups）**
  >
  > - 是正则表达式中的一个高级特性
  >
  > - 它允许你为正则表达式中的一部分模式命名，以便之后可以更容易地引用这部分匹配的内容。
  >
  > - 在不同的编程语言和工具中，命名捕获组的语法可能有所不同，但通常使用 `(?<name>pattern)` 来创建一个命名捕获组，其中 `name` 是你为捕获组指定的名称，而 `pattern` 是你想要匹配的模式。
  >
  >   ```
  >   (?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})
  >   ```
  >
  >   如果正则表达式匹配了字符串 "2023-04-01"，你可以通过捕获组的名称 `year`、`month` 和 `day` 来分别获取 "2023"、"04" 和 "01"。

- echo：输出变量的值，嵌入到HTML

  - var：变量名。
  - encoding：编码方法。可能的值包括none、url和 entity。默认情况下，entity使用。
  - default：设置未定义时的默认值。默认为空。

  ```html
  <!--# echo var="name" default=" no " -->
  ```

  等同于

  ```html
  <!--# if expr="$name" --><!--# echo var="name" -->
  <!--# else --> no
  <!--# endif -->
  ```

- config：设置SSI处理过程中使用的一些参数

  - errmsg：报错信息。默认情况下，输出以下字符串
  - timefmt：日期格式化。默认`％A，％d-％b-％Y％H：％M：％S％Z`,“ `%s`”格式适合输出以秒为单位的时间

- exec：执行外部程序或脚本（慎用，不安全）


  - cmd：执行的cmd、shell命令
  - cgi：CGI脚本路径

  ```html
<!--#exec cmd="ls -l" -->
<!--#exec cgi="/cgi-bin/script.cgi" -->
  ```

  

**嵌入变量**

- `$date_local`：当地时区的当前时间。格式由`config`带有`timefmt`参数的命令设置
- `$date_gmt`：GMT 当前时间。格式由`config`带有`timefmt`参数的命令设置



## rsync 集群同步

- 支持本地和远程同步。
- 使用增量备份技术，只传输文件的变化部分。
- 支持复制链接、设备、所有者、群组和权限。
- 支持排除和包含特定文件或目录。
- 可以使用SSH作为数据传输的安全通道。
- 可以用作守护进程，并通过网络提供文件同步服务。

### 安装

```
yum install -y rsync
```

创建密码文件`/etc/rsync.password`

内容

```
hello:123
```

修改权限

```
chmod 600 /etc/rsync.password
```

创建或修改配置 /etc/rsyncd.conf ----- **一般只需改user和密码文件位置**

```ini
pid file = /var/run/rsyncd.pid
log file = /var/log/rsync.log
port = 873

[sharename]
    path = /path/to/share
    comment = My shared folder
    read only = no
    list = yes
    ## 改 名
    auth users = username	
    ; 改 密码文件
    secrets file = /etc/rsync.password
```

- ini文件只能在节名称后或另起一行写注释（用 # 或 ; ）

**开机启动**

在`/etc/rc.local`文件中添加

```sh
rsync --daemon
```

- 修改权限

```sh
echo "sgg:111" >> /etc/rsyncd.passwd
```



### 命令

**本地文件同步**

- 目录如果不存在，rsync会自动创建

- `-a` （archive） 归档模式，保留原文件的属性，如时间戳、权限等。

- `-v` （verbose） 详细模式，显示同步的详细信息。

  ```sh
   rsync -av /path/to/source/ /path/to/destination/
  ```

**查看远程目录**

```sh
rsync --list-only 192.168.44.104::www/
```

**拉取数据到指定目录**

```sh
rsync -avz rsync://192.168.44.104:873/www
rsync -avz 192.168.44.104::www/ /root/w
```

**使用SSH方式**

```sh
rsync -avzP /usr/local/nginx/html/ root@192.168.44.105:/www/
```

**客户端免密**

客户端只放密码

```sh
echo "111" >> /etc/rsyncd.passwd
```

此时在客户端已经可以配合脚本实现定时同步了

**推送**

修改配置

```sh
rsync -avz --password-file=/etc/rsyncd.passwd.client /usr/local/nginx/html/ rsync://sgg@192.168.44.105:/www
```

```--delete 删除目标目录比源目录多余文件```

**实时推送**

推送端安装inotify

依赖

```sh
yum install -y automake
```

```sh
wget http://github.com/downloads/rvoicilas/inotify-tools/inotify-tools-3.14.tar.gz
./configure --prefix=/usr/local/inotify
make && make install
```

监控目录

```sh
/usr/local/inotify/bin/inotifywait -mrq --timefmt '%Y-%m-%d %H:%M:%S' --format '%T %w%f %e' -e close_write,modify,delete,create,attrib,move //usr/local/nginx/html/

```

**简单自动化脚本**

```shell
#!/bin/bash

/usr/local/inotify/bin/inotifywait -mrq --timefmt '%d/%m/%y %H:%M' --format '%T %w%f %e' -e close_write,modify,delete,create,attrib,move //usr/local/nginx/html/ | while read file
do
       
        rsync -az --delete --password-file=/etc/rsyncd.passwd.client /usr/local/nginx/html/ sgg@192.168.44.102::ftp/
done

```



### rsync 常用选项

| 选项     | 含义                                                         |
| :------- | :----------------------------------------------------------- |
| -a       | 包含-rtplgoD                                                 |
| -r       | 同步目录时要加上，类似cp时的-r选项                           |
| -v       | 同步时显示一些信息，让我们知道同步的过程                     |
| -l       | 保留软连接                                                   |
| -L       | 加上该选项后，同步软链接时会把源文件给同步                   |
| -p       | 保持文件的权限属性                                           |
| -o       | 保持文件的属主                                               |
| -g       | 保持文件的属组                                               |
| -D       | 保持设备文件信息                                             |
| -t       | 保持文件的时间属性                                           |
| –delete  | 删除DEST中SRC没有的文件                                      |
| –exclude | 过滤指定文件，如–exclude “logs”会把文件名包含logs的文件或者目录过滤掉，不同步 |
| -P       | 显示同步过程，比如速率，比-v更加详细                         |
| -u       | 加上该选项后，如果DEST中的文件比SRC新，则不同步              |
| -z       | 传输时压缩                                                   |

### inotify 常用参数

| 参数       | 说明                                                         | 含义                                                         |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| -r         | --recursive                                                  | #递归查询目录                                                |
| -q         | --quiet                                                      | #打印很少的信息，仅仅打印监控事件信息                        |
| -m         | --monitor                                                    | #始终保持事件监听状态                                        |
| --excludei |                                                              | #排除文件或目录时，不区分大小写                              |
| --timefmt  |                                                              | #指定事件输出格式                                            |
| --format   |                                                              | #打印使用指定的输出类似格式字符串                            |
| -e         | --event[ -e\|--event ... ]accessmodifyattribcloseopenmove_tomove createdeleteumount | #通过此参数可以指定要监控的事件 #文件或目录被读取#文件或目录的内容被修改#文件或目录属性被改变#文件或目录封闭，无论读/写模式#文件或目录被打开#文件或目录被移动至另外一个目录#文件或目录被移动另一个目录或从另一个目录移动至当前目录#文件或目录被创建在当前目录#文件或目录被删除#文件系统被卸载 |



## GEOip

GeoIP 是一种用于通过 IP 地址确定一个互联网连接的地理位置信息的开源技术。它通常用于内容个性化、地理定位、地理限制、分析和防欺诈等场景。GeoIP 数据库可以提供 IP 地址对应的城市、国家、邮政编码、经纬度、ISP（互联网服务提供商）等信息。

MaxMind 是提供 GeoIP 服务和数据库的知名公司，它提供了 GeoLite2 和 GeoIP2 系列数据库和服务。这些数据库有免费的版本（如 GeoLite2）和付费的版本（如 GeoIP2），付费版本通常提供更准确、更详细的数据。

### 下载安装

[官网](https://maxmind.com)

[使用文档](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data)

- 注册

- [下载](https://www.maxmind.com/en/accounts/current/geoip/downloads) --- 选择 mmdb 格式的，解压后得到 mmdb 数据库文件

- 配置数据库自动更新

  - 生成许可密钥 

    - 官方说：购买了 GeoIP2 数据库可以自动下载数据库；GPT说：开源版也可以（待验证）
    - 只展示一次，一定要保存  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
    - 生成完后可下载配置

  - 安装 `geoipupdate` 工具

    ```sh
    ##  Ubuntu/Debian 系统
    sudo apt-get update
    sudo apt-get install geoipupdate
    
    ##  CentOS/RHEL 系统
    sudo yum install geoipupdate
    ```

  - 配置   `/etc/GeoIP.conf` 文件，就是下载下来的 GeoIP.conf

  - 运行  `sudo geoipupdate` 即可更新数据库，如果配置文件路径不在/etc下，需要 -f 指定路径

    ```sh
    sudo geoipupdate -f /path/GeoIP.conf
    ```

  - 配置cron任务自动更新

    ```sh
    crontab -e		## 编辑定时器
    0 3 * * 3 /usr/bin/geoipupdate		## 添加一个配置
    ```

    - 保存后会自动加载，可以`systemctl status cron`查看（有些系统是crond），没启动就收到启动

GeoIP也可以通过java等客户端使用

- [官方文档](https://dev.maxmind.com/geoip/geolocate-an-ip/databases)
- [客户端api文档](https://dev.maxmind.com/geoip/docs/databases#client-apis)

### nginx模块安装

- 方式一：使用apt或yum

  ```sh
  sudo apt-get install libnginx-mod-http-geoip2
  ```

- 方式二：Nginx源代码编译安装

  ```sh
  git clone --recursive https://github.com/maxmind/libmaxminddb  ## 下载模块源码
  ./configure --add-module=/path/to/ngx_http_geoip2_module	## 添加模块
  make			## 编译安装
  make install	## 添加为系统命令
  ```

### nginx配置

[官方文档](https://nginx.org/en/docs/http/ngx_http_geoip_module.html#geoip_proxy)

```nginx
http {
    # 加载 GeoIP2 模块
    load_module "modules/ngx_http_geoip2_module.so";

    # 配置 GeoIP2 数据库
    geoip2 /path/to/GeoLite2-City.mmdb {	## 数据库路径
        auto_reload 5m; # 自动重新加载数据库
        $geoip2_data_country_code country iso_code;
        $geoip2_data_country_name country names en;
        $geoip2_data_city_name city names en;
        # 其他你想要设置的变量...
    }

    # 使用 GeoIP2 数据的配置示例
    server {
        location / {
            add_header X-Country-Code $geoip2_data_country_code;
            add_header X-Country-Name $geoip2_data_country_name;
            add_header X-City-Name $geoip2_data_city_name;
            # 其他配置...
        }
    }
}
```



## 容错机制

### 健康检查（Health Checks）

开源版Nginx只能被动健康检查，plus版可以主动检查和实时活动监控仪表盘

**被动健康检查**

- 监控并尝试恢复失败的连接，无法恢复，则nginx会将其标记为不可用，并暂时停止向其发送请求，直到服务器再次标记为活动状态

- 在upstream中为每个上有服务器添加配置

  - `max_fails`：失败尝试次数（默认为 1 次尝试），达到后标记为不可用
  - `fail_timeout` ：既是标记为不可用的时间（默认为 10 秒），又是

- 如果组中只有一台服务器，则`fail_timeout`和`max_fails`参数将被忽略，并且该服务器永远不会被标记为不可用

  ```nginx
  upstream backend {
      server backend1.example.com;
      server backend2.example.com max_fails=3 fail_timeout=30s;
  }
  ```

**服务器慢启动** --- Plus版才有

- 最近恢复的服务器很容易被连接淹没，这可能会导致服务器再次被标记为不可用。慢启动允许上游服务器在恢复或变得可用后逐渐将其权重从零恢复到配置值

- 如果组中只有一台服务器，则该`slow_start`参数将被忽略，并且该服务器永远不会被标记为不可用

- 慢启动是 NGINX Plus 独有的

  ```nginx
  upstream backend {
      server backend1.example.com slow_start=30s;
      server backend2.example.com;
      server 192.0.0.1 backup;
  }
  ```

**主动健康检查**

- [tengine版](https://github.com/yaoweibin/nginx_upstream_check_module)
- [nginx商业版](http://nginx.org/en/docs/http/ngx_http_upstream_hc_module.html)

```nginx
upstream backend {
    #   server 192.168.44.102 weight=8 down;
    server 192.168.44.104:8080;
    server 192.168.44.105:8080;
    check interval=3000 rise=2 fall=5 timeout=1000 type=http;
    check_http_send "HEAD / HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx http_3xx;
}
     location /status {
            check_status;
            access_log off;
        }

        location / {
			proxy_pass http://backend;
     		root   html;
        }
```



### 重试机制（Retry Mechanism）

**proxy_next_upstream**：与后端服务器通信发生错误时，尝试下一个上游服务器的条件。

- `error`：当与上游服务器通信发生错误时（如连接超时、连接被拒绝等）。
- `timeout`：当与上游服务器建立连接时发生超时。
- `invalid_header`：当上游服务器返回无效的响应头时。
- `http_500`、`http_502`、`http_503`、`http_504`：根据上游服务器返回的特定HTTP状态码进行切换。

**proxy_next_upstream_timeout** ：重试最大超时时间

**proxy_next_upstream_tries** ：重试次数

- 包括第一次

- proxy_next_upstream_timeout时间内允许proxy_next_upstream_tries次重试

```nginx
location / {
    proxy_pass http://backend_servers;
    proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
}
```



> **踩坑**
>
> 比如有这么一个场景：一个用于导入数据的web页面，上传一个excel，通过读取、处理excel，向数据库中插入数据，处理时间较长（如1分钟），且为同步操作（即处理完成后才返回结果）。暂且不论这种方式的好坏，若nginx配置的响应等待时间（proxy_read_timeout）为30秒，就会触发超时重试，将请求又打到另一台。如果处理中没有考虑到重复数据的场景，就会发生数据多次重复插入！

### **(待整理)熔断（Circuit Breaking）**

```nginx
http {
  server {
    location / {
      proxy_pass http://backend;
      proxy_intercept_errors on;
      error_page 502 503 = @fallback;
    }
    
    location @fallback {
      # Handle fallback logic
    }
  }
}
```

### 限流（Rate Limiting）

`ngx_http_limit_req_module`模块用于限制处理请求的速率。

- **limit_req_zone**：定义共享内存区域
  - `$binary_remote_addr`是用来区分不同客户端的变量
  - `zone=mylimit:10m`  定义名称和大小
  - `rate=10r/s` 定义限制速率，每秒10个请求
- **limit_req**：使用共享内存区域
  - `zone=mylimit`：应用之前定义的限制区域。
  - `burst=5`：允许在短时间内超过限制的请求数（突发请求），超过这个数目的请求会被延迟处理。
  - `nodelay`：通常与`burst`一起使用，允许请求立即被处理而不是延迟，直到达到`burst`设置的值。

```nginx
http {
  limit_req_zone $binary_remote_addr zone=limit:10m rate=10r/s;
  
  server {
    location / {
      limit_req zone=limit burst=20 nodelay;
      proxy_pass http://backend;
    }
  }
}
```

------------------------------------------

`ngx_http_limit_conn_module`：用于限制同一时刻针对某个给定键值（通常是客户端IP地址）的并发连接数。

- **limit_conn_zone**：定义共享内存区域 --- **通过客户端IP地址限制**
  - `binary_remote_addr`是用来区分不同客户端的变量
  - `zone=mylimit:10m`  定义名称和大小
- **limit_conn**：使用共享内存区域
  - 第一个参数：应用之前定义的限制区域。
  - 第二个参数：每个IP地址的并发连接数

```nginx
http {
    # 定义一个名为“limit_conn_zone”的共享内存区域，用于跟踪并发连接数
    limit_conn_zone $binary_remote_addr zone=mylimit:10m;

    server {
        location / {
            # 应用名为“addr”的限制区域，允许每个IP的并发连接数不超过10个
            limit_conn mylimit 10;
            # ...
        }
    }
}
```

### 负载均衡（Load Balancing）

见[负载均衡](/docs/运维/Nginx/Nginx基础#负载均衡)

### 缓存（Caching）

见[缓存](/docs/运维/Nginx/Nginx缓存)

