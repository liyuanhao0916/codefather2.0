# GoFrame

## Hello Goframe

### 启动

**项目目录结构**

```
demo
	- api 	对外接口	对外提供服务的输入/输出数据结构定义。考虑到版本管理需要，往往以api/xxx/v1...存在。
	- hack	工具脚本	存放项目开发工具、脚本等内容。例如，CLI工具的配置，各种shell/bat脚本等文件。
	- internal	内部逻辑	业务逻辑存放目录。通过Golang internal特性对外部隐藏可见性。
		- cmd 		入口指令	命令行管理目录。可以管理维护多个命令行。
        - consts	常量定义	项目所有常量定义。
        - controller	接口处理	接收/解析用户输入参数的入口/接口层。
        - dao		数据访问	数据访问对象，这是一层抽象对象，和底层数据库交互，仅包含最基础的 CURD 方法
        - logic		业务封装	业务逻辑封装管理，特定的业务逻辑实现和封装。往往是项目中最复杂的部分。
        - model		结构模型	数据结构管理模块，管理数据实体对象，以及输入与输出数据结构定义。
        	- do		领域对象	用于dao数据操作中业务模型与实例模型转换，由工具维护，用户不能修改。
        	- entity	数据模型	数据模型是模型与数据集合的一对一关系，由工具维护，用户不能修改。
        - service	业务接口	用于业务模块解耦的接口定义层。具体的接口实现在logic中进行注入。
	- manifest	交付清单	包含程序编译、部署、运行、配置的文件。常见内容如下：  
		- config	配置管理	配置文件存放目录。
		- docker	镜像文件	Docker镜像相关依赖文件，脚本文件等等。
		- deploy	部署文件	部署相关的文件。默认提供Kubernetes集群化部署的Yaml模板，通过kustomize管理
		- protobuf	协议文件	GRPC协议时使用的protobuf协议定义文件，协议文件编译后生成go文件到api目录。
	- resource	静态资源	静态资源文件。这些文件往往可以通过 资源打包/镜像编译 的形式注入到发布文件中。
    - go.mod	依赖管理	使用Go Module包管理的依赖描述文件。
    - main.go	入口文件	程序入口文件。
```

> api 是接口定义，controller 是接口实现
>
> service 是业务接口定义，logic是业务接口的实现
>
> model 不仅维护 entity，还有dto，vo

**请求的流转**

- `cmd`层负责引导程序启动，显著的工作是初始化逻辑、注册路由对象、启动`server`监听、阻塞运行程序直至`server`退出
- 上层`server`服务接收客户端请求，转换为`api`中定义的`Req`接收对象、执行请求参数到`Req`对象属性的类型转换、执行`Req`对象中绑定的基础校验并转交`Req`请求对象给`controller`层
- `controller`层负责接收`Req`请求对象后做一些业务逻辑校验，随后调用一个或多个`service`实现业务逻辑，将执行结构封装为约定的`Res`数据结构对象返回
- `service`是接口层，用于解耦业务模块，`service`没有具体的业务逻辑实现，具体的业务实现是依靠`logic`层注入的
- `logic`层的业务逻辑需要通过调用`dao`来实现数据的操作，调用`dao`时需要传递`do`数据结构对象，用于传递查询条件、输入数据。`dao`执行完毕后通过`Entity`数据模型将数据结果返回给`service`层
- `dao`层通过框架的`ORM`抽象层组件与底层真实的数据库交互
- `model`层中管理了所有的业务模型，`service`资源的`Input/Output`输入输出数据结构都由`model`层来维护

**项目的启动**

- 进入main.go入口，调用internal/cmd包中的命令引导启动，默认执行Main的run命令，gctx.New()调用后会创建context上下文对象
- 执行cmd命令时，默认创建一个`HTTP Server`，然后通过分组路由的方式注册路由，并启动`HTTP Server`。随后`HTTP Server`将会阻塞运行，直至程序退出
- 使用了`Group`方法创建了分组路由，框架的`HTTP Server`**支持多种路由注册方式**，而分组路由也是最常见的路由注册方式
- 在分组路由的闭包方法内部，通过`Middleware`方法注册了一个中间件，该中间件是`HTTP Server`组件用于规范化路由的数据返回。随后通过`Bind`方法的规范化路由方式绑定一个`Hello`路由对象，该路由对象下的所有公开方法均会被自动注册会路由

### 配置

工具配置 --- hack目录下，通常命名为config.yaml

```yaml
gfcli:
  gen:
    dao:
      - link:            "mysql:root:root@tcp(127.0.0.1:3306)/test"
        tables:          "fb_bm_info,fb_ad_account_info"
        removePrefix:    "gf_"
        descriptionTag:  true
        noModelComment:  true
```

业务配置 --- 存放在manifest/config目录下，一般不提交到git --- **见各组件配置文件**

### 开发工具

**安装**

linux/mac

```sh
wget -O gf "https://github.com/gogf/gf/releases/latest/download/gf_$(go env GOOS)_$(go env GOARCH)" && chmod +x gf && ./gf install -y && rm ./gf

## 没有wget需要安装
brew install wget			## Mac
apt-get install wget -y		## Ubuntu
yum install wget -y			## CentOS
```

win 下载exe进行安装 https://github.com/gogf/gf/releases

或手动编译安装

```sh
git clone https://github.com/gogf/gf && cd gf/cmd/gf && go install
```

**验证** 

```sh
gf -v
```

**创建项目模板**

```sh
gf init demo -u		## 项目名称为demo, -u 为更新到最新的模板
```

**编译**（可省略） --- 含内置变量，可通过配置文件指定编译参数--- 参考 [gcfg](#gcfg)

```sh
gf build demo.go
```

**运行**

```sh
cd demo && gf run main.go
```

**代码生成** --- 需要配置

```sh
gf gen dao
```



## 对象管理

`GoFrame`框架封装了一些常用的数据类型以及对象获取方法，通过`g.*`方法获取

`g`是一个强耦合的模块，目的是为开发者在对频繁使用的类型/对象调用时提供便利

### 常见别名

```go
type (
	Var = gvar.Var        // Var 是一个通用的可变接口，就像泛型一样
	Ctx = context.Context // 上下文
)

type (
	Map        = map[string]interface{}      // Map [ string ] interface
	MapAnyAny  = map[interface{}]interface{} // map[interface{}]interface{}.
	MapAnyStr  = map[interface{}]string      // map[interface{}]string.
	MapAnyInt  = map[interface{}]int         // map[interface{}]int.
	MapStrAny  = map[string]interface{}      // map[string]interface{}.
	MapStrStr  = map[string]string           // map[string]string.
	MapStrInt  = map[string]int              // map[string]int.
	MapIntAny  = map[int]interface{}         // map[int]interface{}.
	MapIntStr  = map[int]string              // map[int]string.
	MapIntInt  = map[int]int                 // map[int]int.
	MapAnyBool = map[interface{}]bool        // map[interface{}]bool.
	MapStrBool = map[string]bool             // map[string]bool.
	MapIntBool = map[int]bool                // map[int]bool.
)

type (
	List        = []Map        // 切片 []Map.
	ListAnyAny  = []MapAnyAny  // 切片 []MapAnyAny.
	ListAnyStr  = []MapAnyStr  // 切片 []MapAnyStr.
	ListAnyInt  = []MapAnyInt  // 切片 []MapAnyInt.
	ListStrAny  = []MapStrAny  // 切片 []MapStrAny.
	ListStrStr  = []MapStrStr  // 切片 []MapStrStr.
	ListStrInt  = []MapStrInt  // 切片 []MapStrInt.
	ListIntAny  = []MapIntAny  // 切片 []MapIntAny.
	ListIntStr  = []MapIntStr  // 切片 []MapIntStr.
	ListIntInt  = []MapIntInt  // 切片 []MapIntInt.
	ListAnyBool = []MapAnyBool // 切片 []MapAnyBool.
	ListStrBool = []MapStrBool // 切片 []MapStrBool.
	ListIntBool = []MapIntBool // 切片 []MapIntBool.
)

type (
	Slice    = []interface{} // 切片 []interface{}.
	SliceAny = []interface{} // 切片 []interface{}.
	SliceStr = []string      // 切片 []string.
	SliceInt = []int         // 切片 []int.
)

type (
	Array    = []interface{} 
	ArrayAny = []interface{} 
	ArrayStr = []string      
	ArrayInt = []int         
)
```

### 常用对象

常用对象往往通过`单例模式`进行管理，可以根据不同的单例名称获取对应的对象实例，并在对象初始化时会自动检索获取配置文件中的对应配置项

在运行时阶段，每一次通过`g`模块获取单例对象时都会有内部全局锁机制来保证操作和数据的并发安全性，原理性上来讲在并发量大的场景下会存在锁竞争的情况，但绝大部分的业务场景下开发者均不需要太在意锁竞争带来的性能损耗。此外，开发者也可以通过将获取到的单例对象保存到特定的模块下的内部变量重复使用，以此避免运行时锁竞争情况



```go
func Client() *ghttp.Client				// http 客户端对象
func Validator() *gvalid.Validator		// validator 校验对象
func Cfg(name ...string) *gcfg.Config	// 单例的配置管理对象
func Log(name ...string) *glog.Logger	// 单例的日志管理对象，自动读取logger配置项
func View(name ...string) *gview.View	// 单例的模板引擎对象，自动读取viewer配置项
func Server(name ...interface{}) *ghttp.Server	// 单例的web server，自动读取server配置项
func TcpServer(name ...interface{}) *gtcp.Server	// 单例的tcp server
func UdpServer(name ...interface{}) *gudp.Server	// 单例的udp server
func DB(name ...string) *gdb.Db			// 单例的 orm 对象，自动读取database配置项
func Model(tables string, db ...string) *gdb.Model	// 默认的数据库上创建 model对象
func Redis(name ...string) *gredis.Redis	// 单例的redis客户端对象，自动读取redis配置项
func Res(name ...string) *gres.Resource		// 单例的资源管理对象
func I18n(name ...string) *gi18n.Manager	// 单例的国际化管理对象
```

- 

## gcfg

配置管理

### 配置对象

Cfg

- 自动按照文件后缀 toml/yaml/yml/json/ini/xml/properties 文自动检索配置文件
- 默认情况下会自动按顺序检索 config 开头的文件，并缓存，配置文件在外部被修改时将会自动刷新缓存
- 默认使用单例名称检索，例如：g.Cfg("redis")会自动按顺序检索redis开头的文件，如果检索成功那么将该文件加载到内存缓存中，下一次将会直接从内存中读取
- 当该文件不存在时，则使用默认的配置文件（config.toml）

```yml
viewpath: "/home/www/templates/"
database:
  default:
  - link: "mysql:root:12345678@tcp(127.0.0.1:3306)/test"
    role: "master"
  - link: "mysql:root:12345678@tcp(127.0.0.1:3306)/test"
    role: "slave"
```

**通过 `g.Cfg() `获取**

```go
package main

import (
	"fmt"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gctx"
)

func main() {
	var ctx = gctx.New()
	fmt.Println(g.Cfg().Get(ctx, "viewpath"))
	fmt.Println(g.Cfg().Get(ctx, "database.default.0.role"))
}
```

**通过 `gcfg.Instance `获取**

```go
package main

import (
	"fmt"

	"github.com/gogf/gf/v2/os/gcfg"
	"github.com/gogf/gf/v2/os/gctx"
)

func main() {
	var ctx = gctx.New()
	fmt.Println(gcfg.Instance().Get(ctx, "viewpath"))
	fmt.Println(gcfg.Instance().Get(ctx, "database.default.0.role"))
}
```

### 文件（目录）配置

默认扫描的文件名为config.toml/yaml/yml/json/ini/xml/properties

默认扫描的目录为

- 当前工作目录 及 其下的`config`、`manifest/config`目录：例如当前的工作目录为/home/www时，将会添加：`/home/www`、`/home/www/config`、`/home/www/manifest/config`

- 当前可执行文件所在目录及其下的`config`、`manifest/config`目录例如二进制文件所在目录为/tmp时，将会添加：`/tmp`、`/tmp/config`、`/tmp/manifest/config`

- 当前`main`源代码包所在目录及其下的`config`、`manifest/config`目录(仅对源码开发环境有效)：例如main包所在目录为/home/john/workspace/gf-app时，将会添加：`/home/john/workspace/gf-app`、`/home/john/workspace/gf-app/config`、`/home/john/workspace/gf-app/manifest/config`

```go
g.Cfg().GetAdapter().(*gcfg.AdapterFile).SetFileName("default.yaml")	// 修改默认文件名
g.Cfg().GetAdapter().(*gcfg.AdapterFile).SetPath("/opt/config")			// 修改默认目录
```

`gcfg`包也支持直接内容配置，而不是读取配置文件，常用于程序内部动态修改配置内容。通过以下包配置方法实现全局的配置，需要注意的是该配置是全局生效的，并且优先级会高于读取配置文件

```go
func (c *AdapterFile) SetContent(content string, file ...string)	
// 如 SetContent("v = 1", "config.toml")
func (c *AdapterFile) GetContent(file ...string) string
func (c *AdapterFile) RemoveContent(file ...string)
func (c *AdapterFile) ClearContent()
```

### 常用方法

`GetWithEnv`：先从默认的配置文件中获取配置数据，获取为空的时候，将会去当前的环境变量中进行获取

`GetWithCmd`：先从默认的配置对象中获取配置数据，但是获取为空的时候，是去命令行中获取配置信息

`MustGetWithCmd`、`MustGetWithEnv`：只会返回配置内容，一旦内部发生任何错误，将会有`panic`

`Data`、`MustData`：从配置对象中获取配置数据，组装成`map[string]interface{}`类型（must 错误直接panic）

`Get`、`MustGet`：从对象中获取配置数据，返回`gvar`泛型对象 （must 错误直接panic）

`GetAdapter`、`SetAdapter`：获取/设置当前运行的`gcfg`适配器信息

```go
func ExampleConfig_GetWithEnv() {
	var (
		key = `env.test`
		ctx = gctx.New()
	)
	v, err := g.Cfg().GetWithEnv(ctx, key)
	if err != nil {
		panic(err)
	}
	fmt.Printf("env:%s\n", v)
	if err = genv.Set(`ENV_TEST`, "gf"); err != nil {
		panic(err)
	}
    // os.Args = append(os.Args, fmt.Sprintf(`--%s=yes`, key))
	// gcmd.Init(os.Args...)
	v, err = g.Cfg().GetWithEnv(ctx, key)
    // v, err = g.Cfg().GetWithCmd(ctx, key)
	if err != nil {
		panic(err)
	}
	fmt.Printf("env:%s", v)
}
```

```go
func ExampleConfig_Data() {
	ctx := gctx.New()
	content := `
v1    = 1
v2    = "true"
v3    = "off"
v4    = "1.23"
array = [1,2,3]
[redis]
    disk  = "127.0.0.1:6379,0"
    cache = "127.0.0.1:6379,1"
`
	c, err := gcfg.New()
	if err != nil{
		panic(err)
	}
	c.GetAdapter().(*gcfg.AdapterFile).SetContent(content)
	data, err := c.Data(ctx)
    // data,err := c.Get(ctx,"redis")	
	if err != nil{
		panic(err)
	}

	fmt.Println(data)	
    // map[array:[1 2 3] redis:map[cache:127.0.0.1:6379,1 disk:127.0.0.1:6379,0] v1:1 v2:true v3:off v4:1.23]
    
    // {"cache":"127.0.0.1:6379,1","disk":"127.0.0.1:6379,0"}
}
```

### 接口化设计

`gcfg`组件采用了接口化设计，以实现高扩展性。通过接口化设计的方式，使用者可以自定义对接的配置获取方式，例如`etcd, zookeeper, consule, kubernetes configmap, apollo`等等

```go
// Adapter is the interface for configuration retrieving.
type Adapter interface {
	// Available checks and returns the configuration service is available.
	// The optional parameter `resource` specifies certain configuration resource.
	//
	// It returns true if configuration file is present in default AdapterFile, or else false.
	// Note that this function does not return error as it just does simply check for backend configuration service.
	Available(ctx context.Context, resource ...string) (ok bool)

	// Get retrieves and returns value by specified `pattern`.
	Get(ctx context.Context, pattern string) (value interface{}, err error)

	// Data retrieves and returns all configuration data as map type.
	// Note that this function may lead lots of memory usage if configuration data is too large,
	// you can implement this function if necessary.
	Data(ctx context.Context) (data map[string]interface{}, err error)
}
```

```go
// 配置对象可以通过SetAdapter方法设置当前使用的接口实现
func (c *Config) SetAdapter(adapter Adapter)
```

```go
// 配置对象可以通过GetAdapter方法获取当前使用的接口实现
func (c *Config) GetAdapter() Adapter
```

## gcmd

### 基本概念

gcmd是goframe提供的命令行管理组件

首先认识下命令的基本概念

- 参数 Argument ，按顺序进行传递的，没有名称的数据，有序
- 选项 Option，以-、--开头的，控制程序逻辑的，有名称的附加输入，可以放到任何位置，是无序的，可以带数据，也可以不带数据，带数据的可以通过空格连接，也可以通过=连接，举个栗子

```sh
gf build main.go -a amd64 -o linux -n app -yes
## gf build main.go 就是参数 ，有序，不能改变，gcmd会按索引解析
## -a -o -n -yes 就是选项，无序
## amd64 linux app 就是选项的数据， -yes 没有数据
gf build main.go -a=amd64 -o=linux -n=app -yes
## 带数据的可以通过空格连接，也可以通过=连接
```

gcmd默认按索引解析参数，按名称解析选项

### 基础方法

```go
func Init(args ...string)							// 自定义命令行
func GetArg(index int, def ...string) *gvar.Var		// 获取默认解析的命令行参数，按索引获取
func GetArgAll() []string							// 获取所有的命令行参数
func GetOpt(name string, def ...string) *gvar.Var // 获取默认解析的命令行选项，按名称获取,不存在返回nil
func GetOptAll() map[string]string					// 获取所有的命令行选项	
```

```go
func testInit(){
    gcmd.Init("gf","build","main.go","-o=gf.exe","-y")
    fmt.Printf(`%#v`,gcmd.GetArgAll())	// []string{"gf", "build", "main.go"}
    fmt.Printf(
		`Arg[0]: "%v", Arg[1]: "%v", Arg[2]: "%v", Arg[3]: "%v"`,
		gcmd.GetArg(0), gcmd.GetArg(1), gcmd.GetArg(2), gcmd.GetArg(3),
	)	// Arg[0]: "gf", Arg[1]: "build", Arg[2]: "main.go", Arg[3]: ""
    fmt.Printf(`%#v`, gcmd.GetOptAll())	// map[string]string{"o":"gf.exe", "y":""}
    fmt.Printf(
		`Opt["o"]: "%v", Opt["y"]: "%v", Opt["d"]: "%v"`,
		gcmd.GetOpt("o"), gcmd.GetOpt("y"), gcmd.GetOpt("d", "default value"),
	)	// Opt["o"]: "gf.exe", Opt["y"]: "", Opt["d"]: "default value"
}
```

`func GetOptWithEnv(key string, def ...interface{}) *gvar.Var`

- 用于获取指定选项的数据值，如果选项不存在，则在环境变量中获取
- 但两者的名称规则不一样，如 `gcmd.GetOptWithEnv("gf.debug")`优先读取命令行的gf.debug，不存在是，读取GF_DEBUG环境变量（小写转大写，.转_）

```go
func testGetOptWithEnv(){
    fmt.Printf("Opt[gf.test]:%s\n", gcmd.GetOptWithEnv("gf.test"))	// Opt[gf.test]:
	_ = genv.Set("GF_TEST", "YES")
	fmt.Printf("Opt[gf.test]:%s\n", gcmd.GetOptWithEnv("gf.test"))	// Opt[gf.test]:YES
}
```

### Parser解析

命名行解析最主要的是针对于选项的解析，`gcmd`组件提供了`Parse`方法，用于自定义解析选项，包括有哪些选项名称，每个选项是否带有数值。根据这一配置便可将所有的参数和选项进行解析归类。

> 大部分场景下，我们并不需要显式创建`Parser`对象，因为我们有层级管理以及对象管理方式来管理多命令。但底层仍然是采用`Parser`方式实现，因此本章节大家了解原理即可

```go
func Parse(supportedOptions map[string]bool, option ...ParserOption) (*Parser, error)
func ParseWithArgs(args []string, supportedOptions map[string]bool, option ...ParserOption) (*Parser, error)
func ParserFromCtx(ctx context.Context) *Parser
func (p *Parser) GetArg(index int, def ...string) *gvar.Var
func (p *Parser) GetArgAll() []string
func (p *Parser) GetOpt(name string, def ...interface{}) *gvar.Var
func (p *Parser) GetOptAll() map[string]string
```

```go
// ParserOption 管理选项的解析
type ParserOption struct {
	CaseSensitive bool // 选项的键，区分大小写
	Strict        bool // 是否解析数据
}
```

```go
parser, err := gcmd.Parse(g.MapStrBool{
	"n,name":    true,
	"v,version": true,
	"a,arch":    true,
	"o,os":      true,
	"p,path":    true,
})
```

可以看到，选项输入参数其实是一个`map`类型

- 其中键值为选项名称，同一个选项的不同名称可以通过`,`符号进行分隔。比如，该示例中`n`和`name`选项是同一个选项，当用户输入`-n lin`和`name`选项都会获得到数据`lin`

- 而键值是一个布尔类型，标识该选项是否需要解析选项数据。这一选项配置是非常重要的，因为有的选项是不需要获得数据的，仅仅作为一个标识。例如，`-f force`这个输入，在需要解析数据的情况下，选项`f`的值为`force`；而在不需要解析选项数据的情况下，其中的`force`便是命令行的一个参数，而不是选项

```go
func testParse() {
	os.Args = []string{"gf", "build", "main.go", "-o=gf.exe", "-y"}
	p, err := gcmd.Parse(g.MapStrBool{
		"o,output": true,
		"y,yes":    false,
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(p.GetOpt("o"))				// gf.exe
	fmt.Println(p.GetOpt("output"))			// gf.exe
	fmt.Println(p.GetOpt("y") != nil)		// true
	fmt.Println(p.GetOpt("yes") != nil)		// true
	fmt.Println(p.GetOpt("none") != nil)	// false	
}
```

### Command对象

> 大部分场景下，我们通过`Command`命令行对象来管理单个或多个命令，并且使用默认的命令行解析规则（不用显式使用`Parser`解析器）即可。`Command`对象定义如下：

```go
// Command holds the info about an argument that can handle custom logic.
type Command struct {
	Name          string        // 命令名称（区分大小写）
	Usage         string        // 关于其用法的简要说明，例如: gf build main.go [ OPTION ]
	Brief         string        // 简短的描述
	Description   string        // 详细的描述
	Arguments     []Argument    // 参数数组
	Func          Function      // 自定义回调，用于实现当前命令执行的操作
	FuncWithValue FuncWithValue // 同Func，只不过支持返回值，往往用于命令行相互调用的场景，一般项目用不到
	HelpFunc      Function      // 自定义帮助信息，没有太大必要，Command对象能够自动生成帮助信息
	Examples      string        // 使用举例
	Additional    string        // 关于此命令的附加信息，将附加到帮助信息的末尾
	Strict        bool          // 严格的解析选项，这意味着如果给出的选项无效，它将返回错误
	Config        string        // 配置节点名称，该名称还与命令行一起从配置组件检索值
	parent        *Command      // 供内部使用的父命令
	commands      []*Command    // 此命令的子命令
}
```

**func回调**

```go
// 绑定某个参数的回调函数 --- 通过parser对象获取参数和选项
type Function func(ctx context.Context, parser *Parser) (err error)
```

```go
package main

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
	"github.com/gogf/gf/v2/os/gcmd"
	"github.com/gogf/gf/v2/os/gctx"
)

var (
    // 定义一个command对象，赋值给全局变量Main
    // 此command对象定义了命令名称、简要描述、详细描述、回调函数
	Main = &gcmd.Command{	
		Name:        "main",
		Brief:       "start http server",
		Description: "this is the command entry for starting your http server",
		Func: func(ctx context.Context, parser *gcmd.Parser) (err error) {
			s := g.Server()
			s.BindHandler("/", func(r *ghttp.Request) {
				r.Response.Write("Hello world")
			})
			s.SetPort(8199)
			s.Run()
			return
		},
	}
)

func main() {
	Main.Run(gctx.New())
}
```

> 这也是大部分项目的启动命令行对象的样子，大部分项目只有一个启动入口，并且只会有一个回调方法实现

**帮助信息生成**

`Command`对象虽然可以自定义`HelpFunc`帮助回调方法，但`Command`对象可以自动生成`Help`使用帮助信息，大部分场景下无需自定义。并且`gcmd`组件默认内置了支持了`h/help`选项，因此使用`gcmd`组件的程序可以通过这两个选项自动生成`Help`帮助信息 ---- 一句话说，帮助信息不用管，自动生成

**层级命令**

每个命令都可以添加子命令，就有了层级命令，父级命令和子级命令都可以有自己的回调方法，不过大部分场景下，一旦`Command`成为了父级命令，回调方法往往都没有太大存在的必要。我们通常通过`AddCommand`方法为`Command`添加子级命令：

```go
package main

import (
	"context"
	"fmt"

	"github.com/gogf/gf/v2/os/gcmd"
	"github.com/gogf/gf/v2/os/gctx"
)

var (
	Main = &gcmd.Command{
		Name:        "main",
		Brief:       "start http server",
		Description: "this is the command entry for starting your process",
	}
	Http = &gcmd.Command{
		Name:        "http",
		Brief:       "start http server",
		Description: "this is the command entry for starting your http server",
		Func: func(ctx context.Context, parser *gcmd.Parser) (err error) {
			fmt.Println("start http server")
			return
		},
	}
	Grpc = &gcmd.Command{
		Name:        "grpc",
		Brief:       "start grpc server",
		Description: "this is the command entry for starting your grpc server",
		Func: func(ctx context.Context, parser *gcmd.Parser) (err error) {
			fmt.Println("start grpc server")
			return
		},
	}
)

func main() {
	err := Main.AddCommand(Http, Grpc)
	if err != nil {
		panic(err)
	}
	Main.Run(gctx.New())
}
```

通过`AddCommand`命令为主命令增加了两个子级命令`http/grpc`，分别用于开启`http/grpc`服务。

当存在子级命令式，父命令往往便没有`Func`回调定义的必要了，因此我们这里去掉了`main`命令的`Func`定义

编译后，调用

```sh
go build main.go
main -h
main http
main grpc
```

### 结构化参数

command都是通过回调函数的parser对象获取解析的参数和选项，有以下痛点

- 硬编码 --- 需要通过索引或选项名才能获取
- 难以定义参数、选项的说明
- 难以定义参数、选项的数据类型
- 难以对参数、选项进行校验
- 命令多了就很难管理

**命令对象化**

通过对象管理父级命令

通过方法管理子级命令

通过规范化的`Input`输入参数对象来定义子级命令的描述/参数/选项，Output可忽略，未用到返回nil即可

```go
package main

import (
	"context"
	"fmt"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gcmd"
	"github.com/gogf/gf/v2/os/gctx"
)

type cMain struct {
	g.Meta `name:"main"`
}

type cMainHttpInput struct {
	g.Meta `name:"http" brief:"start http server"`
}
type cMainHttpOutput struct{}

type cMainGrpcInput struct {
	g.Meta `name:"grpc" brief:"start grpc server"`
}
type cMainGrpcOutput struct{}

func (c *cMain) Http(ctx context.Context, in cMainHttpInput) (out *cMainHttpOutput, err error) {
	fmt.Println("start http server")
	return
}

func (c *cMain) Grpc(ctx context.Context, in cMainGrpcInput) (out *cMainGrpcOutput, err error) {
	fmt.Println("start grpc server")
	return
}

func main() {
	cmd, err := gcmd.NewFromObject(cMain{})
	if err != nil {
		panic(err)
	}
	cmd.Run(gctx.New())
}
```

**入参结构化**

下述栗子，cMainHttpInput结构体中定义了http命令，

- g.Meta 定义元信息，名称、简要...
- name   字符串类型、v:required 校验必须携带
- port     int类型、校验必须携带、简写

```go
package main

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
	"github.com/gogf/gf/v2/os/gcmd"
	"github.com/gogf/gf/v2/os/gctx"
)

type cMain struct {
	g.Meta `name:"main" brief:"start http server"`
}

type cMainHttpInput struct {
	g.Meta `name:"http" brief:"start http server"`
	Name   string `v:"required" name:"NAME" arg:"true" brief:"server name"`
	Port   int    `v:"required" short:"p" name:"port"  brief:"port of http server"`
}
type cMainHttpOutput struct{}

func (c *cMain) Http(ctx context.Context, in cMainHttpInput) (out *cMainHttpOutput, err error) {
	s := g.Server(in.Name)
	s.BindHandler("/", func(r *ghttp.Request) {
		r.Response.Write("Hello world")
	})
	s.SetPort(in.Port)
	s.Run()
	return
}

func main() {
	cmd, err := gcmd.NewFromObject(cMain{})
	if err != nil {
		panic(err)
	}
	cmd.Run(gctx.New())
}
```

**预定义标签**

| 标签          | 缩写 | 说明                                                         | 注意事项                                                     |
| :------------ | :--- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| `name`        | -    | 命名名称                                                     | 如果是输入参数结构体，在未指定`name`时将会自动读取**方法名称**作为`name` |
| `short`       | -    | 命令缩写                                                     |                                                              |
| `usage`       | -    | 命令使用                                                     |                                                              |
| `brief`       | -    | 命令描述                                                     |                                                              |
| `arg`         | -    | 表示该输入参数来源于参数而不是选项                           | 仅用于属性标签                                               |
| `orphan`      | -    | 表示该选项不带参数                                           | 属性通常为`bool`类型                                         |
| `description` | `dc` | 命令的详细介绍                                               |                                                              |
| `additional`  | `ad` | 命令的额外描述信息                                           |                                                              |
| `examples`    | `eg` | 命令的使用示例                                               |                                                              |
| `root`        | -    | 指定方法名称是父级命令，其他方法是它的子级命令               | 仅用于对象结构体`Meta`标签                                   |
| `strict`      | -    | 表示该命令严格解析参数/选项，当输入不支持的参数/选项时，返回错误 | 仅用于对象结构体`Meta`标签                                   |
| `config`      | -    | 表示该命令的选项数据支持从指定的配置读取，配置来源于默认的全局单例配置对象 | 仅用于方法输入结构体`Meta`标签                               |

**高级特性**

- 支持自动数据类型转换，通过gconv组件支持

  > 命令行参数的数据转换采用**不区分大小写、且忽略特殊字符**的规则来匹配属性字段。例如，如果入参结构体中存在`Name`字段属性，无论命令行输入`name`还是`NAME`的命名参数，都将能被`Name`字段属性接收

- 支持自动数据校验，通过gvalid组件支持

- 支持配置中读取，只需要在Meta中设置config标签

### 终端交互

```go
func Scan(info ...interface{}) string
func Scanf(format string, info ...interface{}) string
```

```go
package main

import (
	"fmt"

	"github.com/gogf/gf/v2/os/gcmd"
)

func main() {
	name := gcmd.Scan("> What's your name?\n")
	age := gcmd.Scanf("> Hello %s, how old are you?\n", name)
	fmt.Printf("> %s's age is: %s", name, age)
}
```

```sh
> What's your name?
john
> Hello john, how old are you?
18
> john's age is: 18
```

### 链路跟踪

支持跨进程的链路跟踪特性，特别是对于一些临时运行的进程特别有用。

框架整体的链路跟踪都是采用的`OpenTelemetry`规范。



## gvalid

gvalid是goframe的校验组件

## gconv

类型转换

## glog

日志组件

### 配置文件

```yaml
logger:
  path:                  "/var/log/"   # 日志文件路径。默认为空，表示关闭，仅输出到终端
  file:                  "{Y-m-d}.log" # 日志文件格式。默认为"{Y-m-d}.log"
  prefix:                ""            # 日志内容输出前缀。默认为空
  level:                 "all"         # 日志输出级别
  ctxKeys:               []            # 自定义Context上下文变量名称，自动打印Context的变量到日志中。默认为空
  header:                true          # 是否打印日志的头信息。默认true
  stdout:                true          # 日志是否同时输出到终端。默认true
  rotateSize:            0             # 按照日志文件大小对文件进行滚动切分。默认为0，表示关闭滚动切分特性
  rotateExpire:          0             # 按照日志文件时间间隔对文件滚动切分。默认为0，表示关闭滚动切分特性
  rotateBackupLimit:     0             # 按照切分的文件数量清理切分文件，当滚动切分特性开启时有效。默认为0，表示不备份，切分则删除
  rotateBackupExpire:    0             # 按照切分的文件有效期清理切分文件，当滚动切分特性开启时有效。默认为0，表示不备份，切分则删除
  rotateBackupCompress:  0             # 滚动切分文件的压缩比（0-9）。默认为0，表示不压缩
  rotateCheckInterval:   "1h"          # 滚动切分的时间检测间隔，一般不需要设置。默认为1小时
  stdoutColorDisabled:   false         # 关闭终端的颜色打印。默认开启
  writerColorEnable:     false         # 日志文件是否带上颜色。默认false，表示不带颜色
```

多个配置项

```yaml
logger:
  path:    "/var/log"
  level:   "all"
  stdout:  false
  logger1:
    path:    "/var/log/logger1"
    level:   "dev"
    stdout:  false
  logger2:
    path:    "/var/log/logger2"
    level:   "prod"
    stdout:  true
```

获取配置

```go
l1 := g.Log("logger1")		// 对应 logger.logger1 配置项
l2 := g.Log("logger2")		// 对应 logger.logger2 配置项
l3 := g.Log("none")			// 对应默认配置项 logger
l4 := g.Log()				// 对应默认配置项 logger
```

### 日志级别

```go
func (l *Logger) SetLevel(level int)
func (l *Logger) SetLevelStr(levelStr string) error
func (l *Logger) SetLevelPrint(enabled bool)
```

> 通过`SetLevel`方法可以设置日志级别，`glog`模块支持以下几种日志级别常量设定：`LEVEL_ALL`、`LEVEL_DEV`、`LEVEL_PROD`、`LEVEL_DEBU`、`LEVEL_INFO`、`LEVEL_NOTI`、`LEVEL_WARN`、`LEVEL_ERRO`
>
> 可以通过`位操作`组合使用这几种级别，例如其中`LEVEL_ALL`等价于`LEVEL_DEBU | LEVEL_INFO | LEVEL_NOTI | LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT`。我们还可以通过`LEVEL_ALL & ^LEVEL_DEBU & ^LEVEL_INFO & ^LEVEL_NOTI`来过滤掉`LEVEL_DEBU/LEVEL_INFO/LEVEL_NOTI`日志内容
>
> 日志模块还有其他的一些级别，如`CRIT/PANI/FATA`，但是这几个级别是非常严重的错误，无法在日志级别中由开发者自定义屏蔽。例如产生严重错误的时候，`PANI/FATA`错误界别将会产生一些额外的系统动作：`panic`/`exit`

```go
package main

import (
	"context"

	"github.com/gogf/gf/v2/os/glog"
)

func main() {
	ctx := context.TODO()
	l := glog.New()
	l.Info(ctx, "info1")
	l.SetLevel(glog.LEVEL_ALL ^ glog.LEVEL_INFO)
	l.Info(ctx, "info2")
}
```

> 大部分场景下我们可以通过`SetLevelStr`方法来通过字符串设置日志级别，配置文件中的`level`配置项也是通过字符串来配置日志级别。支持的日志级别字符串如下，不区分大小写:
>
> ```yaml
> "ALL":      LEVEL_DEBU | LEVEL_INFO | LEVEL_NOTI | LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "DEV":      LEVEL_DEBU | LEVEL_INFO | LEVEL_NOTI | LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "DEVELOP":  LEVEL_DEBU | LEVEL_INFO | LEVEL_NOTI | LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "PROD":     LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "PRODUCT":  LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "DEBU":     LEVEL_DEBU | LEVEL_INFO | LEVEL_NOTI | LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "DEBUG":    LEVEL_DEBU | LEVEL_INFO | LEVEL_NOTI | LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "INFO":     LEVEL_INFO | LEVEL_NOTI | LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "NOTI":     LEVEL_NOTI | LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "NOTICE":   LEVEL_NOTI | LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "WARN":     LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "WARNING":  LEVEL_WARN | LEVEL_ERRO | LEVEL_CRIT,
> "ERRO":     LEVEL_ERRO | LEVEL_CRIT,
> "ERROR":    LEVEL_ERRO | LEVEL_CRIT,
> "CRIT":     LEVEL_CRIT,
> "CRITICAL": LEVEL_CRIT,
> ```
>
> 可以看到，通过级别名称设置的日志级别是按照日志级别的高低来进行过滤的：`DEBU < INFO < NOTI < WARN < ERRO < CRIT`，也支持`ALL`, `DEV`, `PROD`常见部署模式配置名称

```go
package main

import (
	"context"

	"github.com/gogf/gf/v2/os/glog"
)

func main() {
	ctx := context.TODO()
	l := glog.New()
	l.Info(ctx, "info1")
	l.SetLevelStr("notice")		// 调整日志级别为notice后不再打印info日志
	l.Info(ctx, "info2")
}
```

**日志打印格式**

```go
package main

import (
	"context"

	"github.com/gogf/gf/v2/os/glog"
)

func main() {
	ctx := context.TODO()
	l := glog.New()
	l.SetLevelPrefix(glog.LEVEL_DEBU, "debug")
	l.Debug(ctx, "test")		// 2021-12-31 11:21:45.754 [debug] test 
}
```

### 文件目录

**文件**

默认情况下以 YYYY-MM-DD.log格式命名

```go
package main

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gfile"
	"github.com/gogf/gf/v2/os/glog"
)

// 设置日志等级
func main() {
	ctx := context.TODO()
	path := "./glog"
	glog.SetPath(path)
	glog.SetStdoutPrint(false)
	// 使用默认文件名称格式
	glog.Print(ctx, "标准文件名称格式，使用当前时间时期")	// 2021-12-31.log
	// 通过SetFile设置文件名称格式
	glog.SetFile("stdout.log")
	glog.Print(ctx, "设置日志输出文件名称格式为同一个文件")	// stdout.log
	// 链式操作设置文件名称格式	
	glog.File("stderr.log").Print(ctx, "支持链式操作")	// stderr.log
	glog.File("error-{Ymd}.log").Print(ctx, "文件名称支持带gtime日期格式")	// error-20211231.log
	glog.File("access-{Ymd}.log").Print(ctx, "文件名称支持带gtime日期格式")// access-20211231.log

	list, err := gfile.ScanDir(path, "*")
	g.Dump(err)
	g.Dump(list)
}
```

**目录**

默认情况下是标准输出，当通过`SetPath`设置日志的输出目录，如果目录不存在时，将会递归创建该目录路径

```go
package main

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gfile"
	"github.com/gogf/gf/v2/os/glog"
)

// 设置日志等级
func main() {
	ctx := context.TODO()
	path := "./glog"
	glog.SetPath(path)
	glog.Print(ctx, "日志内容")
	list, err := gfile.ScanDir(path, "*")
	g.Dump(err)
	g.Dump(list)
}
```

### 链式操作

```go
func To(writer io.Writer) *Logger				// 重定向日志输出接口
func Path(path string) *Logger					// 日志内容输出到目录
func Cat(category string) *Logger				// 设置日志文件分类
func File(file string) *Logger					// 设置日志文件格式
func Level(level int) *Logger					// 设置日志打印级别
func LevelStr(levelStr string) *Logger			// 设置日志打印级别(字符串)
func Skip(skip int) *Logger						// 设置文件回溯值
func Stack(enabled bool) *Logger				// 是否开启trace打印
func StackWithFilter(filter string) *Logger		// 开启trace打印并设定过滤trace的字符串
func Stdout(enabled...bool) *Logger				// 是否开启终端输出
func Header(enabled...bool) *Logger				// 是否输出日志头信息
func Line(long...bool) *Logger					// 输出日志调用行号信息
func Async(enabled...bool) *Logger				// 异步输出日志
```

### 颜色打印

```yaml
logger:
  stdoutColorDisabled: false # 是否关闭终端的颜色打印。默认否，表示终端的颜色输出。
  writerColorEnable:   false # 是否开启Writer的颜色打印。默认否，表示不输出颜色到自定义的Writer或者文件。
```

```go
g.Log().SetWriterColorEnable(true)
```

```go
// \v2\os\glog\glog_logger_color.go	默认颜色
var defaultLevelColor = map[int]int{
	LEVEL_DEBU: COLOR_YELLOW,
	LEVEL_INFO: COLOR_GREEN,
	LEVEL_NOTI: COLOR_CYAN,
	LEVEL_WARN: COLOR_MAGENTA,
	LEVEL_ERRO: COLOR_RED,
	LEVEL_CRIT: COLOR_HI_RED,
	LEVEL_PANI: COLOR_HI_RED,
	LEVEL_FATA: COLOR_HI_RED,
}
```

### context

```yaml
# 日志组件配置
logger:
  Path:    "/var/log/my-app"
  Level:   "all"
  Stdout:  false
  CtxKeys: ["RequestId"]		## 通过ctx上下文变量中读取
```

```go
ctx := context.WithValue(context.Background(), "RequestId", "123456789")
g.Log().Error(ctx,"runtime error")

// 2020-06-08 20:17:03.630 [ERRO] {123456789} runtime error
```

用途：自定义 requestId，每个请求唯一，用于检索同一个请求的所有日志

### handler

中间件

转json输出

```go
package main

import (
	"context"
	"encoding/json"
	"os"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/glog"
	"github.com/gogf/gf/v2/text/gstr"
)

// JsonOutputsForLogger is for JSON marshaling in sequence.
type JsonOutputsForLogger struct {
	Time    string `json:"time"`
	Level   string `json:"level"`
	Content string `json:"content"`
}

// LoggingJsonHandler is a example handler for logging JSON format content.
var LoggingJsonHandler glog.Handler = func(ctx context.Context, in *glog.HandlerInput) {
	jsonForLogger := JsonOutputsForLogger{
		Time:    in.TimeFormat,
		Level:   gstr.Trim(in.LevelFormat, "[]"),
		Content: gstr.Trim(in.Content),
	}
	jsonBytes, err := json.Marshal(jsonForLogger)	// 转json
	if err != nil {
		_, _ = os.Stderr.WriteString(err.Error())
		return
	}
	in.Buffer.Write(jsonBytes)			// 放到Buffer中
	in.Buffer.WriteString("\n")
	in.Next(ctx)						// 放行
}

func main() {
	g.Log().SetHandlers(LoggingJsonHandler)		// 注册中间件
	ctx := context.TODO()
	g.Log().Debug(ctx, "Debugging...")
	g.Log().Warning(ctx, "It is warning info")
	g.Log().Error(ctx, "Error occurs, please have a check")
}

// 注册全局中间件
func main() {
	ctx := context.TODO()
	glog.SetDefaultHandler(LoggingJsonHandler)

	g.Log().Debug(ctx, "Debugging...")
	glog.Warning(ctx, "It is warning info")
	glog.Error(ctx, "Error occurs, please have a check")
}
```

输出到第三方日志收集 --- graylog

```go
package main

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/glog"
	gelf "github.com/robertkowalski/graylog-golang"		// 使用了第三方graylog客户端组件
)

var grayLogClient = gelf.New(gelf.Config{
	GraylogPort:     80,
	GraylogHostname: "graylog-host.com",
	Connection:      "wan",
	MaxChunkSizeWan: 42,
	MaxChunkSizeLan: 1337,
})

// LoggingGrayLogHandler is an example handler for logging content to remote GrayLog service.
var LoggingGrayLogHandler glog.Handler = func(ctx context.Context, in *glog.HandlerInput) {
	in.Next()
	grayLogClient.Log(in.Buffer.String())		// 执行完业务逻辑后 收集到graylog
}

func main() {
	g.Log().SetHandlers(LoggingGrayLogHandler)	// 注册中间件
	ctx := context.TODO()
	g.Log().Debug(ctx, "Debugging...")
	g.Log().Warning(ctx, "It is warning info")
	g.Log().Error(ctx, "Error occurs, please have a check")
	glog.Print(ctx, "test log")
}
```

**提供好的 HandlerJson**--- `glog.SetDefaultHandler(glog.HandlerJson)`

### JSON格式

想要支持`JSON`数据格式的日志输出非常简单，给打印方法提供`map`/`struct`类型参数即可

```go
func main() {
	ctx := context.TODO()
	g.Log().Debug(ctx, g.Map{"uid": 100, "name": "john"})
	type User struct {
		Uid  int    `json:"uid"`
		Name string `json:"name"`
	}
	g.Log().Debug(ctx, User{100, "john"})
}
```

也可以结合`gjson.MustEncode来`实现`Json`内容输出

```go
func main() {
	ctx := context.TODO()
	type User struct {
		Uid  int    `json:"uid"`
		Name string `json:"name"`
	}
	g.Log().Debugf(ctx, `user json: %s`, gjson.MustEncode(User{100, "john"}))
}
```

### 异步输出

```go
func main() {
	ctx := context.TODO()
	g.Log().SetAsync(true)
	for i := 0; i < 10; i++ {
		g.Log().Print(ctx, "async log", i)
	}
	time.Sleep(time.Second)			// 目前只能这样，待优化
}
```

### 堆栈打印

错误日志信息支持`Stack`特性，该特性可以自动打印出当前调用日志组件方法的堆栈信息，

该堆栈信息可以通过`Notice*/Warning*/Error*/Critical*/Panic*/Fatal*`等错误日志输出方法触发，

```go
glog.Error(ctx, "This is error!")
```

也可以通过`GetStack/PrintStack`获取/打印。错误信息的`stack`信息对于调试来说相当有用

```go
func main() {
	ctx := context.TODO()
	glog.PrintStack(ctx)
	glog.New().PrintStack(ctx)

	fmt.Println(glog.GetStack())
	fmt.Println(glog.New().GetStack())
}
```

## gdb

### 配置文件

```yaml
database:
  default:
    host:          "127.0.0.1"
    port:          "3306"
    user:          "root"
    pass:          "12345678"
    name:          "test"
    type:          "mysql"
    extra:         "local=Local&parseTime=true"
    role:          "master"
    debug:         "true"
    dryrun:        0
    weight:        "100"
    prefix:        "gf_"
    charset:       "utf8"
    timezone:      "local"
    maxIdle:       "10"
    maxOpen:       "100"
    maxLifetime:   "30s"
```

**集群**

```yaml
database:
  default:		## 通过 g.DB()获取
  - link: "mysql:root:12345678@tcp(127.0.0.1:3306)/test"
    role: "master"
  - link: "mysql:root:12345678@tcp(127.0.0.1:3306)/test"
    role: "slave"

  user:			## 通过 g.DB("user")获取
  - link: "mysql:root:12345678@tcp(127.0.0.1:3306)/user"
    role: "master"
  - link: "mysql:root:12345678@tcp(127.0.0.1:3306)/user"
    role: "slave"
  - link: "mysql:root:12345678@tcp(127.0.0.1:3306)/user"
    role: "slave"
```

**日志**

```yaml
database:
  logger:
    path:    "/var/log/gf-app/sql"
    level:   "all"
    stdout:  true
  default:
    link:    "mysql:root:12345678@tcp(127.0.0.1:3306)/user_center"
    debug:   true
```

### 链式调用

**模型创建** --- Model方法用于创建基于数据表的`Model`对象。常见的，也可以使用`g`对象管理模块中的`Model`方法在默认的数据库配置上创建`Model`对象

```go
g.Model("user")
// 或者
g.DB().Model("user")
```

```go
// 切换
m := g.Model("user")
m  = m.DB(g.DB("order"))
```

```go
s := "SELECT * FROM `user`"
m := g.ModelRaw(s).WhereLT("age", 18).Limit(10).OrderAsc("id").All()
// SELECT * FROM `user` WHERE `age`<18 ORDER BY `id` ASC LIMIT 10
```

```go
// 默认非链式安全 ---- 共用一个Model，所以条件都会叠加
user := g.Model("user")
user.Where("status", g.Slice{1,2,3})
if vip {
    // 查询条件自动叠加，修改当前模型对象
    user.Where("money>=?", 1000000)
} else {
    // 查询条件自动叠加，修改当前模型对象
    user.Where("money<?",  1000000)
}
r, err := user.All()
n, err := user.Count()
```

```go
// clone
user := g.Model("user")			// 定义一个用户模型单例
m := user.Clone()				// 克隆一个新的用户模型
m.Where("status", g.Slice{1,2,3})
if vip {
    m.Where("money>=?", 1000000)
} else {
    m.Where("money<?",  1000000)
}
r, err := m.All()
n, err := m.Count()
```

```go
// safe
user := g.Model("user").Safe()
m := user.Where("status", g.Slice{1,2,3})
if vip {
    // 查询条件通过赋值叠加
    m = m.Where("money>=?", 1000000)		// 需要接收返回值
} else {
    // 查询条件通过赋值叠加
    m = m.Where("money<?",  1000000)
}
r, err := m.All()
n, err := m.Count()
```

### 写入保存

`Insert`：使用`INSERT INTO`语句进行数据库写入，存在主键或唯一索引时，返回失败，否则写入一条新数据

`Replace`：使用`REPLACE INTO`语句进行数据库写入，存在主键或者唯一索引时，删除并写入

`Save`：使用`INSERT INTO`语句进行数据库写入，存在主键或者唯一索引时，有则更新，无则新增

`InsertIgnore`：存在主键或者唯一索引时，忽略错误，继续写入

`InsertAndGetId`：返回自增id

`OnDuplicate/OnDuplicateEx`：需要结合`Save`方法一起使用，用于指定`Save`方法的更新/不更新字段，参数为字符串、字符串数组、Map

```go
// INSERT INTO `user`(`name`) VALUES('john')
g.Model("user").Data(g.Map{"name": "john"}).Insert()
g.Model("user").Insert(g.Map{"name": "john"})

// INSERT IGNORE INTO `user`(`uid`,`name`) VALUES(10000,'john')
g.Model("user").Data(g.Map{"uid": 10000, "name": "john"}).InsertIgnore()
g.Model("user").InsertIgnore(g.Map{"uid": 10000, "name": "john"})

// REPLACE INTO `user`(`uid`,`name`) VALUES(10000,'john')
g.Model("user").Data(g.Map{"uid": 10000, "name": "john"}).Replace()
g.Model("user").Replace(g.Map{"uid": 10000, "name": "john"})

// INSERT INTO `user`(`uid`,`name`) VALUES(10001,'john') ON DUPLICATE KEY UPDATE `uid`=VALUES(`uid`),`name`=VALUES(`name`)
g.Model("user").Data(g.Map{"uid": 10001, "name": "john"}).Save()
g.Model("user").Save(g.Map{"uid": 10001, "name": "john"})
```

**对象**

```go
type User struct {
    Uid  int    `orm:"uid"`
    Name string `orm:"name"`
    Site string `orm:"site"`
}
user := &User{
    Uid:  1,
    Name: "john",
    Site: "https://goframe.org",
}
// INSERT INTO `user`(`uid`,`name`,`site`) VALUES(1,'john','https://goframe.org')
g.Model("user").Data(user).Insert()
```

**批量**

```go
// INSERT INTO `user`(`name`) VALUES('john_1'),('john_2'),('john_3')
g.Model("user").Data(g.List{
    {"name": "john_1"},
    {"name": "john_2"},
    {"name": "john_3"},
}).Insert()
```

```go
// INSERT INTO `user`(`name`) VALUES('john_1'),('john_2')
// INSERT INTO `user`(`name`) VALUES('john_3')
g.Model("user").Data(g.List{
    {"name": "john_1"},
    {"name": "john_2"},
    {"name": "john_3"},
}).Batch(2).Insert()		// Batch 指定分批插入的数量，默认10
```

**语句嵌入**

```go
// INSERT INTO `user`(`id`,`passport`,`password`,`nickname`,`create_time`) VALUES(id+2,'john','123456',now())
g.Model("user").Data(g.Map{
	"id":          gdb.Raw("id+2"),
	"passport":    "john",
	"password":    "123456",
	"nickname":    "JohnGuo",
	"create_time": gdb.Raw("now()"),
}).Insert()
```

### 更新删除

```go
// UPDATE `user` SET `name`='john guo' WHERE name='john'
g.Model("user").Data(g.Map{"name" : "john guo"}).Where("name", "john").Update()
g.Model("user").Data("name='john guo'").Where("name", "john").Update()
// UPDATE `user` SET `status`=1 ORDER BY `login_time` asc LIMIT 10
g.Model("user").Data("status", 1).Order("login_time asc").Limit(10).Update()

// UPDATE `user` SET `status`=1 WHERE 1
g.Model("user").Data("status=1").Where(1).Update()
g.Model("user").Data("status", 1).Where(1).Update()
g.Model("user").Data(g.Map{"status" : 1}).Where(1).Update()
```

```go
// UPDATE `user` SET `name`='john guo' WHERE name='john'
g.Model("user").Update(g.Map{"name" : "john guo"}, "name", "john")
g.Model("user").Update("name='john guo'", "name", "john")

// UPDATE `user` SET `status`=1 WHERE 1
g.Model("user").Update("status=1", 1)
g.Model("user").Update(g.Map{"status" : 1}, 1)
```

