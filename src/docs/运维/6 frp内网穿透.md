# 内网穿透

## 安装

## 使用

### ssh访问

#### 服务端

```ini
[common]
## 绑定的端口，和客户端保持一致
bind_port = 7000
## 绑定的ip
bind_addr = 0.0.0.0
```

#### 客户端

```ini
[common]
## 服务端的端口
server_port = 7000
## 服务端的ip
server_addr = 82.157.239.146


[ssh]
## 协议
type = tcp
## 本地ip或内网ip
local_ip = 192.168.31.204
## 本地端口 ssh对应22
local_port = 22
## 远程端口 ，即通过服务端访问的端口
remote_port = 7022
```

### Web服务

通过访问web1.botuer.com:7002可以访问到内网80端口的资源

通过访问web2.botuer.com:7002可以访问到内网81端口的资源

#### 服务端

```ini
[common]
bind_port = 7000
## http 请求内部转发的端口
vhost_http_port = 7002
## https 请求内部转发的端口
vhost_https_port = 7003
```

#### 客户端

```ini
[common]
server_port = 7000
server_addr = 82.157.239.146

[web1]
type = http
local_port = 80
custom_domains = web1.botuer.com

[web2]
type = http
local_port = 81
custom_domains = web2.botuer.com
```

### 公网80端口访问

要想通过公网80端口访问内网的宝塔，需要nginx

流程：broker001.botuer.com经过nginx，通过nginx监听80端口，转发到frps对应的http代理端口上，经过frps的代理转发到内网服务器对应的端口，再通过内网服务器的nginx转发到宝塔对应的服务

#### 服务端

**nginx**

```nginx
server
{
    listen 80;
    server_name broker001.botuer.com;
  
    location / {
        ## 非常关键，只能用域名，不能用ip
        proxy_pass http://broker001.botuer.com:7002;
    }
    access_log  /www/wwwlogs/broker001.botuer.com.log;
    error_log  /www/wwwlogs/broker001.botuer.com.error.log;
}
```

**frps**

```ini
[common]
bind_port = 7000
vhost_http_port = 7002
```

#### 客户端

**frpc**

```ini
[bt]
type = http
local_port = 80
local_ip = 127.0.0.1
subdomain = broker001
```

**nginx**

```nginx
server
{
    listen 80;
    server_name broker001.botuer.com;

    location / {
        ## 转发到bt的端口号
        proxy_pass http://127.0.0.1:25323;
    }
  
    access_log  /www/wwwlogs/broker001.botuer.com.log;
    error_log  /www/wwwlogs/broker001.botuer.com.error.log;
}
```

### 文件访问

#### 服务端

```ini
[common]
bind_port = 7000
```

#### 客户端

```ini
[common]
server_addr = x.x.x.x
server_port = 7000

[test_static_file]
type = tcp
remote_port = 6000
plugin = static_file
# 要对外暴露的文件目录
plugin_local_path = /tmp/file
# 用户访问 URL 中会被去除的前缀，保留的内容即为要访问的文件路径
plugin_strip_prefix = static
plugin_http_user = abc
plugin_http_passwd = abc
```

通过浏览器访问 `http://x.x.x.x:6000/static/` 来查看位于 `/tmp/file` 目录下的文件，会要求输入已设置好的用户名和密码。

### https2http

#### 服务端

```ini
[common]
bind_port = 7000
vhost_https_port = 443
```

#### 客户端

```ini
[common]
server_addr = x.x.x.x
server_port = 7000

[test_htts2http]
type = https
custom_domains = test.yourdomain.com

plugin = https2http
plugin_local_addr = 127.0.0.1:80

# HTTPS 证书相关的配置
plugin_crt_path = ./server.crt
plugin_key_path = ./server.key
plugin_host_header_rewrite = 127.0.0.1
plugin_header_X-From-Where = frp
```

通过浏览器访问 `https://test.yourdomain.com`

### 安全暴露

对于某些服务来说如果直接暴露于公网上将会存在安全隐患。

使用 `stcp(secret tcp)` 类型的代理可以避免让任何人都能访问到要穿透的服务，但是访问者也需要运行另外一个 frpc 客户端

#### 服务端

```ini
[common]
bind_port = 7000
```

#### 客户端

```ini
[common]
server_addr = x.x.x.x
server_port = 7000

[secret_ssh]
type = stcp
# 只有 sk 一致的用户才能访问到此服务
sk = abcdefg
local_ip = 127.0.0.1
local_port = 22
```

#### 用户端

```ini
[common]
server_addr = x.x.x.x
server_port = 7000

[secret_ssh_visitor]
type = stcp
# stcp 的访问者
role = visitor
# 要访问的 stcp 代理的名字
server_name = secret_ssh
sk = abcdefg
# 绑定本地端口用于访问 SSH 服务
bind_addr = 127.0.0.1
bind_port = 6000
```

### 点对点

不通过服务器中转流量的方式来访问内网服务

frp 提供了一种新的代理类型 `xtcp` 用于应对在希望传输大量数据且流量不经过服务器的场景。

使用方式同 `stcp` 类似，需要在两边都部署上 frpc 用于建立直接的连接

#### 客户端1

```ini
[common]
server_addr = x.x.x.x
server_port = 7000
# 当默认的 stun server 不可用时，可以配置一个新的
# nat_hole_stun_server = xxx

[p2p_ssh]
type = xtcp
# 只有 sk 一致的用户才能访问到此服务
sk = abcdefg
local_ip = 127.0.0.1
local_port = 22
```

#### 客户端2

```ini
[common]
server_addr = x.x.x.x
server_port = 7000
# 当默认的 stun server 不可用时，可以配置一个新的
# nat_hole_stun_server = xxx

[p2p_ssh_visitor]
type = xtcp
# xtcp 的访问者
role = visitor
# 要访问的 xtcp 代理的名字
server_name = p2p_ssh
sk = abcdefg
# 绑定本地端口用于访问 ssh 服务
bind_addr = 127.0.0.1
bind_port = 6000
# 当需要自动保持隧道打开时，设置为 true
# keep_tunnel_open = false
```

## 详解

### 配置文件

frp 目前仅支持 ini 格式的配置文件，frps 和 frpc 各自支持不同的参数。

frps 主要配置服务端的一些通用参数，frpc 则需要额外配置每一个代理的详细配置

#### 格式

`[common]` 是固定名称的段落，用于配置通用参数。

`[ssh]` 仅在 frpc 中使用，用于配置单个代理的参数。代理名称自定义，必须唯一，不能重复。

同一个客户端可以配置多个代理。

#### 模板渲染

配置文件支持使用环境变量进行模版渲染，模版格式采用 Go 的标准格式。

示例配置如下：

```ini
# frpc.ini
[common]
server_addr = {{ .Envs.FRP_SERVER_ADDR }}
server_port = 7000

[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = {{ .Envs.FRP_SSH_REMOTE_PORT }}
```

启动 frpc 程序：

```
export FRP_SERVER_ADDR="x.x.x.x"
export FRP_SSH_REMOTE_PORT="6000"
./frpc -c ./frpc.ini
```

frpc 会自动使用环境变量渲染配置文件模版，所有环境变量需要以 `.Envs` 为前缀

#### 配置校验

类似nginx的 nginx -t

通过执行 `frpc verify -c ./frpc.ini` 或 `frps verify -c ./frps.ini` 可以对配置文件中的参数进行预先校验。

```
frpc: the configuration file ./frpc.ini syntax is ok
```

如果出现此结果，则说明新的配置文件没有错误，否则会输出具体的错误信息

#### 多配置文件

通过 `includes` 参数可以在主配置中包含其他配置文件，从而实现将代理配置拆分到多个文件中管理。

```ini
# frpc.ini
[common]
server_addr = x.x.x.x
server_port = 7000
includes = ./confd/*.ini
# ./confd/test.ini
[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 6000
```

上述配置在 frpc.ini 中通过 includes 额外包含了 `./confd` 目录下所有的 ini 文件的代理配置内容，效果等价于将这两个文件合并成一个文件。**建议使用绝对路径**

需要注意的是 includes 指定的文件中只能包含代理配置，common 段落的配置只能放在主配置文件中

#### 范围端口映射

在 frpc 的配置文件中可以指定映射多个端口，目前只支持 TCP 和 UDP 的代理类型。

这一功能通过 `range:` 段落标记来实现，客户端会解析这个标记中的配置，将其拆分成多个 proxy，每一个 proxy 以数字为后缀命名。

例如要映射本地 6000-6005, 6007 这7个端口，主要配置如下：

```ini
# frpc.ini
[range:test_tcp]
type = tcp
local_ip = 127.0.0.1
local_port = 6000-6005,6007
remote_port = 6000-6005,6007
```

实际连接成功后会创建 7 个 proxy，命名为 `test_tcp_0, test_tcp_1 ... test_tcp_6`

### 监控

目前 frps 服务端支持内存和 Prometheus 两种监控系统。

#### 内存

内存中存储的监控数据主要用于 Dashboard 展示，当在 frps 配置中开启 Dashboard 功能后会默认开启内部的监控。

内存中的监控数据每次重启进程后会清空，监控数据可以通过 Dashboard 的地址发送 HTTP 请求获取，但是目前此 API 尚不规范，不推荐直接使用。

#### Prometheus

由于设计问题，Prometheus 对外提供的查询接口复用了 Dashboard 的地址，所以要使用 Prometheus 监控，必须要首先开启 Dashboard。

在 frps.ini 中启用 Dashboard，并设置 `enable_prometheus = true`，则通过 `http://{dashboard_addr}/metrics` 可以获取到 Prometheus 的监控数据。

### 身份认证

目前 frpc 和 frps 之间支持两种身份验证方式，`token` 和 `oidc`，默认为 `token`。

通过 `frpc.ini` 和 `frps.ini` 的 `[common]` 段落中配置 `authentication_method` 来指定要使用的身份验证方式。

只有通过身份验证的客户端(frpc)才能成功连接 frps。

#### Token

基于 Token 的身份验证方式比较简单，需要在 frpc 和 frps 的 `[common]` 段落中配置上相同的 `token` 参数即可。

#### OIDC

OIDC 是 `OpenID Connect` 的简称，验证流程参考 [Client Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.4)。

启用这一验证方式，参考配置如下：

```ini
# frps.ini
[common]
authentication_method = oidc
oidc_issuer = https://example-oidc-issuer.com/
oidc_audience = https://oidc-audience.com/.default
# frpc.ini
[common]
authentication_method = oidc
oidc_client_id = 98692467-37de-409a-9fac-bb2585826f18 # Replace with OIDC client ID
oidc_client_secret = oidc_secret
oidc_audience = https://oidc-audience.com/.default
oidc_token_endpoint_url = https://example-oidc-endpoint.com/oauth2/v2.0/token
```

#### 参数说明

| 类型                        | 描述                                                         |
| :-------------------------- | :----------------------------------------------------------- |
| authentication_method       | 身份验证方式，token 或 oidc，默认为 token。                  |
| authenticate_heartbeats     | 在每一个心跳包中附加上身份认证信息，客户端服务端需要一致。   |
| authenticate_new_work_conns | 在每次创建工作连接时附加上身份认证信息，客户端服务端需要一致。 |

### web界面

目前 frpc 和 frps 分别内置了相应的 Web 界面方便用户使用。

#### 服务端 Dashboard

服务端 Dashboard 使用户可以通过浏览器查看 frp 的状态以及代理统计信息。

**注：Dashboard 尚未针对大量的 proxy 数据展示做优化，如果出现 Dashboard 访问较慢的情况，请不要启用此功能。**

需要在 frps.ini 中指定 dashboard 服务使用的端口，即可开启此功能：

```ini
# frps.ini
[common]
dashboard_port = 7500
# dashboard 用户名密码，可选，默认为空
dashboard_user = admin
dashboard_pwd = admin
```

打开浏览器通过 `http://[server_addr]:7500` 访问 Dashboard 界面，输入用户名密码 `admin`。

你也可以通过配置 TLS 证书来启用 HTTPS 接口:

```ini
dashboard_tls_mode = true
dashboard_tls_cert_file = server.crt
dashboard_tls_key_file = server.key
```

#### 客户端管理界面

frpc 内置的 Admin UI 可以帮助用户通过浏览器来查询和管理客户端的 proxy 状态和配置。

需要在 frpc.ini 中指定 admin 服务使用的端口，即可开启此功能：

```ini
# frpc.ini
[common]
admin_addr = 127.0.0.1
admin_port = 7400
admin_user = admin
admin_pwd = admin
```

打开浏览器通过 `http://127.0.0.1:7400` 访问 Admin UI。

如果想要在外网环境访问 Admin UI，可以将 7400 端口通过 frp 映射出去即可，但需要重视安全风险。

```ini
# frpc.ini
[admin_ui]
type = tcp
local_port = 7400
remote_port = 7400
```

### 通信安全及优化

#### 加密与压缩

每一个代理都可以选择是否启用加密和压缩的功能。

加密算法采用 aes-128-cfb，压缩算法采用 snappy。

在每一个代理的配置中使用如下参数指定：

```ini
# frpc.ini
[ssh]
type = tcp
local_port = 22
remote_port = 6000
use_encryption = true
use_compression = true
```

通过设置 `use_encryption = true`，将 frpc 与 frps 之间的通信内容加密传输，将会有效防止传输内容被截取。

如果传输的报文长度较长，通过设置 `use_compression = true` 对传输内容进行压缩，可以有效减小 frpc 与 frps 之间的网络流量，加快流量转发速度，但是会额外消耗一些 CPU 资源。

#### TCP 多路复用

客户端和服务器端之间的连接支持多路复用，不再需要为每一个用户请求创建一个连接，使连接建立的延迟降低，并且避免了大量文件描述符的占用，使 frp 可以承载更高的并发数。

该功能默认启用，如需关闭，可以在 frps.ini 和 frpc.ini 中配置，该配置项在服务端和客户端必须一致：

```ini
# frps.ini 和 frpc.ini 中
[common]
tcp_mux = false
```

#### 连接池

默认情况下，当用户请求建立连接后，frps 才会请求 frpc 主动与后端服务建立一个连接。当为指定的代理启用连接池后，frp 会预先和后端服务建立起指定数量的连接，每次接收到用户请求后，会从连接池中取出一个连接和用户连接关联起来，避免了等待与后端服务建立连接以及 frpc 和 frps 之间传递控制信息的时间。

这一功能适合有大量短连接请求时开启。

1. 首先可以在 frps.ini 中设置每个代理可以创建的连接池上限，避免大量资源占用，客户端设置超过此配置后会被调整到当前值：

   ```ini
   # frps.ini
   [common]
   max_pool_count = 5
   ```

2. 在 frpc.ini 中为客户端启用连接池，指定预创建连接的数量：

   ```ini
   # frpc.ini
   [common]
   pool_count = 1
   ```

#### 支持 KCP 协议

底层通信协议支持选择 KCP 协议，相比于 TCP，在弱网环境下传输效率提升明显，但是会有一些额外的流量消耗。

开启 KCP 协议支持：

1. 在 frps.ini 中启用 KCP 协议支持，指定一个 udp 端口用于接收客户端请求：

   ```ini
   # frps.ini
   [common]
   bind_port = 7000
   # kcp 绑定的是 udp 端口，可以和 bind_port 一样
   kcp_bind_port = 7000
   ```

2. 在 frpc.ini 指定需要使用的协议类型，其他代理配置不需要变更：

   ```ini
   # frpc.ini
   [common]
   server_addr = x.x.x.x
   # server_port 指定为 frps 的 kcp_bind_port
   server_port = 7000
   protocol = kcp
   ```

#### 支持 QUIC 协议

底层通信协议支持选择 QUIC 协议，底层采用 UDP 传输，解决了 TCP 上的一些问题，传输效率更高，连接延迟低。

开启 QUIC 协议支持：

1. 在 frps.ini 中启用 QUIC 协议支持，指定一个 udp 端口用于接收客户端请求：

   ```ini
   # frps.ini
   [common]
   bind_port = 7000
   # quic 绑定的是 udp 端口，可以和 bind_port 一样
   quic_bind_port = 7000
   ```

2. 在 frpc.ini 指定需要使用的协议类型，其他代理配置不需要变更：

   ```ini
   # frpc.ini
   [common]
   server_addr = x.x.x.x
   # server_port 指定为 frps 的 quic_bind_port
   server_port = 7000
   protocol = quic
   ```

### 自定义 TLS 协议加密



`use_encryption` 和 `STCP` 等功能能有效防止流量内容在通信过程中被盗取，但是无法判断对方的身份是否合法，存在被中间人攻击的风险。为此 frp 支持 frpc 和 frps 之间的流量通过 TLS 协议加密，并且支持客户端或服务端单向验证，双向验证等功能。

当 `frps.ini` 的 `common` 中 `tls_only = true` 时，表示 server 端只接受 TLS 连接的客户端，这也是 frps 验证 frpc 身份的前提条件。如果 `frps.ini` 的 `common` 中 `tls_trusted_ca_file` 内容是有效的话，那么默认就会开启 `tls_only = true`。

**注意：启用此功能后除 xtcp 且 xtcp 的 protocol 配置为 kcp 外，可以不用再设置 use_encryption 重复加密**

#### TLS 默认开启方式

从 v0.50.0 开始，`tls_enable` 的默认值将会为 true，默认开启 TLS 协议加密。

如果 frps 端没有配置证书，则会使用随机生成的证书来加密流量。

默认情况下，frpc 开启 TLS 加密功能，但是不校验 frps 的证书。

#### frpc 单向校验 frps 身份

```ini
# frpc.ini
[common]
tls_trusted_ca_file = /to/ca/path/ca.crt

# frps.ini
[common]
tls_cert_file = /to/cert/path/server.crt
tls_key_file = /to/key/path/server.key
```

frpc 需要额外加载 ca 证书，frps 需要额外指定 TLS 配置。frpc 通过 ca 证书单向验证 frps 的身份。这就要求 frps 的 `server.crt` 对 frpc 的 ca 是合法的。

合法: 如果证书是 ca 签发的，或者证书是在 ca 的信任链中，那即认为: 该证书对 ca 而言是合法的。

#### frps 单向验证 frpc 的身份

```ini
# frpc.ini
[common]
tls_cert_file = /to/cert/path/client.crt
tls_key_file = /to/key/path/client.key

# frps.ini
[common]
tls_trusted_ca_file = /to/ca/path/ca.crt
```

frpc 需要额外加载 TLS 配置，frps 需要额外加载 ca 证书。frps 通过 ca 证书单向验证 frpc 的身份。这就要求 frpc 的 `client.crt` 对 frps 的 ca 是合法的。

#### 双向验证

```ini
# frpc.ini
[common]
tls_cert_file = /to/cert/path/client.crt
tls_key_file = /to/key/path/client.key
tls_trusted_ca_file = /to/ca/path/ca.crt

# frps.ini
[common]
tls_cert_file = /to/cert/path/server.crt
tls_key_file = /to/key/path/server.key
tls_trusted_ca_file = /to/ca/path/ca.crt
```

双向验证即 frpc 和 frps 通过本地 ca 证书去验证对方的身份。理论上 frpc 和 frps 的 ca 证书可以不同，只要能验证对方身份即可。

#### OpenSSL 生成证书示例

```
x509: certificate relies on legacy Common Name field, use SANs or temporarily enable Common Name matching with GODEBUG=x509ignoreCN=0
```

如果出现上述报错，是因为 go 1.15 版本开始[废弃 CommonName](https://golang.org/doc/go1.15#commonname)，因此推荐使用 SAN 证书。

下面简单示例如何用 openssl 生成 ca 和双方 SAN 证书。

准备默认 OpenSSL 配置文件于当前目录。此配置文件在 linux 系统下通常位于 `/etc/pki/tls/openssl.cnf`，在 mac 系统下通常位于 `/System/Library/OpenSSL/openssl.cnf`。

如果存在，则直接拷贝到当前目录，例如 `cp /etc/pki/tls/openssl.cnf ./my-openssl.cnf`。如果不存在可以使用下面的命令来创建。

```
cat > my-openssl.cnf << EOF
[ ca ]
default_ca = CA_default
[ CA_default ]
x509_extensions = usr_cert
[ req ]
default_bits        = 2048
default_md          = sha256
default_keyfile     = privkey.pem
distinguished_name  = req_distinguished_name
attributes          = req_attributes
x509_extensions     = v3_ca
string_mask         = utf8only
[ req_distinguished_name ]
[ req_attributes ]
[ usr_cert ]
basicConstraints       = CA:FALSE
nsComment              = "OpenSSL Generated Certificate"
subjectKeyIdentifier   = hash
authorityKeyIdentifier = keyid,issuer
[ v3_ca ]
subjectKeyIdentifier   = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints       = CA:true
EOF
```

生成默认 ca:

```
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -subj "/CN=example.ca.com" -days 5000 -out ca.crt
```

生成 frps 证书:

```
openssl genrsa -out server.key 2048

openssl req -new -sha256 -key server.key \
    -subj "/C=XX/ST=DEFAULT/L=DEFAULT/O=DEFAULT/CN=server.com" \
    -reqexts SAN \
    -config <(cat my-openssl.cnf <(printf "\n[SAN]\nsubjectAltName=DNS:localhost,IP:127.0.0.1,DNS:example.server.com")) \
    -out server.csr

openssl x509 -req -days 365 -sha256 \
	-in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
	-extfile <(printf "subjectAltName=DNS:localhost,IP:127.0.0.1,DNS:example.server.com") \
	-out server.crt
```

生成 frpc 的证书:

```
openssl genrsa -out client.key 2048
openssl req -new -sha256 -key client.key \
    -subj "/C=XX/ST=DEFAULT/L=DEFAULT/O=DEFAULT/CN=client.com" \
    -reqexts SAN \
    -config <(cat my-openssl.cnf <(printf "\n[SAN]\nsubjectAltName=DNS:client.com,DNS:example.client.com")) \
    -out client.csr

openssl x509 -req -days 365 -sha256 \
    -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
	-extfile <(printf "subjectAltName=DNS:client.com,DNS:example.client.com") \
	-out client.crt
```

在本例中，server.crt 和 client.crt 都是由默认 ca 签发的，因此他们对默认 ca 是合法的。



### 负载均衡与健康检查



#### 负载均衡

可以将多个相同类型的代理加入到同一个 `group` 中，从而实现负载均衡的能力。

目前支持的代理类型：`tcp`, `http`, `tcpmux`

```ini
# frpc.ini
[test1]
type = tcp
local_port = 8080
remote_port = 80
group = web
group_key = 123

[test2]
type = tcp
local_port = 8081
remote_port = 80
group = web
group_key = 123
```

用户连接 frps 服务器的 80 端口，frps 会将接收到的用户连接随机分发给其中一个存活的 proxy。这样可以在一台 frpc 机器挂掉后仍然有其他节点能够提供服务。

`tcp` 类型代理要求 `group_key` 相同，做权限验证，且 `remote_port` 相同。

`http` 类型代理要求 `group_key`, `custom_domains` 或 `subdomain` 和 `locations` 相同。

#### 健康检查

通过给代理配置健康检查的参数，可以在要反向代理的服务出现故障时，将这个服务从 frps 中摘除，搭配负载均衡的功能，可以用来实现高可用的架构，避免服务单点故障。

在每一个 proxy 的配置下加上 `health_check_type = {type}` 来启用健康检查功能。

`type` 目前可选 `tcp` 和 `http`。

tcp 只要能够建立连接则认为服务正常，http 会发送一个 http 请求，服务需要返回 2xx 的状态码才会被认为正常

tcp 示例配置如下：

```ini
# frpc.ini
[test1]
type = tcp
local_port = 22
remote_port = 6000
# 启用健康检查，类型为 tcp
health_check_type = tcp
# 建立连接超时时间为 3 秒
health_check_timeout_s = 3
# 连续 3 次检查失败，此 proxy 会被摘除
health_check_max_failed = 3
# 每隔 10 秒进行一次健康检查
health_check_interval_s = 10
```

http 示例配置如下：

```ini
# frpc.ini
[web]
type = http
local_ip = 127.0.0.1
local_port = 80
custom_domains = test.yourdomain.com
# 启用健康检查，类型为 http
health_check_type = http
# 健康检查发送 http 请求的 url，后端服务需要返回 2xx 的 http 状态码
health_check_url = /status
health_check_interval_s = 10
health_check_max_failed = 3
health_check_timeout_s = 3
```



### 获取用户真实 IP



#### HTTP X-Forwarded-For

目前只有 `HTTP` 类型的代理支持这一功能，可以通过用户请求的 header 中的 `X-Forwarded-For` 来获取用户真实 IP，默认启用。

#### Proxy Protocol

frp 支持通过 `Proxy Protocol` 协议来传递经过 frp 代理的请求的真实 IP，此功能支持所有以 TCP 为底层协议的类型，不支持 UDP。

`Proxy Protocol` 功能启用后，frpc 在和本地服务建立连接后，会先发送一段 `Proxy Protocol` 的协议内容给本地服务，本地服务通过解析这一内容可以获得访问用户的真实 IP。所以不仅仅是 HTTP 服务，任何的 TCP 服务，只要支持这一协议，都可以获得用户的真实 IP 地址。

需要注意的是，在代理配置中如果要启用此功能，需要本地的服务能够支持 `Proxy Protocol` 这一协议，目前 nginx 和 haproxy 都能够很好的支持。

这里以 `HTTPS` 类型为例:

```ini
# frpc.ini
[web]
type = https
local_port = 443
custom_domains = test.yourdomain.com

# 目前支持 v1 和 v2 两个版本的 proxy protocol 协议。
proxy_protocol_version = v2
```

只需要在代理配置中增加一行 `proxy_protocol_version = v2` 即可开启此功能。

本地的 HTTPS 服务可以通过在 nginx 的配置中启用 `Proxy Protocol` 的解析并将结果设置在 `X-Real-IP` 这个 Header 中就可以在自己的 Web 服务中通过 `X-Real-IP` 获取到用户的真实 IP。

### 客户端

#### 热加载配置文件

当修改了 frpc 中的代理配置，可以通过 frpc reload 命令来动态加载配置文件，通常会在 10 秒内完成代理的更新。

启用此功能需要在 frpc 中启用 admin 端口，用于提供 API 服务。配置如下：

```ini
# frpc.ini
[common]
admin_addr = 127.0.0.1
admin_port = 7400
```

之后执行重启命令：

```
frpc reload -c ./frpc.ini
```

等待一段时间后客户端会根据新的配置文件创建、更新、删除代理。

需要注意的是，[common] 中的参数除了 start 外目前无法被修改。

#### 命令行查看代理状态

frpc 支持通过 `frpc status -c ./frpc.ini` 命令查看代理的状态信息，此功能需要在 frpc 中配置 admin 端口。

#### 通过代理连接 frps

在只能通过代理访问外网的环境内，frpc 支持通过 HTTP 或 SOCKS5 代理和 frps 建立连接。

可以通过设置 `HTTP_PROXY` 系统环境变量或者通过在 frpc 的配置文件中设置 `http_proxy` 参数来使用此功能。

仅在 `protocol = tcp` 时生效。

```ini
# frpc.ini
[common]
server_addr = x.x.x.x
server_port = 7000
http_proxy = http://user:pwd@192.168.1.128:8080
```

将 `http_proxy` 设置为 `socks5://user:pwd@192.168.1.128:8080` 也可以连接到 SOCKS5 代理。

### 服务端管理

#### 端口白名单

为了防止端口被滥用，可以手动指定允许哪些端口被使用，在服务端配置中通过 `allow_ports` 来指定：

```ini
# frps.ini
[common]
allow_ports = 2000-3000,3001,3003,4000-50000
```

`allow_ports` 可以配置允许使用的某个指定端口或者是一个范围内的所有端口，以 `,` 分隔，指定的范围以 `-` 分隔。

#### 端口复用

目前 frps 中的 `vhost_http_port` 和 `vhost_https_port` 支持配置成和 `bind_port` 为同一个端口，frps 会对连接的协议进行分析，之后进行不同的处理。

例如在某些限制较严格的网络环境中，可以将 `bind_port` 和 `vhost_https_port` 都设置为 443。

#### 限速

**代理限速**

目前支持在客户端的代理配置中设置代理级别的限速，限制单个 proxy 可以占用的带宽。

```ini
# frpc.ini
[ssh]
type = tcp
local_port = 22
remote_port = 6000
bandwidth_limit = 1MB
```

在代理配置中增加 `bandwidth_limit` 字段启用此功能，目前仅支持 `MB` 和 `KB` 单位。

限速能力默认在客户端实现，如果希望启用服务端限速，需要额外配置 `bandwidth_limit_mode = server`。



### 客户端插件



默认情况下，frpc 只会转发请求到本地 TCP 或 UDP 端口，也就是通过 `local_ip` 和 `local_port` 指定的本地服务地址。

通过客户端插件的功能将一些简单的本地服务内置在 frpc 中，可以帮助用户在只启动 frpc 的情况下实现原本需要额外启动其他服务才能实现的功能。

在每一个代理的配置中，通过 `plugin` 指定需要使用的插件，插件的配置参数都以 `plugin_` 开头。当启用客户端插件后，`local_ip` 和 `local_port` 不再需要配置。

客户端插件可以被应用在任意类型的代理中，但是需要插件本身的协议能够支持。例如静态文件访问插件可以通过 TCP 或者 HTTP 的代理暴露出去。

使用 `http_proxy` 插件的示例:

```ini
# frpc.ini
[http_proxy]
type = tcp
remote_port = 6000
plugin = http_proxy
plugin_http_user = abc
plugin_http_passwd = abc
```

`plugin_http_user` 和 `plugin_http_passwd` 即为 `http_proxy` 插件可选的配置参数。

#### http_proxy

HTTP 代理插件，用于将内网机器作为 HTTP 代理暴露给其他服务，可以通过此代理访问到此内网机器能够访问到的其他服务。

| 参数               | 可选 | 描述            |
| :----------------- | :--- | :-------------- |
| plugin_http_user   | 是   | HTTP 代理用户名 |
| plugin_http_passwd | 是   | HTTP 代理密码   |

#### socks5

SOCKS5 代理。

| 参数          | 可选 | 描述             |
| :------------ | :--- | :--------------- |
| plugin_user   | 是   | 连接代理的用户名 |
| plugin_passwd | 是   | 连接代理的密码   |

#### static_file

静态文件浏览服务，通过暴露一个简单的 HTTP 服务查看指定的目录下的文件。

| 参数                | 可选 | 描述                                                         |
| :------------------ | :--- | :----------------------------------------------------------- |
| plugin_local_path   | 否   | 要对外暴露的文件目录                                         |
| plugin_strip_prefix | 是   | 用户请求的 URL 路径会被映射到本地文件，如果希望去除用户访问文件的前缀，需要配置此参数 |
| plugin_http_user    | 是   | HTTP BasicAuth 用户名                                        |
| plugin_http_passwd  | 是   | HTTP BasicAuth 密码                                          |

#### unix_domain_socket

代理本地 Unix 域套接字的服务。

| 参数             | 可选 | 描述                   |
| :--------------- | :--- | :--------------------- |
| plugin_unix_path | 否   | 本地 Unix 域套接字地址 |

#### http2https

将本地的 HTTPS 服务以 HTTP 的形式暴露出去。

| 参数                        | 可选 | 描述                                               |
| :-------------------------- | :--- | :------------------------------------------------- |
| plugin_local_addr           | 否   | 本地服务地址                                       |
| plugin_host_header_rewrite  | 是   | 如果配置，发送给本地服务的请求的 Host 字段会被修改 |
| plugin_header_{header name} | 是   | 发送给本地服务的请求会被加上指定的 header 字段     |

#### https2http

将本地的 HTTP 服务以 HTTPS 的形式暴露出去。

| 参数                        | 可选 | 描述                                                         |
| :-------------------------- | :--- | :----------------------------------------------------------- |
| plugin_local_addr           | 否   | 本地服务地址                                                 |
| plugin_crt_path             | 是   | HTTPS 所需的证书文件，如果 crt 和 key 都为空，则使用自动生成的证书 |
| plugin_key_path             | 是   | HTTPS 所需的密钥文件                                         |
| plugin_host_header_rewrite  | 是   | 如果配置，发送给本地服务的请求的 Host 字段会被修改           |
| plugin_header_{header name} | 是   | 发送给本地服务的请求会被加上指定的 header 字段               |

#### https2https

将本地的 HTTPS 服务以 HTTPS 的形式暴露出去。

| 参数                        | 可选 | 描述                                                         |
| :-------------------------- | :--- | :----------------------------------------------------------- |
| plugin_local_addr           | 否   | 本地服务地址                                                 |
| plugin_crt_path             | 是   | HTTPS 所需的证书文件，如果 crt 和 key 都为空，则使用自动生成的证书 |
| plugin_key_path             | 是   | HTTPS 所需的密钥文件                                         |
| plugin_host_header_rewrite  | 是   | 如果配置，发送给本地服务的请求的 Host 字段会被修改           |
| plugin_header_{header name} | 是   | 发送给本地服务的请求会被加上指定的 header 字段               |



### 服务端插件



frp 服务端插件的作用是在不侵入自身代码的前提下，扩展 frp 服务端的能力。

frp 服务端插件会以单独进程的形式运行，并且监听在一个端口上，对外提供 RPC 接口，响应 frps 的请求。

frps 在执行某些操作前，会根据配置向服务端插件发送 RPC 请求，根据插件的响应来执行相应的操作。

#### RPC 请求

服务端插件接收到操作请求后，可以给出三种回应。

- 拒绝操作，需要返回拒绝操作的原因。
- 允许操作，不需要修改操作内容。
- 允许操作，对操作请求进行修改后，返回修改后的内容。

#### 接口

接口路径可以在 frps 配置中为每个插件单独配置，这里以 `/handler` 为例。

Request

```
POST /handler?version=0.1.0&op=Login
{
    "content": {
        ... // 具体的操作信息
    }
}

请求 Header
X-Frp-Reqid: 用于追踪请求
```

Response

非 200 的返回都认为是请求异常。

拒绝执行操作

```
{
    "reject": true,
    "reject_reason": "invalid user"
}
```

允许且内容不需要变动

```
{
    "reject": false,
    "unchange": true
}
```

允许且需要替换操作内容

```
{
    "unchange": "false",
    "content": {
        ... // 替换后的操作信息，格式必须和请求时的一致
    }
}
```

#### 操作类型

目前插件支持管理的操作类型有 `Login`、`NewProxy`、`CloseProxy`、`Ping`、`NewWorkConn` 和 `NewUserConn`。

#### Login

用户登录操作信息

```
{
    "content": {
        "version": <string>,
        "hostname": <string>,
        "os": <string>,
        "arch": <string>,
        "user": <string>,
        "timestamp": <int64>,
        "privilege_key": <string>,
        "run_id": <string>,
        "pool_count": <int>,
        "metas": map<string>string,
        "client_address": <string>
    }
}
```

#### NewProxy

创建代理的相关信息

```
{
    "content": {
        "user": {
            "user": <string>,
            "metas": map<string>string
            "run_id": <string>
        },
        "proxy_name": <string>,
        "proxy_type": <string>,
        "use_encryption": <bool>,
        "use_compression": <bool>,
        "bandwidth_limit": <string>,
        "bandwidth_limit_mode": <string>,
        "group": <string>,
        "group_key": <string>,

        // tcp and udp only
        "remote_port": <int>,

        // http and https only
        "custom_domains": []<string>,
        "subdomain": <string>,
        "locations": <string>,
        "http_user": <string>,
        "http_pwd": <string>,
        "host_header_rewrite": <string>,
        "headers": map<string>string,

        // stcp only
        "sk": <string>,

        // tcpmux only
        "multiplexer": <string>

        "metas": map<string>string
    }
}
```

#### CloseProxy

代理关闭。(仅用于通知)

注意: 当单个 frpc 会注册大量 proxy 时，慎重使用此接口，可能会由于连接数超限而影响服务的可用性。

```
{
    "content": {
        "user": {
            "user": <string>,
            "metas": map<string>string
            "run_id": <string>
        },
        "proxy_name": <string>
    }
}
```

#### Ping

心跳相关信息

```
{
    "content": {
        "user": {
            "user": <string>,
            "metas": map<string>string
            "run_id": <string>
        },
        "timestamp": <int64>,
        "privilege_key": <string>
    }
}
```

#### NewWorkConn

创建工作连接

```
{
    "content": {
        "user": {
            "user": <string>,
            "metas": map<string>string
            "run_id": <string>
        },
        "run_id": <string>
        "timestamp": <int64>,
        "privilege_key": <string>
    }
}
```

#### NewUserConn

创建用户连接 (支持 `tcp`、`stcp`、`https` 和 `tcpmux` 协议)。

```
{
    "content": {
        "user": {
            "user": <string>,
            "metas": map<string>string
            "run_id": <string>
        },
        "proxy_name": <string>,
        "proxy_type": <string>,
        "remote_addr": <string>
    }
}
```

#### frps 中插件配置

```ini
[common]
bind_port = 7000

[plugin.user-manager]
addr = 127.0.0.1:9000
path = /handler
ops = Login

[plugin.port-manager]
addr = https://127.0.0.1:9001
path = /handler
ops = NewProxy
tls_verify = true
```

addr: 插件监听的网络地址，支持 HTTP 和 HTTPS，默认为 HTTP。 path: 插件监听的请求路径。 ops: 插件需要处理的操作列表，多个 op 以英文逗号分隔。 tls_verify: 如果是 HTTPS 协议，支持忽略 TLS 身份验证。

#### 元数据

为了减少 frps 的代码修改，同时提高管理插件的扩展能力，在 frpc 的配置文件中引入自定义元数据的概念。元数据会在调用 RPC 请求时发送给插件。

元数据以 `meta_` 开头，可以配置多个，元数据分为两种，一种配置在 `common` 下，一种配置在各个 `proxy` 中。

```
# frpc.ini
[common]
server_addr = 127.0.0.1
server_port = 7000
user = fake
meta_token = fake
meta_version = 1.0.0

[ssh]
type = tcp
local_port = 22
remote_port = 6000
meta_id = 123
```



### HTTP &HTTPS

#### 修改 Host Header

通常情况下 frp 不会修改转发的任何数据。但有一些后端服务会根据 HTTP 请求 header 中的 Host 字段来展现不同的网站，例如 nginx 的虚拟主机服务，启用 Host Header 的修改功能可以动态修改 HTTP 请求中的 Host 字段。需要注意的是，该功能仅限于 HTTP 类型的代理。

```ini
# frpc.ini
[web]
type = http
local_port = 80
custom_domains = test.yourdomain.com
host_header_rewrite = dev.yourdomain.com
```

原来 HTTP 请求中的 Host 字段 `test.yourdomain.com` 转发到后端服务时会被替换为 `dev.yourdomain.com`。

#### 设置普通 Header

对于类型为 HTTP 的代理，可以设置在转发中动态添加的 Header 参数

```ini
# frpc.ini
[web]
type = http
local_port = 80
custom_domains = test.yourdomain.com
host_header_rewrite = dev.yourdomain.com
header_X-From-Where = frp
```

对于参数配置中所有以 `header_` 开头的参数(支持同时配置多个)，都会被添加到 HTTP 请求的 Header 中，根据如上的配置，会在请求的 Header 中加上 `X-From-Where: frp`。

#### 设置 BasicAuth 鉴权

由于所有客户端共用一个 frps 的 HTTP 服务端口，任何知道你的域名和 URL 的人都能访问到你部署在内网的服务，但是在某些场景下需要确保只有限定的用户才能访问。

frp 支持通过 HTTP Basic Auth 来保护你的 web 服务，使用户需要通过用户名和密码才能访问到你的服务。

该功能目前仅限于 HTTP 类型的代理，需要在 frpc 的代理配置中添加用户名和密码的设置。

```ini
# frpc.ini
[web]
type = http
local_port = 80
custom_domains = test.yourdomain.com
http_user = abc
http_pwd = abc
```

通过浏览器访问 `http://test.yourdomain.com`，需要输入配置的用户名和密码才能访问。

#### 自定义二级域名

在多人同时使用一个 frps 时，通过自定义二级域名的方式来使用会更加方便。

通过在 frps 的配置文件中配置 `subdomain_host`，就可以启用该特性。之后在 frpc 的 http、https 类型的代理中可以不配置 `custom_domains`，而是配置一个 subdomain 参数。

只需要将 `*.{subdomain_host}` 解析到 frps 所在服务器。之后用户可以通过 subdomain 自行指定自己的 web 服务所需要使用的二级域名，通过 `{subdomain}.{subdomain_host}` 来访问自己的 web 服务。

```ini
# frps.ini
[common]
subdomain_host = frps.com
```

将泛域名 `*.frps.com` 解析到 frps 所在服务器的 IP 地址。

```ini
# frpc.ini
[web]
type = http
local_port = 80
subdomain = test
```

frps 和 frpc 都启动成功后，通过 `test.frps.com` 就可以访问到内网的 web 服务。

**注：如果 frps 配置了 `subdomain_host`，则 `custom_domains` 中不能是属于 `subdomain_host` 的子域名或者泛域名。**

同一个 HTTP 或 HTTPS 类型的代理中 `custom_domains` 和 `subdomain` 可以同时配置。

#### 路由

**URL 路由**

frp 支持根据请求的 URL 路径路由转发到不同的后端服务。

通过配置文件中的 locations 字段指定一个或多个 proxy 能够匹配的 URL 前缀(目前仅支持最大前缀匹配，之后会考虑正则匹配)。例如指定 `locations = /news`，则所有 URL 以 `/news` 开头的请求都会被转发到这个服务。

```ini
# frpc.ini
[web01]
type = http
local_port = 80
custom_domains = web.yourdomain.com
locations = /

[web02]
type = http
local_port = 81
custom_domains = web.yourdomain.com
locations = /news,/about
```

按照上述的示例配置后，`web.yourdomain.com` 这个域名下所有以 `/news` 以及 `/about` 作为前缀的 URL 请求都会被转发到 web02，其余的请求会被转发到 web01。

### STCP & SUDP & XTCP & TCPMUX

#### STCP & SUDP

STCP 和 SUDP 的 (S) 的含义是 Secret。其作用是为 TCP 和 UDP 类型的服务提供一种安全访问的能力，避免让端口直接暴露在公网上导致任何人都能访问到。

这两种代理要求在被访问服务的机器上以及要访问的用户的机器上都部署上 frp 的客户端。被访问的服务所在机器叫做服务端，另一端叫做访问端。

frp 会在访问端监听一个端口和服务端的端口做映射。访问端的用户需要提供相同的密钥才能连接成功，从而保证安全性。

#### XTCP

XTCP 的配置方式和 STCP 很类似。但是会采用 P2P 的方式进行打洞穿透，如果成功，后续的流量将不会经过 frps，而是直接通信，不再受到 frps 所在服务器的带宽限制。

由于打洞成功率取决于所处网络的 NAT 类型，所以 XTCP 的可用性和稳定性无法保证。在需要可靠连接的情况下，建议使用 STCP 替代。

当 visitor 配置了 `keep_tunnel_open = true` 时，frpc 会定期检测隧道是否打开，如果没有，则会尝试打洞建立隧道，这样可以始终保持隧道打开，在需要连接对端服务时，可以避免延迟。

默认情况下，visitor 会在接收到用户连接后尝试打洞，如果打洞失败，可以尝试多次建立连接，程序会尝试其他的打洞策略，有可能在多次重试后成功打洞。一旦打洞成功，后续新增连接不必重复打洞，而是可以复用隧道。

**Fallback 机制**

可以通过配置 fallback 到 stcp visitor 实现在打洞失败时，回退到 stcp 建立连接。

示例配置:

```ini
[stcp-visitor]
role = visitor
type = stcp
server_name = stcp-test
sk = abc
bind_port = -1

[xtcp-visitor]
role = visitor
type = xtcp
server_name = xtcp-test
sk = abc
bind_addr = 127.0.0.1
bind_port = 9002
fallback_to = stcp-visitor
fallback_timeout_ms = 200
```

当连接 `127.0.0.1:9002` 超过 200ms p2p 打洞还未成功的话，会回退到使用 stcp-visitor 建立连接。fallback 后，之前触发的打洞操作仍然会继续，一般来说打洞完成需要的耗时会比较长。

如果打洞成功，下次建立新的连接时，将不需要再次打洞，会很快完成连接建立，不会触发 fallback。

需要注意根据访问端和被访问端的延迟情况来合理设置超时时间，以避免超时时间太短，即使打洞成功连接也来不及建立，而一直触发 fallback。

stcp-visitor 的 `bind_port` 设置为 -1 表示不需要监听物理端口，只接受 fallback 的连接即可。

#### TCPMUX

frp 支持将单个端口收到的连接路由到不同的代理，类似 `vhost_http_port` 和 `vhost_https_port`。

目前支持的复用器只有 `httpconnect`。

当在 `frps.ini` 的 `[common]` 中设置 `tcpmux_httpconnect_port`，frps 将会监听在这个端口，接收 HTTP CONNECT 请求。

frps 会根据 HTTP CONNECT 请求中的 host 路由到不同的后端代理。

示例配置如下：

```ini
# frps.ini
[common]
bind_port = 7000
tcpmux_httpconnect_port = 1337
# frpc.ini
[common]
server_addr = x.x.x.x
server_port = 7000

[proxy1]
type = tcpmux
multiplexer = httpconnect
custom_domains = test1
local_port = 80

[proxy2]
type = tcpmux
multiplexer = httpconnect
custom_domains = test2
local_port = 8080
```

通过上面的配置，frps 如果接收到 HTTP CONNECT 请求内容:

```
CONNECT test1 HTTP/1.1\r\n\r\n
```

该连接将会被路由到 proxy1 。

## 完整配置

### 服务端配置

#### 基础配置

| 参数                                 | 类型   | 说明                                               | 默认值       | 可选值                          | 备注                                         |
| :----------------------------------- | :----- | :------------------------------------------------- | :----------- | :------------------------------ | :------------------------------------------- |
| bind_addr                            | string | 服务端监听地址                                     | 0.0.0.0      |                                 |                                              |
| bind_port                            | int    | 服务端监听端口                                     | 7000         |                                 | 接收 frpc 的连接                             |
| kcp_bind_port                        | int    | 服务端监听 KCP 协议端口                            | 0            |                                 | 用于接收采用 KCP 连接的 frpc                 |
| quic_bind_port                       | int    | 服务端监听 QUIC 协议端口                           | 0            |                                 | 用于接收采用 QUIC 连接的 frpc                |
| quic_keepalive_period                | int    | quic 协议 keepalive 间隔，单位: 秒                 | 10           |                                 |                                              |
| quic_max_idle_timeout                | int    | quic 协议的最大空闲超时时间，单位: 秒              | 30           |                                 |                                              |
| quic_max_incoming_streams            | int    | quic 协议最大并发 stream 数                        | 100000       |                                 |                                              |
| proxy_bind_addr                      | string | 代理监听地址                                       | 同 bind_addr |                                 | 可以使代理监听在不同的网卡地址               |
| log_file                             | string | 日志文件地址                                       | ./frps.log   |                                 | 如果设置为 console，会将日志打印在标准输出中 |
| log_level                            | string | 日志等级                                           | info         | trace, debug, info, warn, error |                                              |
| log_max_days                         | int    | 日志文件保留天数                                   | 3            |                                 |                                              |
| disable_log_color                    | bool   | 禁用标准输出中的日志颜色                           | false        |                                 |                                              |
| detailed_errors_to_client            | bool   | 服务端返回详细错误信息给客户端                     | true         |                                 |                                              |
| tcp_mux_keepalive_interval           | int    | tcp_mux 的心跳检查间隔时间                         | 60           |                                 | 单位：秒                                     |
| tcp_keepalive                        | int    | 和客户端底层 TCP 连接的 keepalive 间隔时间，单位秒 | 7200         |                                 | 负数不启用                                   |
| heartbeat_timeout                    | int    | 服务端和客户端心跳连接的超时时间                   | 90           |                                 | 单位：秒                                     |
| user_conn_timeout                    | int    | 用户建立连接后等待客户端响应的超时时间             | 10           |                                 | 单位：秒                                     |
| udp_packet_size                      | int    | 代理 UDP 服务时支持的最大包长度                    | 1500         |                                 | 服务端和客户端的值需要一致                   |
| tls_cert_file                        | string | TLS 服务端证书文件路径                             |              |                                 |                                              |
| tls_key_file                         | string | TLS 服务端密钥文件路径                             |              |                                 |                                              |
| tls_trusted_ca_file                  | string | TLS CA 证书路径                                    |              |                                 |                                              |
| nat_hole_analysis_data_reserve_hours | int    | 打洞策略数据的保留时间                             | 168          |                                 |                                              |

#### 权限验证

| 参数                        | 类型   | 说明                   | 默认值 | 可选值      | 备注                               |
| :-------------------------- | :----- | :--------------------- | :----- | :---------- | :--------------------------------- |
| authentication_method       | string | 鉴权方式               | token  | token, oidc |                                    |
| authenticate_heartbeats     | bool   | 开启心跳消息鉴权       | false  |             |                                    |
| authenticate_new_work_conns | bool   | 开启建立工作连接的鉴权 | false  |             |                                    |
| token                       | string | 鉴权使用的 token 值    |        |             | 客户端需要设置一样的值才能鉴权通过 |
| oidc_issuer                 | string | oidc_issuer            |        |             |                                    |
| oidc_audience               | string | oidc_audience          |        |             |                                    |
| oidc_skip_expiry_check      | bool   | oidc_skip_expiry_check |        |             |                                    |
| oidc_skip_issuer_check      | bool   | oidc_skip_issuer_check |        |             |                                    |

#### 管理配置

| 参数                 | 类型   | 说明                               | 默认值 | 可选值 | 备注                            |
| :------------------- | :----- | :--------------------------------- | :----- | :----- | :------------------------------ |
| allow_ports          | string | 允许代理绑定的服务端端口           |        |        | 格式为 1000-2000,2001,3000-4000 |
| max_pool_count       | int    | 最大连接池大小                     | 5      |        |                                 |
| max_ports_per_client | int    | 限制单个客户端最大同时存在的代理数 | 0      |        | 0 表示没有限制                  |
| tls_only             | bool   | 只接受启用了 TLS 的客户端连接      | false  |        |                                 |

#### Dashboard 监控

| 参数                    | 类型   | 说明                          | 默认值  | 可选值 | 备注                                                         |
| :---------------------- | :----- | :---------------------------- | :------ | :----- | :----------------------------------------------------------- |
| dashboard_addr          | string | 启用 Dashboard 监听的本地地址 | 0.0.0.0 |        |                                                              |
| dashboard_port          | int    | 启用 Dashboard 监听的本地端口 | 0       |        |                                                              |
| dashboard_user          | string | HTTP BasicAuth 用户名         |         |        |                                                              |
| dashboard_pwd           | string | HTTP BasicAuth 密码           |         |        |                                                              |
| dashboard_tls_mode      | bool   | 是否启用 TLS 模式             | false   |        |                                                              |
| dashboard_tls_cert_file | string | TLS 证书文件路径              |         |        |                                                              |
| dashboard_tls_key_file  | string | TLS 密钥文件路径              |         |        |                                                              |
| enable_prometheus       | bool   | 是否提供 Prometheus 监控接口  | false   |        | 需要同时启用了 Dashboard 才会生效                            |
| asserts_dir             | string | 静态资源目录                  |         |        | Dashboard 使用的资源默认打包在二进制文件中，通过指定此参数使用自定义的静态资源 |
| pprof_enable            | bool   | 启动 Go HTTP pprof            | false   |        | 用于应用调试                                                 |

#### HTTP & HTTPS

| 参数               | 类型   | 说明                                            | 默认值 | 可选值 | 备注                                      |
| :----------------- | :----- | :---------------------------------------------- | :----- | :----- | :---------------------------------------- |
| vhost_http_port    | int    | 为 HTTP 类型代理监听的端口                      | 0      |        | 启用后才支持 HTTP 类型的代理，默认不启用  |
| vhost_https_port   | int    | 为 HTTPS 类型代理监听的端口                     | 0      |        | 启用后才支持 HTTPS 类型的代理，默认不启用 |
| vhost_http_timeout | int    | HTTP 类型代理在服务端的 ResponseHeader 超时时间 | 60     |        |                                           |
| subdomain_host     | string | 二级域名后缀                                    |        |        |                                           |
| custom_404_page    | string | 自定义 404 错误页面地址                         |        |        |                                           |

#### TCPMUX

| 参数                    | 类型 | 说明                         | 默认值 | 可选值 | 备注                                       |
| :---------------------- | :--- | :--------------------------- | :----- | :----- | :----------------------------------------- |
| tcpmux_httpconnect_port | int  | 为 TCPMUX 类型代理监听的端口 | 0      |        | 启用后才支持 TCPMUX 类型的代理，默认不启用 |
| tcpmux_passthrough      | bool | 是否透传 CONNECT 请求        | false  |        | 通常在本地服务是 HTTP Proxy 时使用         |

### 客户端配置

#### 基础配置

| 参数                          | 类型   | 说明                                               | 默认值                 | 可选值                          | 备注                                                         |
| :---------------------------- | :----- | :------------------------------------------------- | :--------------------- | :------------------------------ | :----------------------------------------------------------- |
| server_addr                   | string | 连接服务端的地址                                   | 0.0.0.0                |                                 |                                                              |
| server_port                   | int    | 连接服务端的端口                                   | 7000                   |                                 |                                                              |
| nat_hole_stun_server          | string | xtcp 打洞所需的 stun 服务器地址                    | stun.easyvoip.com:3478 |                                 |                                                              |
| connect_server_local_ip       | string | 连接服务端时所绑定的本地 IP                        |                        |                                 |                                                              |
| dial_server_timeout           | int    | 连接服务端的超时时间                               | 10                     |                                 |                                                              |
| dial_server_keepalive         | int    | 和服务端底层 TCP 连接的 keepalive 间隔时间，单位秒 | 7200                   |                                 | 负数不启用                                                   |
| http_proxy                    | string | 连接服务端使用的代理地址                           |                        |                                 | 格式为 {protocol}://user:passwd@192.168.1.128:8080 protocol 目前支持 http、socks5、ntlm |
| log_file                      | string | 日志文件地址                                       | ./frpc.log             |                                 | 如果设置为 console，会将日志打印在标准输出中                 |
| log_level                     | string | 日志等级                                           | info                   | trace, debug, info, warn, error |                                                              |
| log_max_days                  | int    | 日志文件保留天数                                   | 3                      |                                 |                                                              |
| disable_log_color             | bool   | 禁用标准输出中的日志颜色                           | false                  |                                 |                                                              |
| pool_count                    | int    | 连接池大小                                         | 0                      |                                 |                                                              |
| user                          | string | 用户名                                             |                        |                                 | 设置此参数后，代理名称会被修改为 {user}.{proxyName}，避免代理名称和其他用户冲突 |
| dns_server                    | string | 使用 DNS 服务器地址                                |                        |                                 | 默认使用系统配置的 DNS 服务器，指定此参数可以强制替换为自定义的 DNS 服务器地址 |
| login_fail_exit               | bool   | 第一次登陆失败后是否退出                           | true                   |                                 |                                                              |
| protocol                      | string | 连接服务端的通信协议                               | tcp                    | tcp, kcp, quic, websocket, wss  |                                                              |
| quic_keepalive_period         | int    | quic 协议 keepalive 间隔，单位: 秒                 | 10                     |                                 |                                                              |
| quic_max_idle_timeout         | int    | quic 协议的最大空闲超时时间，单位: 秒              | 30                     |                                 |                                                              |
| quic_max_incoming_streams     | int    | quic 协议最大并发 stream 数                        | 100000                 |                                 |                                                              |
| tls_enable                    | bool   | 启用 TLS 协议加密连接                              | true                   |                                 |                                                              |
| tls_cert_file                 | string | TLS 客户端证书文件路径                             |                        |                                 |                                                              |
| tls_key_file                  | string | TLS 客户端密钥文件路径                             |                        |                                 |                                                              |
| tls_trusted_ca_file           | string | TLS CA 证书路径                                    |                        |                                 |                                                              |
| tls_server_name               | string | TLS Server 名称                                    |                        |                                 | 为空则使用 server_addr                                       |
| disable_custom_tls_first_byte | bool   | TLS 不发送 0x17                                    | true                   |                                 | 当为 true 时，不能端口复用                                   |
| tcp_mux_keepalive_interval    | int    | tcp_mux 的心跳检查间隔时间                         | 60                     |                                 | 单位：秒                                                     |
| heartbeat_interval            | int    | 向服务端发送心跳包的间隔时间                       | 30                     |                                 | 建议启用 tcp_mux_keepalive_interval，将此值设置为 -1         |
| heartbeat_timeout             | int    | 和服务端心跳的超时时间                             | 90                     |                                 |                                                              |
| udp_packet_size               | int    | 代理 UDP 服务时支持的最大包长度                    | 1500                   |                                 | 服务端和客户端的值需要一致                                   |
| start                         | string | 指定启用部分代理                                   |                        |                                 | 当配置了较多代理，但是只希望启用其中部分时可以通过此参数指定，默认为全部启用 |
| meta_xxx                      | map    | 附加元数据                                         |                        |                                 | 会传递给服务端插件，提供附加能力                             |

#### 权限验证

| 参数                        | 类型   | 说明                    | 默认值 | 可选值      | 备注                                         |
| :-------------------------- | :----- | :---------------------- | :----- | :---------- | :------------------------------------------- |
| authentication_method       | string | 鉴权方式                | token  | token, oidc | 需要和服务端一致                             |
| authenticate_heartbeats     | bool   | 开启心跳消息鉴权        | false  |             | 需要和服务端一致                             |
| authenticate_new_work_conns | bool   | 开启建立工作连接的鉴权  | false  |             | 需要和服务端一致                             |
| token                       | string | 鉴权使用的 token 值     |        |             | 需要和服务端设置一样的值才能鉴权通过         |
| oidc_client_id              | string | oidc_client_id          |        |             |                                              |
| oidc_client_secret          | string | oidc_client_secret      |        |             |                                              |
| oidc_audience               | string | oidc_audience           |        |             |                                              |
| oidc_scope                  | string | oidc_scope              |        |             |                                              |
| oidc_token_endpoint_url     | string | oidc_token_endpoint_url |        |             |                                              |
| oidc_additional_xxx         | map    | OIDC 附加参数           |        |             | map 结构，key 需要以 `oidc_additional_` 开头 |

#### UI

| 参数         | 类型   | 说明                        | 默认值  | 可选值 | 备注                                                         |
| :----------- | :----- | :-------------------------- | :------ | :----- | :----------------------------------------------------------- |
| admin_addr   | string | 启用 AdminUI 监听的本地地址 | 0.0.0.0 |        |                                                              |
| admin_port   | int    | 启用 AdminUI 监听的本地端口 | 0       |        |                                                              |
| admin_user   | string | HTTP BasicAuth 用户名       |         |        |                                                              |
| admin_pwd    | string | HTTP BasicAuth 密码         |         |        |                                                              |
| asserts_dir  | string | 静态资源目录                |         |        | AdminUI 使用的资源默认打包在二进制文件中，通过指定此参数使用自定义的静态资源 |
| pprof_enable | bool   | 启动 Go HTTP pprof          | false   |        | 用于应用调试                                                 |



### 代理配置

#### 通用配置

通用配置是指不同类型的代理共同使用的一些配置参数。

#### 基础配置

| 参数                   | 类型   | 说明                             | 是否必须 | 默认值 | 可选值                                          | 备注                                                         |
| :--------------------- | :----- | :------------------------------- | :------- | :----- | :---------------------------------------------- | :----------------------------------------------------------- |
| type                   | string | 代理类型                         | 是       | tcp    | tcp, udp, http, https, stcp, sudp, xtcp, tcpmux |                                                              |
| use_encryption         | bool   | 是否启用加密功能                 | 否       | false  |                                                 | 启用后该代理和服务端之间的通信内容都会被加密传输             |
| use_compression        | bool   | 是否启用压缩功能                 | 否       | false  |                                                 | 启用后该代理和服务端之间的通信内容都会被压缩传输             |
| proxy_protocol_version | string | 启用 proxy protocol 协议的版本   | 否       |        | v1, v2                                          | 如果启用，则 frpc 和本地服务建立连接后会发送 proxy protocol 的协议，包含了原请求的 IP 地址和端口等内容 |
| bandwidth_limit        | string | 设置单个 proxy 的带宽限流        | 否       |        |                                                 | 单位为 MB 或 KB，0 表示不限制，如果启用，会作用于对应的 frpc |
| bandwidth_limit_mode   | string | 限流类型，客户端限流或服务端限流 | 否       | client | client, server                                  |                                                              |

#### 本地服务配置

`local_ip` 和 `plugin` 的配置必须配置一个，且只能生效一个，如果配置了 `plugin`，则 `local_ip` 配置无效。

| 参数          |  类型  | 说明           | 是否必须 |  默认值   | 可选值                 | 备注                                                         |
| :------------ | :----: | :------------- | :------: | :-------: | :--------------------- | :----------------------------------------------------------- |
| local_ip      | string | 本地服务 IP    |    是    | 127.0.0.1 |                        | 需要被代理的本地服务的 IP 地址，可以为所在 frpc 能访问到的任意 IP 地址 |
| local_port    |  int   | 本地服务端口   |    是    |           |                        | 配合 local_ip                                                |
| plugin        | string | 客户端插件名称 |    否    |           | 见客户端插件的功能说明 | 用于扩展 frpc 的能力，能够提供一些简单的本地服务，如果配置了 plugin，则 local_ip 和 local_port 无效，两者只能配置一个 |
| plugin_params |  map   | 客户端插件参数 |    否    |           |                        | map 结构，key 需要都以 “plugin_” 开头，每一个 plugin 需要的参数也不一样，具体见客户端插件参数中的内容 |

#### 负载均衡和健康检查

| 参数                    |  类型  | 说明                 | 是否必须 | 默认值 | 可选值   | 备注                                                         |
| :---------------------- | :----: | :------------------- | :------: | :----: | :------- | :----------------------------------------------------------- |
| group                   | string | 负载均衡分组名称     |    否    |        |          | 用户请求会以轮询的方式发送给同一个 group 中的代理            |
| group_key               | string | 负载均衡分组密钥     |    否    |        |          | 用于对负载均衡分组进行鉴权，group_key 相同的代理才会被加入到同一个分组中 |
| health_check_type       | string | 健康检查类型         |    否    |        | tcp,http | 配置后启用健康检查功能，tcp 是连接成功则认为服务健康，http 要求接口返回 2xx 的状态码则认为服务健康 |
| health_check_timeout_s  |  int   | 健康检查超时时间(秒) |    否    |   3    |          | 执行检查任务的超时时间                                       |
| health_check_max_failed |  int   | 健康检查连续错误次数 |    否    |   1    |          | 连续检查错误多少次认为服务不健康                             |
| health_check_interval_s |  int   | 健康检查周期(秒)     |    否    |   10   |          | 每隔多长时间进行一次健康检查                                 |
| health_check_url        | string | 健康检查的 HTTP 接口 |    否    |        |          | 如果 health_check_type 类型是 http，则需要配置此参数，指定发送 http 请求的 url，例如 “/health” |

#### TCP

| 参数        | 类型 | 说明             | 是否必须 | 默认值 | 可选值 | 备注                                               |
| :---------- | :--: | :--------------- | :------: | :----: | :----- | :------------------------------------------------- |
| remote_port | int  | 服务端绑定的端口 |    是    |        |        | 用户访问此端口的请求会被转发到 local_ip:local_port |

#### UDP

| 参数        | 类型 | 说明             | 是否必须 | 默认值 | 可选值 | 备注                                               |
| :---------- | :--: | :--------------- | :------: | :----: | :----- | :------------------------------------------------- |
| remote_port | int  | 服务端绑定的端口 |    是    |        |        | 用户访问此端口的请求会被转发到 local_ip:local_port |

#### HTTP

`custom_domains` 和 `subdomain` 必须要配置其中一个，两者可以同时生效。

| 参数                |   类型   | 说明                           |                是否必须                | 默认值 | 可选值 | 备注                                                         |
| :------------------ | :------: | :----------------------------- | :------------------------------------: | :----: | :----- | :----------------------------------------------------------- |
| custom_domains      | []string | 服务器绑定自定义域名           |   是(和 subdomain 两者必须配置一个)    |        |        | 用户通过 vhost_http_port 访问的 HTTP 请求如果 Host 在 custom_domains 配置的域名中，则会被路由到此代理配置的本地服务 |
| subdomain           |  string  | 自定义子域名                   | 是(和 custom_domains 两者必须配置一个) |        |        | 和 custom_domains 作用相同，但是只需要指定子域名前缀，会结合服务端的 subdomain_host 生成最终绑定的域名 |
| locations           | []string | URL 路由配置                   |                   否                   |        |        | 采用最大前缀匹配的规则，用户请求匹配响应的 location 配置，则会被路由到此代理 |
| route_by_http_user  |  string  | 根据 HTTP Basic Auth user 路由 |                   否                   |        |        |                                                              |
| http_user           |  string  | 用户名                         |                   否                   |        |        | 如果配置此参数，暴露出去的 HTTP 服务需要采用 Basic Auth 的鉴权才能访问 |
| http_pwd            |  string  | 密码                           |                   否                   |        |        | 结合 http_user 使用                                          |
| host_header_rewrite |  string  | 替换 Host header               |                   否                   |        |        | 替换发送到本地服务 HTTP 请求中的 Host 字段                   |
| headers             |   map    | 替换 header                    |                   否                   |        |        | map 中的 key 是要替换的 header 的 key，value 是替换后的内容  |

#### HTTPS

`custom_domains` 和 `subdomain` 必须要配置其中一个，两者可以同时生效。

| 参数           |   类型   | 说明                 |                是否必须                | 默认值 | 可选值 | 备注                                                         |
| :------------- | :------: | :------------------- | :------------------------------------: | :----: | :----- | :----------------------------------------------------------- |
| custom_domains | []string | 服务器绑定自定义域名 |   是(和 subdomain 两者必须配置一个)    |        |        | 用户通过 vhost_http_port 访问的 HTTP 请求如果 Host 在 custom_domains 配置的域名中，则会被路由到此代理配置的本地服务 |
| subdomain      |  string  | 自定义子域名         | 是(和 custom_domains 两者必须配置一个) |        |        | 和 custom_domains 作用相同，但是只需要指定子域名前缀，会结合服务端的 subdomain_host 生成最终绑定的域名 |

#### STCP

| 参数        |   类型   | 说明                    | 是否必须 | 默认值 | 可选值 | 备注                                                         |
| :---------- | :------: | :---------------------- | :------: | :----: | :----- | :----------------------------------------------------------- |
| role        |  string  | 角色                    |    是    | server | server | server 表示服务端                                            |
| sk          |  string  | 密钥                    |    是    |        |        | 服务端和访问端的密钥需要一致，访问端才能访问到服务端         |
| allow_users | []string | 允许访问的 visitor 用户 |    否    |        |        | 默认只允许同一用户下的 visitor 访问，配置为 * 则允许任何 visitor 访问 |

#### SUDP

| 参数        |   类型   | 说明                    | 是否必须 | 默认值 | 可选值         | 备注                                                         |
| :---------- | :------: | :---------------------- | :------: | :----: | :------------- | :----------------------------------------------------------- |
| role        |  string  | 角色                    |    是    | server | server,visitor | server 表示服务端，visitor 表示访问端                        |
| sk          |  string  | 密钥                    |    是    |        |                | 服务端和访问端的密钥需要一致，访问端才能访问到服务端         |
| allow_users | []string | 允许访问的 visitor 用户 |    否    |        |                | 默认只允许同一用户下的 visitor 访问，配置为 * 则允许任何 visitor 访问 |

#### XTCP

| 参数        |   类型   | 说明                    | 是否必须 | 默认值 | 可选值         | 备注                                                         |
| :---------- | :------: | :---------------------- | :------: | :----: | :------------- | :----------------------------------------------------------- |
| role        |  string  | 角色                    |    是    | server | server,visitor | server 表示服务端，visitor 表示访问端                        |
| sk          |  string  | 密钥                    |    是    |        |                | 服务端和访问端的密钥需要一致，访问端才能访问到服务端         |
| allow_users | []string | 允许访问的 visitor 用户 |    否    |        |                | 默认只允许同一用户下的 visitor 访问，配置为 * 则允许任何 visitor 访问 |

#### TCPMUX

`custom_domains` 和 `subdomain` 必须要配置其中一个，两者可以同时生效。

| 参数               |   类型   | 说明                           |                是否必须                | 默认值 | 可选值      | 备注                                                         |
| :----------------- | :------: | :----------------------------- | :------------------------------------: | :----: | :---------- | :----------------------------------------------------------- |
| multiplexer        |  string  | 复用器类型                     |                   是                   |        | httpconnect |                                                              |
| custom_domains     | []string | 服务器绑定自定义域名           |   是(和 subdomain 两者必须配置一个)    |        |             | 用户通过 tcpmux_httpconnect_port 访问的 CONNECT 请求如果 Host 在 custom_domains 配置的域名中，则会被路由到此代理配置的本地服务 |
| subdomain          |  string  | 自定义子域名                   | 是(和 custom_domains 两者必须配置一个) |        |             | 和 custom_domains 作用相同，但是只需要指定子域名前缀，会结合服务端的 subdomain_host 生成最终绑定的域名 |
| route_by_http_user |  string  | 根据 HTTP Basic Auth user 路由 |                   否                   |        |             |                                                              |
| http_user          |  string  | 用户名                         |                   否                   |        |             | 如果配置此参数，通过 HTTP CONNECT 建立连接时需要通过 Proxy-Authorization 附加上正确的身份信息 |
| http_pwd           |  string  | 密码                           |                   否                   |        |             | 结合 http_user 使用                                          |



### visitor 配置

#### 通用配置

通用配置是指不同类型的 visitor 共同使用的一些配置参数。

#### 基础配置

| 参数            | 类型   | 说明                        | 是否必须 | 默认值    | 可选值           | 备注                                                         |
| :-------------- | :----- | :-------------------------- | :------- | :-------- | :--------------- | :----------------------------------------------------------- |
| role            | string | 角色                        | 是       | visitor   | visitor          | visitor 表示访问端                                           |
| server_user     | string | 要访问的 proxy 所属的用户名 | 否       | 当前用户  |                  | 如果为空，则默认为当前用户                                   |
| server_name     | string | 要访问的 proxy 名称         | 是       |           |                  |                                                              |
| type            | string | visitor 类型                | 是       |           | stcp, sudp, xtcp |                                                              |
| sk              | string | 密钥                        | 是       |           |                  | 服务端和访问端的密钥需要一致，访问端才能访问到服务端         |
| use_encryption  | bool   | 是否启用加密功能            | 否       | false     |                  | 启用后该代理和服务端之间的通信内容都会被加密传输             |
| use_compression | bool   | 是否启用压缩功能            | 否       | false     |                  | 启用后该代理和服务端之间的通信内容都会被压缩传输             |
| bind_addr       | string | visitor 监听的本地地址      | 否       | 127.0.0.1 |                  | 通过访问监听的地址和端口，连接到远端代理的服务               |
| bind_port       | int    | visitor 监听的本地端口      | 否       |           |                  | 如果为 -1，表示不需要监听物理端口，通常可以用于作为其他 visitor 的 fallback |

#### XTCP



| 参数                |  类型  | 说明                                     | 是否必须 | 默认值 | 可选值    | 备注                                       |
| :------------------ | :----: | :--------------------------------------- | :------: | :----: | :-------- | :----------------------------------------- |
| keep_tunnel_open    |  bool  | 是否保持隧道打开                         |    否    | false  |           | 如果开启，会定期检查隧道状态并尝试保持打开 |
| max_retries_an_hour |  int   | 每小时尝试打开隧道的次数                 |    否    |   8    |           | 仅在 keep_tunnel_open 为 true 时有效       |
| min_retry_interval  |  int   | 重试打开隧道的最小间隔时间，单位: 秒     |    否    |   90   |           | 仅在 keep_tunnel_open 为 true 时有效       |
| protocol            | string | 隧道底层通信协议                         |    否    |  quic  | quic, kcp |                                            |
| fallback_to         | string | 回退到的其他 visitor 名称                |    否    |        |           |                                            |
| fallback_timeout_ms |  int   | 连接建立超过多长时间后回退到其他 visitor |    否    |        |           |                                            |

