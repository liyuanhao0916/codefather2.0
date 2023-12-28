---
isOriginal: true
category: 
    - 运维
    - Nginx
tag: 
  - 变量
  - 指令
  - Lua
  - 多级缓存
  - 二级缓存
  - 三级缓存
---
# Nginx 进阶

## 变量

## 指令

### if

条件表达式规则

- 检查变量为`空`或`0`，直接使用
- 与字符串匹配，使用`=`（不是==哦）和`!=`
- 与正则表达式匹配
  - 大小写敏感，使用` ~`和`!~`
  - 不敏感，使用` ~*`和`!~*`
- 检查文件是否存在，使用`-f`和`!-f`
- 检查目录是否存在，使用`-d`和`!-d`
- 检查文件、目录、软链接是否存在，使用`-e`和`!-e`
- 检查是否为可执行文件，使用`-x`和`!-x`





## Lua

在 Openresty Nginx 使用

### 命令

三种方式

- `*_by_lua`指令是阻塞的，会等待Lua代码执行完成。
- `*_by_lua_block`指令允许使用多行Lua代码块。
- `*_by_lua_file`指令允许将Lua代码放置在外部文件中。（推荐）

下面以`*_by_lua`为例

- `set_by_lua $variable '<lua-script>'`：在 Nginx 变量中设置 Lua 脚本计算的值。这个指令运行在 rewrite 阶段，可以用来创建复杂的变量值。

- `content_by_lua`：完全取代 Nginx 内部的内容处理器，生成 HTTP 响应的内容。这个指令运行在 content 阶段，**理论上，都可以写在这里**
- `rewrite_by_lua`：在 rewrite 阶段执行 Lua 脚本，可以用来修改请求或实现复杂的重定向逻辑。
- `access_by_lua` ：在访问控制阶段执行 Lua 脚本，可以用来执行基于复杂规则的访问控制（验证请求权限、限制访问等）。
- `header_filter_by_lua` ：在发送响应头之前执行 Lua 脚本，可以用来修改响应头。
- `body_filter_by_lua`：在发送响应体时执行 Lua 脚本，可以用来修改响应体内容。
- `log_by_lua`：在日志模块执行 Lua 脚本，可以用来执行自定义日志记录逻辑。
- `init_by_lua`：在 Nginx 主进程启动时执行 Lua 脚本，用于初始化全局 Lua 环境。
- `init_worker_by_lua`：在 Nginx 工作进程启动时执行 Lua 脚本，可以用来初始化每个工作进程的 Lua 环境
- `balancer_by_lua` ：在负载均衡阶段执行 Lua 脚本，可以用来执行复杂的负载均衡逻辑



> 这些指令通常不能和标准的 Nginx 模块指令混用
>
> - content_by_lua 与 proxy_pass、memcached_pass、return等
> - rewrite_by_lua  会覆盖 rewrite
> - access_by_lua 与 allow、deny

```nginx
location /lua {
    default_type text/html;
    content_by_lua '
       		ngx.say("<p>Hello, World!</p>")
     ';
}
```

### Nginx 集成

ngx_http_lua_module模块  有60多个指令(Directive)，140多个API

**请求处理**

- `ngx.req.set_uri(uri, jump)`设置当前请求的 URI。`jump` 参数为 true 时，将会内部跳转到新的 URI。
- 

## 日志

> ### lua-nginx-module
>
> ## 创建配置文件lua.conf
>
> ```nginx
> server {
>      listen       80;
>      server_name  localhost;
> 
> location /lua {
> 
>      default_type text/html;
> 
>      content_by_lua_file conf/lua/hello.lua;
> 
>       }
> }
> ```
>
> 
>
> ## 在Nginx.conf下引入lua配置
>
> `include       lua.conf;`
>
> ## 创建外部lua脚本
>
> `conf/lua/hello.lua`
>
> 内容：
>
> `ngx.say("<p>Hello, World!</p>")`
>
> ## 获取Nginx uri中的单一变量
>
> ```nginx
>   location /nginx_var {
> 
>        default_type text/html;
> 
>       content_by_lua_block {
> 
>           ngx.say(ngx.var.arg_a)
> 
>       }
>   }
> ```
>
> 
>
> ## 获取Nginx uri中的所有变量
>
> ```lua
> local uri_args = ngx.req.get_uri_args()  
> 
> for k, v in pairs(uri_args) do  
> 
>  if type(v) == "table" then  
> 
>      ngx.say(k, " : ", table.concat(v, ", "), "<br/>")  
> 
>  else  
> 
>      ngx.say(k, ": ", v, "<br/>")  
> 
>  end  
> end
> ```
>
> 
>
> ## 在处理http请求时还可以使用
>
> - set_by_lua
>
> 修改nginx变量
>
> - rewrite_by_lua
>
> 修改uri
>
> - access_by_lua
>
> 访问控制
>
> - header_filter_by_lua
>
> 修改响应头
>
> - boy_filter_by_lua
>
> 修改响应体
>
> - log_by_lua
>
> 日志
>
> ## 代码热部署
>
> ```
> lua_code_cache off
> ```
>
> 
>
> 
>
> 
>
> ## 获取Nginx请求头信息
>
> ```lua
> local headers = ngx.req.get_headers()                         
> 
> ngx.say("Host : ", headers["Host"], "<br/>")  
> 
> ngx.say("user-agent : ", headers["user-agent"], "<br/>")  
> 
> ngx.say("user-agent : ", headers.user_agent, "<br/>")
> 
> for k,v in pairs(headers) do  
> 
>     if type(v) == "table" then  
> 
>         ngx.say(k, " : ", table.concat(v, ","), "<br/>")  
> 
>     else  
> 
>         ngx.say(k, " : ", v, "<br/>")  
> 
>     end  
> 
> end  
> ```
>
> 
>
> 
>
> ## 获取post请求参数
>
> ```lua
> ngx.req.read_body()  
> 
> ngx.say("post args begin", "<br/>")  
> 
> local post_args = ngx.req.get_post_args()  
> 
> for k, v in pairs(post_args) do  
> 
>     if type(v) == "table" then  
> 
>         ngx.say(k, " : ", table.concat(v, ", "), "<br/>")  
> 
>     else  
> 
>         ngx.say(k, ": ", v, "<br/>")  
> 
>     end  
> end
> ```
>
> ## http协议版本
>
> ```lua
> ngx.say("ngx.req.http_version : ", ngx.req.http_version(), "<br/>")
> ```
>
> ## 请求方法
>
> ```lua
> ngx.say("ngx.req.get_method : ", ngx.req.get_method(), "<br/>")  
> ```
>
> ## 原始的请求头内容  
>
> ```lua
> ngx.say("ngx.req.raw_header : ",  ngx.req.raw_header(), "<br/>")  
> ```
>
> 
>
> ## body内容体  
>
> ```lua
> ngx.say("ngx.req.get_body_data() : ", ngx.req.get_body_data(), "<br/>")
> ```
>
> 
>
> ### Nginx缓存
>
> ## Nginx全局内存缓存
>
> ```lua
> lua_shared_dict shared_data 1m;
> 
> local shared_data = ngx.shared.shared_data  
> 
> 
> 
> local i = shared_data:get("i")  
> 
> if not i then  
> 
>     i = 1  
> 
>     shared_data:set("i", i)  
> 
>     ngx.say("lazy set i ", i, "<br/>")  
> end  
> 
> 
> i = shared_data:incr("i", 1)  
> 
> ngx.say("i=", i, "<br/>")
> ```
>
> 
>
> ## lua-resty-lrucache
>
> Lua 实现的一个简单的 LRU 缓存，适合在 Lua 空间里直接缓存较为复杂的 Lua 数据结构：它相比 ngx_lua 共享内存字典可以省去较昂贵的序列化操作，相比 memcached 这样的外部服务又能省去较昂贵的 socket 操作
>
> https://github.com/openresty/lua-resty-lrucache
>
> 引用lua文件
>
> ```
> 	            content_by_lua_block {
>                 require("my/cache").go()
>             }
> ```
>
> 
>
> 
>
> 自定义函数
>
> ```
> local _M = {}
> 
> 
> lrucache = require "resty.lrucache"
> 
> c, err = lrucache.new(200)  -- allow up to 200 items in the cache
> ngx.say("count=init")
> 
> 
> if not c then
>     error("failed to create the cache: " .. (err or "unknown"))
> end
> 
> function _M.go()
> 
> count = c:get("count")
> 
> 
> c:set("count",100)
> ngx.say("count=", count, " --<br/>")
> 
> 
> if not count then  
> 
> 
>     c:set("count",1)
> 
>     ngx.say("lazy set count ", c:get("count"), "<br/>")  
> 
> else
> 
> 
> c:set("count",count+1)
> 
> 
> 
> ngx.say("count=", count, "<br/>")
> end
> 
> 
> end
> return _M
> 
> 
> ```
>
> 打开lua_code_cache
>
> 
>
> ### lua-resty-redis访问redis
>
> https://github.com/openresty/lua-resty-redis
>
> ## 常用方法
>
> ```lua
> local res, err = red:get("key")
> 
> local res, err = red:lrange("nokey", 0, 1)
> 
> ngx.say("res:",cjson.encode(res))
> ```
>
> 
>
> ## 创建连接
>
> ```lua
> red, err = redis:new()
> 
> ok, err = red:connect(host, port, options_table?)
> ```
>
> 
>
> ## timeout
>
> ```lua
> red:set_timeout(time)
> ```
>
> ## keepalive
>
> ```lua
> red:set_keepalive(max_idle_timeout, pool_size)
> ```
>
> 
>
> 
>
> ## close
>
> ```
> ok, err = red:close()
> ```
>
> 
>
> ## pipeline
>
> ```nginx
> red:init_pipeline()
> 
> results, err = red:commit_pipeline()
> ```
>
> ## 认证
>
> ```nginx
>     local res, err = red:auth("foobared")
> 
>     if not res then
> 
>         ngx.say("failed to authenticate: ", err)
> 
>         return
> end
> ```
>
> 
>
> ```
>   local redis = require "resty.redis"
>                 local red = redis:new()
> 
>                 red:set_timeouts(1000, 1000, 1000) -- 1 sec
> 
>   local ok, err = red:connect("127.0.0.1", 6379)
>  if not ok then
>                     ngx.say("failed to connect: ", err)
>                     return
>                 end
> 
>                 ok, err = red:set("dog", "an animal")
>                 if not ok then
>                     ngx.say("failed to set dog: ", err)
>                     return
>                 end
> 
>                 ngx.say("set result: ", ok)
> 
>                 local res, err = red:get("dog")
>                 if not res then
>                     ngx.say("failed to get dog: ", err)
>                     return
>                 end
> 
>                 if res == ngx.null then
>                     ngx.say("dog not found.")
>                     return
>                 end
> 
> 
>               ngx.say("dog: ", res)
> ```
>
> 
>
> ## redis-cluster支持
>
> https://github.com/steve0511/resty-redis-cluster
>
> 
>
> ### redis2-nginx-module 
>
> redis2-nginx-module是一个支持 Redis 2.0 协议的 Nginx upstream 模块，它可以让 Nginx 以非阻塞方式直接防问远方的 Redis 服务，同时支持 TCP 协议和 Unix Domain Socket 模式，并且可以启用强大的 Redis 连接池功能。
>
> ## test
>
> ```nginx
> location = /foo {
> 
> default_type text/html;
> 
>      redis2_query auth 123123;
> 
>      set $value 'first';
> 
>      redis2_query set one $value;
> 
>      redis2_pass 192.168.199.161:6379;
> 
>  }
> ```
>
> 
>
> 
>
> ## get
>
> ```nginx
> location = /get {
> 
> default_type text/html;
> 
>      redis2_pass 192.168.199.161:6379;
> 
>      redis2_query auth 123123;
> 
>      set_unescape_uri $key $arg_key;  # this requires ngx_set_misc
> 
>      redis2_query get $key;
> 
> }
> ```
>
> 
>
> 
>
> ## set
>
> ```nginx
> # GET /set?key=one&val=first%20value
> 
> location = /set {
> 
> default_type text/html;
> 
> redis2_pass 192.168.199.161:6379;
> 
> redis2_query auth 123123;
> 
> 
>      set_unescape_uri $key $arg_key;  # this requires ngx_set_misc
> 
>      set_unescape_uri $val $arg_val;  # this requires ngx_set_misc
> 
>      redis2_query set $key $val;
> 
>  }
> ```
>
> 
>
> 
>
> ## pipeline
>
> 
>
> ```nginx
>      set $value 'first';
> 
>      redis2_query set one $value;
> 
>      redis2_query get one;
> 
>      redis2_query set one two;
> 
>      redis2_query get one;
> 
> redis2_query del key1;
> ```
>
> ## list
>
> ```lua
>     redis2_query lpush key1 C;
> 
>     redis2_query lpush key1 B;
> 
>     redis2_query lpush key1 A;
> 
> redis2_query lrange key1 0 -1;
> ```
>
> 
>
> 
>
> ## 集群
>
> ```nginx
> upstream redis_cluster {
> 
>      server 192.168.199.161:6379;
> 
>      server 192.168.199.161:6379;
> 
>  }
> 
> location = /redis {
> 
> default_type text/html;
> 
>          redis2_next_upstream error timeout invalid_response;
> 
>          redis2_query get foo;
> 
>          redis2_pass redis_cluster;
>    }
> ```
>
> 
>
> ### lua-resty-mysql
>
> 
>
>  https://github.com/openresty/lua-resty-mysql
>
>  ```
> local mysql = require "resty.mysql"
>                 local db, err = mysql:new()
>                 if not db then
>                     ngx.say("failed to instantiate mysql: ", err)
>                     return
>                 end
> 
>                 db:set_timeout(1000) -- 1 sec
> 
> 
>                 local ok, err, errcode, sqlstate = db:connect{
>                     host = "192.168.44.211",
>                     port = 3306,
>                     database = "zhangmen",
>                     user = "root",
>                     password = "111111",
>                     charset = "utf8",
>                     max_packet_size = 1024 * 1024,
>                 }
> 
> 
>                 ngx.say("connected to mysql.<br>")
> 
> 
> 
>                 local res, err, errcode, sqlstate = db:query("drop table if exists cats")
>                 if not res then
>                     ngx.say("bad result: ", err, ": ", errcode, ": ", sqlstate, ".")
>                     return
>                 end
> 
> 
>                 res, err, errcode, sqlstate =
>                     db:query("create table cats "
>                              .. "(id serial primary key, "
>                              .. "name varchar(5))")
>                 if not res then
>                     ngx.say("bad result: ", err, ": ", errcode, ": ", sqlstate, ".")
>                     return
>                 end
> 
>                 ngx.say("table cats created.")
> 
> 
> 
>                 res, err, errcode, sqlstate =
>                     db:query("select * from t_emp")
>                 if not res then
>                     ngx.say("bad result: ", err, ": ", errcode, ": ", sqlstate, ".")
>                     return
>                 end
> 
>                 local cjson = require "cjson"
>                 ngx.say("result: ", cjson.encode(res))
> 
> 
>                 local ok, err = db:set_keepalive(10000, 100)
>                 if not ok then
>                     ngx.say("failed to set keepalive: ", err)
>                     return
>                 end
> 
> 
>  ```
>
> ## 模板实时渲染 lua-resty-template
>
> https://github.com/bungle/lua-resty-template
>
> 如果学习过JavaEE中的servlet和JSP的话，应该知道JSP模板最终会被翻译成Servlet来执行；
>
> 而lua-resty-template模板引擎可以认为是JSP，其最终会被翻译成Lua代码，然后通过ngx.print输出。   
>
> lua-resty-template大体内容有： 
>
> l   模板位置：从哪里查找模板； 
>
> l   变量输出/转义：变量值输出； 
>
> l   代码片段：执行代码片段，完成如if/else、for等复杂逻辑，调用对象函数/方法； 
>
> l   注释：解释代码片段含义； 
>
> l   include：包含另一个模板片段； 
>
> l   其他：lua-resty-template还提供了不需要解析片段、简单布局、可复用的代码块、宏指令等支持。
>
> 基础语法
>
> l   {(include_file)}：包含另一个模板文件；
>
> l   {* var *}：变量输出；
>
> l   {{ var }}：变量转义输出；
>
> l   {% code %}：代码片段；
>
> l   {# comment #}：注释；
>
> l   {-raw-}：中间的内容不会解析，作为纯文本输出；
>
> ### lua代码热加载
>
> 在http模块中加入
>
> ```
> lua_code_cache off;
> ```
>
> reload后Nginx会提示影响性能，记得在生产环境中关掉。
>
>
> ### 测试
>
> ### 一、初始化
>
> ```
> -- Using template.new
> local template = require "resty.template"
> local view = template.new "view.html"
> view.message = "Hello, World!"
> view:render()
> 
> -- Using template.render
> -- template.render("view.html", { message = "Hel11lo, Worl1d!" })
> 
> 
> ```
>
> ### 二、执行函数，得到渲染之后的内容
>
> ```
> local func = template.compile("view.html")  
> 
> local content = func(context)  
> 
> ngx.say("xx:",content) 
> ```
>
> ## 模板文件存放位置
>
> ### nginx.conf中配置
>
> ```
> set $template_root /usr/local/openresty/nginx/tmp;
> ```
>
> 
>
> ### resty.template.html
>
> ```lua
> local template = require("resty.template")
> local html = require "resty.template.html"
> 
> template.render([[
> <ul>
> {% for _, person in ipairs(context) do %}
>     {*html.li(person.name)*} --
> {% end %}
> </ul>
> <table>
> {% for _, person in ipairs(context) do %}
>     <tr data-sort="{{(person.name or ""):lower()}}">
>         {*html.td{ id = person.id }(person.name)*}
>     </tr>
> {% end %}
> </table>]], {
>     { id = 1, name = "Emma"},
>     { id = 2, name = "James" },
>     { id = 3, name = "Nicholas" },
>     { id = 4 }
> })
> 
> ```
>
> ### 模板内容
>
> ```html
> <!DOCTYPE html>
> <html>
> <body>
>   <h1>{{message}}</h1>
> </body>
> </html>
> 
> ```
>
> ### 多值传入
>
> ```lua
> template.caching(false)
> local template = require("resty.template")
> local context = {
>     name = "lucy",
>     age = 50,
> }
> template.render("view.html", context)
> 
> ```
>
> ### 模板内容
>
> ```lua
> <!DOCTYPE html>
> <html>
> <body>
>   <h1>name:{{name}}</h1>
>   <h1>age:{{age}}</h1>
> </body>
> </html>
> 
> ```
>
> 
>
> ### 模板管理与缓存
>
> 模板缓存：默认开启，开发环境可以手动关闭
>
> ```template.caching(true)```
>
> 模板文件需要业务系统更新与维护，当模板文件更新后，可以通过模板版本号或消息通知Openresty清空缓存重载模板到内存中
>
> `template.cache = {}`
>
> 
>
> 
>
> ### 完整页面
>
> 
>
> ```lua
> local template = require("resty.template")
> template.caching(false)
> local context = {
>     title = "测试",
>     name = "lucy",
>     description = "<script>alert(1);</script>",
>     age = 40,
>     hobby = {"电影", "音乐", "阅读"},
>     score = {语文 = 90, 数学 = 80, 英语 = 70},
>     score2 = {
>         {name = "语文", score = 90},
>         {name = "数学", score = 80},
>         {name = "英语", score = 70},
>     }
> }
> 
> template.render("view.html", context)
> 
> ```
>
> ### 模板
>
> ```html
> {(header.html)}  
>    <body>  
>       {# 不转义变量输出 #}  
>       姓名：{* string.upper(name) *}<br/>  
>       {# 转义变量输出 #}  
>       简介：{{description}}
>            简介：{* description *}<br/>  
>       {# 可以做一些运算 #}  
>       年龄: {* age + 10 *}<br/>  
>       {# 循环输出 #}  
>       爱好：  
>       {% for i, v in ipairs(hobby) do %}  
>          {% if v == '电影' then  %} - xxoo
> 
>               {%else%}  - {* v *} 
> {% end %}  
> 
>       {% end %}<br/>  
> 
>       成绩：  
>       {% local i = 1; %}  
>       {% for k, v in pairs(score) do %}  
>          {% if i > 1 then %}，{% end %}  
>          {* k *} = {* v *}  
>          {% i = i + 1 %}  
>       {% end %}<br/>  
>       成绩2：  
>       {% for i = 1, #score2 do local t = score2[i] %}  
>          {% if i > 1 then %}，{% end %}  
>           {* t.name *} = {* t.score *}  
>       {% end %}<br/>  
>       {# 中间内容不解析 #}  
>       {-raw-}{(file)}{-raw-}  
> {(footer.html)}  
> 
> ```
>
> 
>
> 
>
> 
>
> ### layout 布局统一风格
>
> 使用模板内容嵌套可以实现全站风格同一布局
>
> ## lua
>
> `local template = require "resty.template"`
>
> 一、
>
> ```
> local layout   = template.new "layout.html"
> 
> layout.title   = "Testing lua-resty-template"
> 
> layout.view    = template.compile "view.html" { message = "Hello, World!" }
> 
> layout:render()
> ```
>
> 
>
> 
>
> 二、
>
> ```
> template.render("layout.html", {
> 
>   title = "Testing lua-resty-template",
> 
>   msg = "type=2",
> 
>   view  = template.compile "view.html" { message = "Hello, World!" }
> 
> })
> ```
>
> 
>
> 
>
> 三、
>
> 此方式重名变量值会被覆盖
>
> ```
> local view     = template.new("view.html", "layout.html")
> 
> view.title     = "Testing lua-resty-template"
> 
> view.msg = "type=3"
> 
> view.message   = "Hello, World!"
> 
> view:render()
> ```
>
> 
>
> 
>
> 四、
>
> 可以区分一下
>
> ```
> local layout   = template.new "layout.html"
> 
> layout.title   = "Testing lua-resty-template"
> 
> layout.msg = "type=4"
> 
> local view     = template.new("view.html", layout)
> 
> view.message   = "Hello, World!"
> 
> view:render()
> ```
>
> 
>
> 
>
> 
>
> ## layout.html
>
> ```
> <!DOCTYPE html>
> 
> <html>
> 
> <head>
> 
> ​    <title>{{title}}</title>
> 
> </head>
> 
> <h1>layout</h1>
> 
> <body>
> 
> ​    {*view*}
> 
> </body>
> 
> </html>
> ```
>
> 
>
> 
>
> ## view.html·
>
> `msg:{{message}}`
>
> 
>
> ## 多级嵌套
>
> lua
>
> ```
> local view     = template.new("view.html", "layout.html")
> 
> view.title     = "Testing lua-resty-template"
> 
> view.message   = "Hello, World!"
> 
> view:render()
> 
> view.html
> 
> {% layout="section.html" %}
> ```
>
> 
>
> 
>
> <h1>msg:{{message}}</h1>
>
> section.html
>
> <div
> id="section">
>
> 
>
>
> ​    {*view*} - sss
>
> </div>
>
> layout.html
>
> <!DOCTYPE html>
>
> 
>
>
> <html>
>
> <head>
>
> 
>
>
> ​    <title>{{title}}</title>
>
> </head>
>
> <h1>layout {{msg}}</h1>
>
> <body>
>
> ​    {*view*}
>
> </body>
>
> </html>
>
> 
>
> 
>
> ### Redis缓存+mysql+模板输出
>
> lua
>
> ```
>   cjson = require "cjson"
> sql="select * from t_emp"
> 
> 
> local redis = require "resty.redis"
>                 local red = redis:new()
> 
>                 red:set_timeouts(1000, 1000, 1000) -- 1 sec
> 
>   local ok, err = red:connect("127.0.0.1", 6379)
>  if not ok then
>                     ngx.say("failed to connect: ", err)
>                     return
>                 end
> 
> 
> 
>                 local res, err = red:get(sql)
>                 if not res then
>                     ngx.say("failed to get sql: ", err)
>                     return
>                 end
> 
>                 if res == ngx.null then
>                     ngx.say("sql"..sql.." not found.")
> 
> 
> 
> 
> --mysql查询
> local mysql = require "resty.mysql"
>                 local db, err = mysql:new()
>                 if not db then
>                     ngx.say("failed to instantiate mysql: ", err)
>                     return
>                 end
> 
>                 db:set_timeout(1000) -- 1 sec
> 
> 
>                 local ok, err, errcode, sqlstate = db:connect{
>                     host = "192.168.44.211",
>                     port = 3306,
>                     database = "zhangmen",
>                     user = "root",
>                     password = "111111",
>                     charset = "utf8",
>                     max_packet_size = 1024 * 1024,
>                 }
> 
> 
>                 ngx.say("connected to mysql.<br>")
> 
> 
>  res, err, errcode, sqlstate =
>                     db:query(sql)
>                 if not res then
>                     ngx.say("bad result: ", err, ": ", errcode, ": ", sqlstate, ".")
>                     return
>                 end
> 
> 
>           --ngx.say("result: ", cjson.encode(res))
> 
> 
> 
>       ok, err = red:set(sql, cjson.encode(res))
>                 if not ok then
>                     ngx.say("failed to set sql: ", err)
>                     return
>                 end
> 
>                 ngx.say("set result: ", ok)
> 
>                     return
>                 end
> 
> 
> 
> 
> 
> 
> 
> 
> local template = require("resty.template")
> template.caching(false)
> local context = {
>     title = "测试",
>     name = "lucy",
>     description = "<script>alert(1);</script>",
>     age = 40,
>     hobby = {"电影", "音乐", "阅读"},
>     score = {语文 = 90, 数学 = 80, 英语 = 70},
>     score2 = {
>         {name = "语文", score = 90},
>         {name = "数学", score = 80},
>         {name = "英语", score = 70},
>     },
> 
> zhangmen=cjson.decode(res)
> 
> }
> 
> 
> 
> 
> 
> template.render("view.html", context)
> ```
>
> 
>
> 
>
> 模板
>
> ```
> {(header.html)}  
>    <body>  
>       {# 不转义变量输出 #}  
>       姓名：{* string.upper(name) *}<br/>  
>       {# 转义变量输出 #}  
> 
>       年龄: {* age + 10 *}<br/>  
>       {# 循环输出 #}  
>       爱好：  
>       {% for i, v in ipairs(hobby) do %}  
>          {% if v == '电影' then  %} - xxoo
> 
>               {%else%}  - {* v *} 
> {% end %}  
> 
>       {% end %}<br/>  
> 
>       成绩：  
>       {% local i = 1; %}  
>       {% for k, v in pairs(score) do %}  
>          {% if i > 1 then %}，{% end %}  
>          {* k *} = {* v *}  
>          {% i = i + 1 %}  
>       {% end %}<br/>  
>       成绩2：  
>       {% for i = 1, #score2 do local t = score2[i] %}  
>          {% if i > 1 then %}，{% end %}  
>           {* t.name *} = {* t.score *}  
>       {% end %}<br/>  
>       {# 中间内容不解析 #}  
>       {-raw-}{(file)}{-raw-}  
> 
> 
> 
> 
> 掌门：
> {* zhangmen *}
> 
> 
> 
>    {% for i = 1, #zhangmen do local z = zhangmen[i] %}  
>          {* z.deptId *},{* z.age *},{* z.name *},{* z.empno *},<br>
>       {% end %}<br/>  
> 
> {(footer.html)}  
> 
> ```
>
> 
>
> 
>
> ## Lua 开源项目
>
> ### WAF
>
> https://github.com/unixhot/waf
>
> https://github.com/loveshell/ngx_lua_waf
>
> 
>
> l   防止 SQL 注入，本地包含，部分溢出，fuzzing 测试，XSS/SSRF 等 Web 攻击
>
> l   防止 Apache Bench 之类压力测试工具的攻击
>
> l   屏蔽常见的扫描黑客工具，扫描器
>
> l   屏蔽图片附件类目录执行权限、防止 webshell 上传
>
> l   支持 IP 白名单和黑名单功能，直接将黑名单的 IP 访问拒绝
>
> l   支持 URL 白名单，将不需要过滤的 URL 进行定义
>
> l   支持 User-Agent 的过滤、支持 CC 攻击防护、限制单个 URL 指定时间的访问次数
>
> l   支持支持 Cookie 过滤，URL 与 URL 参数过滤
>
> l   支持日志记录，将所有拒绝的操作，记录到日志中去
>
> ### Kong 基于Openresty的流量网关
>
> https://konghq.com/
>
> https://github.com/kong/kong
>
> Kong 基于 OpenResty，是一个云原生、快速、可扩展、分布式的微服务抽象层（Microservice Abstraction Layer），也叫 API 网关（API Gateway），在 Service Mesh 里也叫 API 中间件（API Middleware）。
>
> Kong 开源于 2015 年，核心价值在于高性能和扩展性。从全球 5000 强的组织统计数据来看，Kong 是现在依然在维护的，在生产环境使用最广泛的 API 网关。
>
> Kong 宣称自己是世界上最流行的开源微服务 API 网关（The World’s Most Popular Open Source Microservice API Gateway）。
>
> 核心优势：
>
> l   可扩展：可以方便的通过添加节点水平扩展，这意味着可以在很低的延迟下支持很大的系统负载。
>
> l   模块化：可以通过添加新的插件来扩展 Kong 的能力，这些插件可以通过 RESTful Admin API 来安装和配置。
>
> l   在任何基础架构上运行：Kong 可以在任何地方都能运行，比如在云或混合环境中部署 Kong，单个或全球的数据中心。
>
> ###  APISIX
>
> ### ABTestingGateway
>
> https://github.com/CNSRE/ABTestingGateway
>
> ABTestingGateway 是一个可以动态设置分流策略的网关，关注与灰度发布相关领域，基于 Nginx 和 ngx-lua 开发，使用 Redis 作为分流策略数据库，可以实现动态调度功能。
>
> ABTestingGateway 是新浪微博内部的动态路由系统 dygateway 的一部分，目前已经开源。在以往的基于 Nginx 实现的灰度系统中，分流逻辑往往通过 rewrite 阶段的 if 和 rewrite 指令等实现，优点是性能较高，缺点是功能受限、容易出错，以及转发规则固定，只能静态分流。ABTestingGateway 则采用 ngx-lua，通过启用 lua-shared-dict 和 lua-resty-lock 作为系统缓存和缓存锁，系统获得了较为接近原生 Nginx 转发的性能。
>
> l   支持多种分流方式，目前包括 iprange、uidrange、uid 尾数和指定uid分流
>
> l   支持多级分流，动态设置分流策略，即时生效，无需重启
>
> l   可扩展性，提供了开发框架，开发者可以灵活添加新的分流方式，实现二次开发
>
> l   高性能，压测数据接近原生 Nginx 转发
>
> l   灰度系统配置写在 Nginx 配置文件中，方便管理员配置
>
> l   适用于多种场景：灰度发布、AB 测试和负载均衡等