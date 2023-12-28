# Nginx

## 概述

### 安装

常用版本

- Nginx开源版：http://nginx.org/
- Nginx plus 商业版： https://www.nginx.com
- Openresty：http://openresty.org
- Tengine：http://tengine.taobao.org/

安装Nginx开源版

- 下载--上传--解压--进入nginx文件夹

  ```sh
  ./configure --prefix=/usr/local/nginx
  #
  make
  make install
  ```

  - 报错

    ```sh
    checking for OS
    + Linux 3.10.0-693.el7.x86_64 x86_64
    checking for C compiler ... not found
    ./configure: error: C compiler cc is not found
    
    #安装c解析器gcc
    yum install -y gcc
    ```

    ```sh
    ./configure: error: the HTTP rewrite module requires the PCRE library.
    You can either disable the module by using --without-http_rewrite_module 
    option, or install the PCRE library into the system, or build the PCRE library 
    statically from the source with nginx by using --with-pcre=<path> option.
    
    #安装perl
    yum install -y pcre pcre-devel
    ```

    ```sh
    ./configure: error: the HTTP gzip module requires the zlib library.
    You can either disable the module by using --without-http_gzip_module
    option, or install the zlib library into the system, or build the zlib library 
    statically from the source with nginx by using --with-zlib=<path> option.
    
    #安装zlib库
    yum install -y zlib zlib-devel
    ```

- 启动

  ```sh
  cd /usr/local/nginx/sbin
  
  #启动
  ./nginx
  #快速停止
  ./nginx -s stop
  #优雅关闭
  ./nginx -s quit
  #重新加载
  ./nginx -s reload
  ```

- 安装为系统服务

  ```sh
  vim /usr/lib/systemd/system/nginx.service
  ```

  ```sh
  [Unit]
  Description=nginx -  web server
  After=network.target remote-fs.target nss-lookup.target 
  [Service]
  Type=forking
  PIDFile=/usr/local/nginx/logs/nginx.pid
  ExecStartPre=/usr/local/nginx/sbin/nginx -t -c /usr/local/nginx/conf/nginx.conf
  ExecStart=/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
  ExecReload=/usr/local/nginx/sbin/nginx -s reload
  ExecStop=/usr/local/nginx/sbin/nginx -s stop
  ExecQuit=/usr/local/nginx/sbin/nginx -s quit 
  PrivateTmp=true
  [Install]
  WantedBy=multi-user.target
  ```

  ```sh
  #重新加载系统服务
  systemctl daemon-reload
  systemctl start nginx.service
  ps -ef | grep nginx
  systemctl enable nginx.service
  ```

- 访问：[Welcome to nginx!](http://192.168.10.105/)

### 目录结构

- 后缀为_temp的目录存放的都是临时文件
- conf配置文件目录
  - nginx.conf   默认的主配置文件
- html 存放静态文件的默认目录
  - 50x.html   报错50*后的页面
  - index.html  默认首页
- sbin ：存放nginx的主程序

```sh
tree /usr/local/nginx
/usr/local/nginx
├── client_body_temp                 ## POST 大文件暂存目录
├── conf                             ## Nginx所有配置文件的目录
│   ├── fastcgi.conf                 ## fastcgi相关参数的配置文件
│   ├── fastcgi.conf.default         ## fastcgi.conf的原始备份文件
│   ├── fastcgi_params               ## fastcgi的参数文件
│   ├── fastcgi_params.default       
│   ├── koi-utf
│   ├── koi-win
│   ├── mime.types                   ## 媒体类型
│   ├── mime.types.default
│   ├── nginx.conf                   #这是Nginx默认的主配置文件，日常使用和修改的文件
│   ├── nginx.conf.default
│   ├── scgi_params                  ## scgi相关参数文件
│   ├── scgi_params.default  
│   ├── uwsgi_params                 ## uwsgi相关参数文件
│   ├── uwsgi_params.default
│   └── win-utf
├── fastcgi_temp                     ## fastcgi临时数据目录
├── html                             ## Nginx默认站点目录
│   ├── 50x.html                     ## 错误页面优雅替代显示文件，例如出现502错误时会调用此页面
│   └── index.html                   ## 默认的首页文件
├── logs                             ## Nginx日志目录
│   ├── access.log                   ## 访问日志文件
│   ├── error.log                    ## 错误日志文件
│   └── nginx.pid                    ## pid文件，Nginx进程启动后，会把所有进程的ID号写到此文件
├── proxy_temp                       ## 临时目录
├── sbin                             ## Nginx 可执行文件目录
│   └── nginx                        ## Nginx 二进制可执行程序
├── scgi_temp                        ## 临时目录
└── uwsgi_temp                       ## 临时目录
```

### 基本运行原理

用户 --->  通过网络向nginx服务器发送请求（http://192.168.10.105/index.html）

​		---> nginx服务器开启sbin/nginx可执行文件 

​		---> 开启主进程Master，读取并校验配置文件 

​		---> 开启子进程Worker接收请求 

​		---> Worker解析请求，读取文件 

​		---> 做出响应

![](http://minio.botuer.com/study-node/old/typora202207181633125.png)



## 配置文件

### 最小配置

```yml
worker_processes  1; #默认为1，表示开启一个业务进程，和硬件有关，不超过内核数
events {
    worker_connections  1024; #单个业务进程可接受连接数,一般不用改
}
http {
    include       mime.types; #引入mime.types配置文件（定义http mime类型）
    default_type  application/octet-stream; #如果mime类型没匹配上，默认使用二进制流的方式传输
    sendfile        on; #高效网络传输，也就是数据0拷贝
    keepalive_timeout  65;  #保持连接超时的时间
    #虚拟主机配置
    server {
        listen       80; #监听端口号
        server_name  localhost; #主机名
        #匹配路径
        location / {
            root   html; #文件根目录
            index  index.html index.htm; #默认页名称
        }
        error_page   500 502 503 504  /50x.html; #报错后对应页面
        location = /50x.html {
            root   html;
        }
    }
}
```

- **sendfile说明**

  - **未开启时**

    **发出请求 ---> nginx读取所需要的资源，加载到应用程序内存（进行一次拷贝）**

    ​				**---> 发送到网络接口缓存（进行第二次拷贝）**

    **说明：nginx就是个运行在操作系统上的软件，nginx绑定注册一个端口，用户发送请求后，是通过网络接口转发给nginx，nginx接收到用户请求**

    ![image-20220718171036928](http://minio.botuer.com/study-node/old/typora202207181710977.png)

  - **开启后**

    **发出请求 ---> nginx直接向网络接口缓存发送一个sendfile信号(方法中携带一个文件描述符)**

    ​				**---> 网络接口直接读取资源**

    ![image-20220718171100983](http://minio.botuer.com/study-node/old/typora202207181711017.png)

- 虚拟主机说明：原本一台服务器只能对应一个站点，通过虚拟主机技术可以虚拟化成多个站点同时对外提供服务，即配置多个server ，多域名对应一个ip地址，避免资源浪费
  - server_name匹配规则：我们需要注意的是servername匹配分先后顺序，写在前面的匹配上就不会继续往下匹配
    - 完整匹配：**空格隔开，分号结尾**
    - 通配符匹配：如*.botuer.com
    - 通配符后匹配：如vod.*
    - 正则匹配：`~^[0-9]+\.botuer.com$`（~开始正则）

- host文件解析域名：在host文件中添加         ip 域名 域名2
- 公网解析域名
  - 记录类型
    - A 指向IPV4地址  用的最多
    - CNAME 指向另一个域名 用于域名ip可能变的情况
    - NS 将子域名指向其他DNS解析器
    - MS 指向邮件服务器地址
  - 主机记录：设置二级域名，泛域名（通配符）
  - 解析线路：可记录用户来源
  - 记录值：记录类型不同，对应记录值类型不同
    - A 对应 ip地址
    - CNAME 对应 域名
  - TTL：多长时间过期失效，重新解析



### 反向代理

代理：用户发送请求，先通过一个网关，后转发给服务器

正向代理：**客户端---网关---外网**，用户发送的请求地址指向tomcat所在的url，但必须经过网关才能访问到，（客户端和网关互通），网关主动配置

反向代理：**客户端---网关---外网（内网：Nginx---外网服务器），**用户发送的请求地址指向nginx的url，（nginx和服务端互通）

**代理服务器就是网关，nginx就是一个网关**



- proxy_pass http://网址（或url）

**注意：不能代理https协议的网址**

```yml
worker_processes  1; #默认为1，表示开启一个业务进程，和硬件有关，不超过内核数
events {
    worker_connections  1024; #单个业务进程可接受连接数,一般不用改
}
http {
    include       mime.types; #引入mime.types配置文件（定义http mime类型）
    default_type  application/octet-stream; #如果mime类型没匹配上，默认使用二进制流的方式传输
    sendfile        on; #高效网络传输，也就是数据0拷贝
    keepalive_timeout  65;  #保持连接超时的时间
    #虚拟主机配置
    server {
        listen       80; #监听端口号
        server_name  localhost; #主机名
        #匹配路径
        location / {
        		proxy_pass http://atguigu.com/;
            #root   html; #文件根目录
            #index  index.html index.htm; #默认页名称
        }
        error_page   500 502 503 504  /50x.html; #报错后对应页面
        location = /50x.html {
            root   html;
        }
    }
}
```

### 负载均衡

nginx负载均衡：隧道式模型，请求和响应都经过nginx

lvs负载均衡：专业的负载均衡器，内嵌在linux内核中，DR模型，请求经过nginx，响应直接给用户

- proxy_pass http://变量;

- upstream 变量```{ server url1;server url2;...}```

  - 默认轮询，弊端无法保持会话

  - weight=? 权重

  - down 用于崩的服务器不参与分配，基本用不到（需要重新加载配置文件）

  - backup 候补（其他 忙/down 时参与），基本用不到（需要重新加载配置文件）

  - (了解)ip_hash：定向用户转发，同一个ip地址转发同一台服务器，可以保持会话，

    但是用户一旦流动，ip地址可能发生变化

  - (了解)least_conn:最少连接访问

    配置了权重，没有必要配置最少连接

  - (了解)url_hash:定向流量转发，同一个请求地址转发到同一台服务器，根据用户访问的url定向转发请求

    一旦url变化，就无法保持会话（注册一个页面，登录一个页面）

    用于同地址的大量请求资源不在同一服务器

  - (了解)fair:根据后端服务器响应时间转发请求

    某请求资源所在服务器转换机过热，长时间得不到响应，就转发到另一台服务器

    但是这样会给新的服务器带来巨大压力，可能也会崩掉

    而且还需要第三方插件

```yml
worker_processes  1; #默认为1，表示开启一个业务进程，和硬件有关，不超过内核数
events {
    worker_connections  1024; #单个业务进程可接受连接数,一般不用改
}
http {
    include       mime.types; #引入mime.types配置文件（定义http mime类型）
    default_type  application/octet-stream; #如果mime类型没匹配上，默认使用二进制流的方式传输
    sendfile        on; #高效网络传输，也就是数据0拷贝
    keepalive_timeout  65;  #保持连接超时的时间
    
    upstream httpds{
    	server 42.193.100.99 weight=3;
    	server 192.168.10.106 weight=1;
    }
    
    #虚拟主机配置
    server {
        listen       80; #监听端口号
        server_name  localhost; #主机名
        #匹配路径
        location / {
        		proxy_pass http://httpds;
        }
        error_page   500 502 503 504  /50x.html; #报错后对应页面
        location = /50x.html {
            root   html;
        }
    }
}
```

### 动静分离

> 以往的每次发送请求后响应的资源都需要经过nginx
>
> 动静分离：将静态资源部署到nginx服务器上，使得静态资源加载更快

- 配置反向代理

- 配置静态资源（增加一个location）

  - location前缀
    - / 通用匹配，任何请求都会匹配到
    - = 精准匹配，不以指定模式开头
    - ~ 正则匹配，区分大小写
    - ~*正则匹配，不区分大小写
    - ^~不以正则匹配，匹配以指定模式开头的location
  - 所有类型location存在时，“=”匹配  > “^~”匹配  > 正则匹配  > 普通（最大前缀匹配）

  ```yml
  worker_processes  1; #默认为1，表示开启一个业务进程，和硬件有关，不超过内核数
  events {
      worker_connections  1024; #单个业务进程可接受连接数,一般不用改
  }
  http {
      include       mime.types; #引入mime.types配置文件（定义http mime类型）
      default_type  application/octet-stream; #如果mime类型没匹配上，默认使用二进制流的方式传输
      sendfile        on; #高效网络传输，也就是数据0拷贝
      keepalive_timeout  65;  #保持连接超时的时间
      #虚拟主机配置
      server {
          listen       80; #监听端口号
          server_name  localhost; #主机名
          #匹配路径
          location / {
          		proxy_pass http://192.168.10.106;
          }
          #配置静态资源
          location ~*/(css|js|img|fonts|images|error){
              root   /usr/local/nginx/static;
              index  index.html index.htm;
          }
          error_page   500 502 503 504  /50x.html; #报错后对应页面
          location = /50x.html {
              root   html;
          }
      }
  }
  ```

  若被代理的主页目录发生变化，也要重新配置

  ```yml
  worker_processes  1;
  events {
      worker_connections  1024;
  }
  http {
      include       mime.types;
      default_type  application/octet-stream;
      sendfile        on;
      keepalive_timeout  65;
      server {
          listen       80;
          server_name  localhost;
          location / {
          		root   static; #相对路径
              index  index.html index.htm;
          }
          }
          error_page   500 502 503 504  /50x.html;
          location = /50x.html {
              root   html;
          }
      }
  }
  ```

- root与alias“别名”

  - root 指定某资源的根目录，如下访问资源路径=root + /css
  - alias 给某资源别名指定具体路径
  - 使用alias标签的目录块中不能使用rewrite的break（具体原因不明）
  - alias指定的目录后面必须要加上"/"符号！！
  - alias虚拟目录配置中，location匹配的path目录如果后面不带"/"，那么访问的url地址中这个path目录后面加不加"/"不影响访问，访问时它会自动加上"/"；  但是如果location匹配的path目录后面加上"/"，那么访问的url地址中这个path目录必须要加上"/"，访问时它不会自动加上"/"。如果不加上"/"，访问就会失败！
  - root目录配置中，location匹配的path目录后面带不带"/"，都不会影响访问。

  ```yml
  location /css {
    alias   /usr/local/nginx/static/css; 
    index  index.html index.htm;
  }
  ```

### URL重写

> 减少url中的信息暴露，设置URLRewrite

- rewrite	`<regex>`    `<replacement>`    [flag];
  关键字	正则				被替代的URL			flag标记
- 正则用（）括起来，表示变量
- 传入的参数用$,和shell语法类似，如下$1表示第一个有效参数
- 标记
  - break	和java中 类似
  - last       不break，继续执行后面的代码
  - redirect  #返回302临时重定向，浏览器地址会显示跳转后的URL地址 ，显示被代替的地址
  - permanent  #返回301永久重定向，浏览器地址栏会显示跳转后的URL地址，显示被代替的地址
    - 临时重定向，临时跳转，如跳转到登录页面
    - 永久重定向，永久跳转，如http://跳转到https://

```yml
worker_processes  1;
events {
    worker_connections  1024;
}
http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    server {
        listen       80;
        server_name  localhost;
        location / {
        		rewrite ^/([0-9]+).html$  /index.jsp?pageNum=$1    break; #重写URL
        		proxy_pass http://192.168.10.106;
        }
        location ~*/(css|js|img|fonts|images|error){
            root   /usr/local/nginx/static;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

### 内网拦截

> 配置防火墙，使只能通过nginx代理访问到内网，而不能直接访问到内网

- 内网防火墙

  ```sh
  #开启防火墙
  systemctl enable firewalld
  systemctl start firewalld
  #添加规则：指定ip和端口访问
  firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.44.101" port protocol="tcp" port="8080" accept'
  #重载规则
  firewall-cmd --reload
  #查看已配置规则
  firewall-cmd --list-all
  #移除规则
  firewall-cmd --permanent --remove-rich-rule='rule family="ipv4" source address="192.168.44.101" port port="8080" protocol="tcp" accept'
  ```

- 网关（nginx）

  **注意端口号相对应**

  ```yml
  worker_processes  1;
  events {
      worker_connections  1024;
  }
  http {
      include       mime.types;
      default_type  application/octet-stream;
      sendfile        on;
      keepalive_timeout  65;
      upstream myfzjh2 {
          server 192.168.44.102 weight=8 down;
          server 192.168.44.103:8080 weight=2;		#注意端口号相对应
          server 192.168.44.104:8080 weight=1 backup;	#注意端口号相对应
      }
      server {
          listen       80;
          server_name  localhost;
          location / {
          		rewrite ^/([0-9]+).html$  /index.jsp?pageNum=$1 redirect; #重写URL
          		proxy_pass http://myfzjh2; 		
          }
      }
  }
  ```

### 防盗链

- referer在请求头中，第二次访问后才有，记录从哪里跳转来的

- 哪个路径不想被盗链，就放到哪个路径的location内

  - **实际生产中 valid_referers 后跟域名**
  - 只配置域名，不仅引用非法，直接访问也非法（没有referer）
  - none 可直接访问

  ```yml
  worker_processes  1;
  events {
      worker_connections  1024;
  }
  http {
      include       mime.types;
      default_type  application/octet-stream;
      sendfile        on;
      keepalive_timeout  65;
      server {
          listen       80;
          server_name  localhost;
          location / {
              rewrite ^/([0-9]+).html$  /index.jsp?pageNum=$1 redirect; #重写URL
              proxy_pass http://192.168.10.106:8080; #注意端口号相对应
          }
          location ~*/(css|js|img|fonts|images|error){
              valid_referers 192.168.10.105 192.168.10.107 none; #允许访问
              if ($invalid_referer) { #其他不允许的返回401
                  return 401; 
              }
              root   /usr/local/nginx/static;
              index  index.html index.htm;
          }
          error_page   500 502 503 504  /50x.html;
          location = /50x.html {
              root   html;
          }
      }
  }
  ```

- 跳转到错误页面

  ```yml
  worker_processes  1;
  events {
      worker_connections  1024;
  }
  http {
      include       mime.types;
      default_type  application/octet-stream;
      sendfile        on;
      keepalive_timeout  65;
      server {
          listen       80;
          server_name  localhost;
          location / {
          		rewrite ^/([0-9]+).html$  /index.jsp?pageNum=$1 redirect; #重写URL
          		proxy_pass http://192.168.10.106:8080; #注意端口号相对应
          }
          location ~*/(css|js|img|fonts|images|error){
          		valid_referers 192.168.10.105 192.168.10.107 none; #允许访问
              if ($invalid_referer) { #其他不允许的返回401
                  return 401.html; 
              }
              root   /usr/local/nginx/static;
              index  index.html index.htm;
          }
          error_page   500 502 503 504  /50x.html;
          location = /50x.html {
              root   html;
          }
          error_page   401  /401.html; #错误页面
          location = /401.html {
              root   html;
          }
      }
  }
  ```

- 跳转到图片

  ```yml
  worker_processes  1;
  events {
      worker_connections  1024;
  }
  http {
      include       mime.types;
      default_type  application/octet-stream;
      sendfile        on;
      keepalive_timeout  65;
      server {
          listen       80;
          server_name  localhost;
          location / {
          		rewrite ^/([0-9]+).html$  /index.jsp?pageNum=$1 redirect; #重写URL
          		proxy_pass http://192.168.10.106:8080; #注意端口号相对应
          }
          location ~*/(css|js|img|fonts|error){
              root   /usr/local/nginx/static;
              index  index.html index.htm;
          }
          location /images{
          		valid_referers 192.168.10.105 192.168.10.107 none; #允许访问
              if ($invalid_referer) { #其他重写地址
                  rewrite ^/ img/xxx.png  break; 
              }
              root   /usr/local/nginx/static;
              index  index.html index.htm;
          }
          error_page   500 502 503 504  /50x.html;
          location = /50x.html {
              root   html;
          }
      }
  }
  ```

### curl测试工具

- 不带-I 显示的是整个页面（但不含头信息）
- -I（大写i） 访问的资源
- -e 来源

```sh
curl -I http://192.168.44.101/img/logo.png

curl -e "http://baidu.com" -I http://192.168.44.101/img/logo.png
```

### 高可用

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

## HTTPS协议

### 发展

- 对称加密：保证算法不暴露，

  一代：密钥内嵌在服务器中，过于单一不灵活

  二代：在密钥中添加一个因子，每次用户发送数据前，先发送密码因子，但密码因子容易被截获

- 非对称加密：服务器内嵌私钥，用户有公钥，私钥要保证永不暴露，私钥公钥互解，但公钥解不开公钥，用户访问时，需要请求服务器下载公钥

  三代：用户请求下载公钥时，拦截者替他请求，下发后截获公钥，给用户返回假的公钥，用户请求的数据发出后，拦截者用伪造的私钥解密，篡改后发给服务器

- 四代：CA签名

  服务器对下发的公钥进行认证

  - 向CA机构提交信息进行校验，如域名与所有者信息对应或有管理权限，
  - 最主要是对服务器进行一次修改或上传（让服务器所有者在指定目录上传一个指定文件）
  
  --- > 认证完后CA用机构自己的私钥对公钥加密生成证书，下发给用户客户端的不再是公钥，而是CA私钥对公钥加密后的证书
  
  --- > 操作系统内置了CA的公钥，可以解密
  
  --- > 若拦截者拦截下证书，可以解开（和三代类似），但没有CA的私钥不能再加密，只能用自己的私钥加密，发给用户后，用户无法用CA的公钥解密，就无法得到服务器公钥，拦截者下发假公钥失败
  
  --- > 未拦截，用户顺利得到服务器公钥，就可以对数据加密，向服务器传递数据
  
  --- > 拦截者可以解开证书，得到服务器公钥，但是公公解不开加密数据

### 自签名

#### OpenSSL

系统内置

#### 图形化工具 XCA 

基于OpenSSL

下载地址：https://www.hohnstaedt.de/xca/index.php/download

### 在线证书申请

腾讯 ： [我的证书 - SSL 证书 - 控制台 (tencent.com)](https://console.cloud.tencent.com/ssl)

## 快速搭建BBS

- BBS“网络论坛”

- 安装lnmp（Linux、nginx、mysql、PHP）

  - [自动安装 - OneinStack](https://oneinstack.com/auto/)

  - 记录安装位置

    ```sh
    Nginx install dir:              /usr/local/nginx
    
    Database install dir:           /usr/local/mysql
    Database data dir:              /data/mysql
    Database user:                  root
    Database password:              1234
    
    PHP install dir:                /usr/local/php
    Opcache Control Panel URL:      http://10.0.8.13/ocp.php
    
    Index URL:                      http://10.0.8.13/
    ```

  - 开防火墙

  - 申请证书

  - 安装到nginx

    解压上传到conf目录下

    ```yml
    worker_processes  1; #默认为1，表示开启一个业务进程，和硬件有关，不超过内核数
    events {
        worker_connections  1024; #单个业务进程可接受连接数,一般不用改
    }
    http {
        include       mime.types; #引入mime.types配置文件（定义http mime类型）
        default_type  application/octet-stream; #如果mime类型没匹配上，默认使用二进制流的方式传输
        sendfile        on; #高效网络传输，也就是数据0拷贝
        keepalive_timeout  65;  #保持连接超时的时间
        #虚拟主机配置
        server {
            listen       443 ssl; #https默认端口号
            server_name  localhost; #主机名/域名
            
            ssl_certificate 			xxxx.pem;
            ssl_certificate_key 	xxxx.key;
        }
        server {
            listen       80; #监听端口号
            server_name  localhost; #主机名
            #匹配路径
            location / {
                root   html; #文件根目录
                index  index.html index.htm; #默认页名称
            }
            error_page   500 502 503 504  /50x.html; #报错后对应页面
            location = /50x.html {
                root   html;
            }
        }
    }
    ```

  - discuz下载上传解压到html目录下

  - 访问：http://42.193.100.99/upload

  - https://42.193.100.99/upload下是访问不了的，nginx中只有80端口配置了匹配路径，故需要把匹配路径全部剪贴到443端口的sercer中，对80端口的server进行重定向

    ```yml
    server {
        listen       80; #监听端口号
        server_name  localhost; #主机名
       	return 301 https://$server_name$request_uri;
        root   html;
        
    }
    ```

  - 环境检查报错，增加权限

    ```
    chmod -R 777 /usr/local/nginx/html/upload/
    ```

    
