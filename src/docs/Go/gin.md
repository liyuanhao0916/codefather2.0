# Gin

## Hello Gin

`go get -u github.com/gin-gonic/gin`

```go
package main

import "github.com/gin-gonic/gin"

func main() {

	r := gin.Default()
	r.GET("/helloGin", _helloGin)
    r.Run()	// 空参默认0.0.0.0:8080
    //r.Run(":8080")
    //r.Run("127.0.0.1:8080")
}

func _helloGin(context *gin.Context) {
	context.String(200, "Hello Gin")
}
```

```go
// 启动方式一
router.Run(":8000")
// 启动方式二,原生方式，需要引入 net/http 包，router.Run本质就是http.ListenAndServe的进一步封装
http.ListenAndServe(":8000", router)
```

## 路由

```go
// 默认路由使用了2个中间件Logger(), Recovery()
r := gin.Default()
// 路由分组, 类似java中类上的@RequestMapping
g := r.Group("/sku")
{
    g.GET("/list",_skuList)
    g.POST("/save",_skuSave)
}
```

## 响应结果

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {

	r := gin.Default()

	// 返回页面前要先加载模板文件
	r.LoadHTMLGlob("templates/*")
	// 访问单个文件
	r.StaticFile("/hello", "static/hello.txt") // http://localhost:8080/hello
	// 可通过路径使整个文件夹都可被访问
	r.StaticFS("/static", http.Dir("static")) // http://localhost:8080/static/db.txt

	r.GET("/json", _json)
	r.GET("/helloGin", _helloGin)
	r.GET("/xml", _xml)
	r.GET("/yaml", _yaml)
	r.GET("/index", _index)       // 响应页面
	r.GET("/redirect", _redirect) // 重定向
	r.Run()
}

// 重定向
func _redirect(context *gin.Context) {
	context.Redirect(http.StatusFound, "https://www.baidu.com")
}

// 响应字符串
func _helloGin(context *gin.Context) {
	context.String(http.StatusOK, "Hello Gin")
}

// 响应JSON
func _json(context *gin.Context) {

	type User struct {
		Name string
		Age  int
	}
	user := User{Name: "liyuanhao", Age: 18}

	// 方式一
	context.JSON(http.StatusOK, user)

	// 方式二
	context.JSON(http.StatusOK, gin.H{
		"status": http.StatusOK,
		"mag":    "成功",
		"data": gin.H{
			"name": "lalala",
			"age":  17,
		},
	})
}

// 响应页面
func _index(context *gin.Context) {
	context.HTML(http.StatusOK, "index.html", gin.H{
		"title": "首页",
		"h1":    "你好",
	})
}

// 响应xml
func _xml(context *gin.Context) {
	context.XML(http.StatusOK, gin.H{
		"status": http.StatusOK,
		"mag":    "成功",
		"data": gin.H{
			"name": "lalala",
			"age":  17,
		},
	})
}

// 响应yaml
func _yaml(context *gin.Context) {
	context.YAML(http.StatusOK, gin.H{
		"status": http.StatusOK,
		"mag":    "成功",
		"data": gin.H{
			"name": "lalala",
			"age":  17,
		},
	})
}
```

## 请求参数

```go
package main

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	r := gin.Default()
	r.GET("/query", _query)                 // 路径拼参
	r.GET("/param/:userId/:bookId", _param) // restful
	r.POST("/form", _form)                  // 表单参数 multipart/form-data 和 application/x-www-form-urlencoded
	r.POST("/raw", _raw)                    // 原始参数 GetRawData
	r.GET("/header", _header)               // 请求头
	r.GET("/setRespHeader", _setRespHeader) // 设置响应头
	r.Run()
}

func _setRespHeader(context *gin.Context) {
	context.Header("token", "jdalkdjalkdjalkjd")
	context.JSON(http.StatusOK, gin.H{
		"status": http.StatusOK,
		"mag":    "success",
		"data":   "设置响应头",
	})
}

func _header(context *gin.Context) {
	fmt.Println(context.GetHeader("uSer-agent")) // 不区分大小写
	fmt.Println("----------------------------")
	fmt.Println(context.Request.Header)
	fmt.Println("----------------------------")
	fmt.Println(context.Request.Header.Get("user-aGent")) // 不区分大小写
	fmt.Println("----------------------------")
	fmt.Println(context.Request.Header["User-Agent"]) // *** 区分大小写
}

func _raw(context *gin.Context) {
	body, err := context.GetRawData()
	fmt.Println(string(body))
	if err != nil {
		return
	}

	type User struct {
		Name string
		Age  int
	}
	user := User{}
	err = json.Unmarshal(body, &user)
	if err != nil {
		return
	}
	fmt.Println(user)
}

func _form(context *gin.Context) {
	fmt.Println(context.PostForm("user"))
	fmt.Println(context.PostFormArray("user"))
	fmt.Println(context.DefaultPostForm("user", "lalalalalalalla"))
	fmt.Println(context.MultipartForm())
}

func _param(context *gin.Context) {
	fmt.Println(context.Param("bookId"))
	fmt.Println(context.Param("userId"))
}

func _query(context *gin.Context) {
	fmt.Println(context.Query("user"))                     // 存在返回v, 不存在返回“”
	fmt.Println(context.GetQuery("user"))                  // 存在返回v,true, 不存在返回“”,false
	fmt.Println(context.QueryArray("user"))                // 用于返回1k多v的切片
	fmt.Println(context.DefaultQuery("user", "liyuanhao")) // 不存在给个默认值
}
```

## 参数绑定

gin中的bind可以很方便的将 前端传递 来的数据与 `结构体` 进行 `参数绑定` ，以及参数校验

在使用这个功能的时候，需要给结构体加上Tag `json` `form` `uri` `xml` `yaml`

Must Bind ---- 不用，校验失败会改状态码

**Should Bind ---- 可以绑定json，query，param，yaml，xml，如果校验不通过会返回错误**

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	r := gin.Default()
	r.POST("/bindJson", _bindJson)               // 绑定json
	r.POST("/bindQuery", _bindQuery)             // 绑定表单
	r.POST("/bindUri/:name/:age/:sex", _bindUri) // 绑定uri
	r.POST("/bind", _bind)                       // 根据 content-type 自动绑定
	r.Run()
}

func _bind(context *gin.Context) {
	user := User{}
	err := context.ShouldBind(&user)
	if err != nil {
		fmt.Println(err)
		context.JSON(200, gin.H{"msg": "你错了"})
		return
	}
	context.JSON(http.StatusOK, user)
}

func _bindUri(context *gin.Context) {
	user := User{}
	err := context.ShouldBindUri(&user)
	if err != nil {
		return
	}
	context.JSON(http.StatusOK, user)
}

func _bindQuery(context *gin.Context) {
	user := User{}
	err := context.ShouldBindQuery(&user)
	if err != nil {
		return
	}
	context.JSON(http.StatusOK, user)
}

type User struct {
	Name string `json:"name" form:"name" uri:"name"`
	Age  int    `json:"age" form:"age" uri:"age"`
	Sex  string `json:"sex" form:"sex" uri:"sex"`
}

func _bindJson(context *gin.Context) {
	user := User{}
	err := context.ShouldBindJSON(&user)
	if err != nil {
		return
	}
	context.JSON(http.StatusOK, user)
}
```

## 参数校验

> ```go
> // 不能为空，并且不能没有这个字段
> required： 必填字段，如：binding:"required"  
> 
> // 针对字符串的长度
> min 最小长度，如：binding:"min=5"
> max 最大长度，如：binding:"max=10"
> len 长度，如：binding:"len=6"
> 
> // 针对数字的大小
> eq 等于，如：binding:"eq=3"
> ne 不等于，如：binding:"ne=12"
> gt 大于，如：binding:"gt=10"
> gte 大于等于，如：binding:"gte=10"
> lt 小于，如：binding:"lt=10"
> lte 小于等于，如：binding:"lte=10"
> 
> // 针对同级字段的
> eqfield 等于其他字段的值，如：PassWord string `binding:"eqfield=Password"`
> nefield 不等于其他字段的值
> 
> 
> - 忽略字段，如：binding:"-"
> ```
>
> ```go
> // 枚举  只能是red 或green
> oneof=red green 
> 
> // 字符串  
> contains=fengfeng  // 包含fengfeng的字符串
> excludes // 不包含
> startswith  // 字符串前缀
> endswith  // 字符串后缀
> 
> // 数组
> dive  // dive后面的验证就是针对数组中的每一个元素
> 
> // 网络验证
> ip
> ipv4
> ipv6
> uri
> url
> // uri 在于I(Identifier)是统一资源标示符，可以唯一标识一个资源。
> // url 在于Locater，是统一资源定位符，提供找到该资源的确切路径
> 
> // 日期验证  1月2号下午3点4分5秒在2006年
> datetime=2006-01-02
> ```

1、结构体通过tag进行校验配置，通过binding绑定

```go
type User struct {
	Name    string `json:"name" binding:"required" msg:"用户名不能为空"`
	Age     int    `json:"age" binding:"gte=18" msg:"年龄必须大于18"`
	Sex     string `json:"sex" binding:"oneof=男 女" msg:"只能填男或女"`
	Address string `json:"address" binding:"max=10" msg:"最大长度10"`
}
```

2、通过反射，获取tag中的msg，err是ShouldBind的错误信息，obj是绑定的结构体**指针**，validator这个包要引用v10这个版本的

```go
func GetValidMag(err error, obj any) string {
	getObj := reflect.TypeOf(obj)

    // 强转为校验错误，拿字段名
	if errors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range errors {
			if f, exits := getObj.Elem().FieldByName(e.Field()); exits {
                // 拿字段的mag tag,这里我们只取一个
				return f.Tag.Get("msg")
			}
		}
	}
	return err.Error()
}
```

3、统一返回结果

```go
type Resp struct {
	Status int    `json:"status"`
	Msg    string `json:"msg"`
	Data   any    `json:"data"`
}
```

4、handle函数

```go
func _binding(context *gin.Context) {
	user := User{}
	err := context.ShouldBind(&user)
	var msg string
	if err != nil {
		fmt.Println(err)
		msg = GetValidMag(err, &user)
		context.JSON(http.StatusInternalServerError, Resp{
			Status: http.StatusInternalServerError,
			Msg:    msg,
		})
		return
	}
	context.JSON(http.StatusOK, Resp{
		Status: http.StatusOK,
		Msg:    msg,
		Data:   user,
	})
}
```

**自定义校验器**

```go
// 注册
func main() {
	r := gin.Default()
	r.POST("/binding", _binding)

	// 自定义校验器
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		// 注册校验器
		v.RegisterValidation("nonBlank", nonBlank)
	}
	r.Run()
}

// 定义
func nonBlank(fl validator.FieldLevel) bool {
	name := fl.Field().Interface().(string)
	if name == "" {
		return false
	}
	return true
}

// 使用
type User struct {
	Name    string `json:"name" binding:"required" msg:"用户名不能为空"`
	Age     int    `json:"age" binding:"gte=18" msg:"年龄必须大于18"`
	Sex     string `json:"sex" binding:"oneof=男 女" msg:"只能填男或女"`
	Address string `json:"address" binding:"nonBlank" msg:"地址不能为空"`
}
```

## 文件上传下载

**上传**

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"log"
	"net/http"
)

func main() {

	r := gin.Default()
	// 为 multipart forms 设置较低的内存限制 (默认是 32 MiB)
	r.MaxMultipartMemory = 8 << 20 // 8 * 2^10 * 2^10
	r.POST("/upload", _upload)
	r.POST("/manyUpload", _manyUpload)
	r.Run()
}

func _manyUpload(context *gin.Context) {
	form, err := context.MultipartForm()
	if err != nil {
		return
	}
	files := form.File["adada"]
	for _, file := range files {
		log.Println(file.Filename)
		// ----------- 以标准流输出 ----------
		open, err := file.Open()
		if err != nil {
			return
		}
		all, err := io.ReadAll(open)
		if err != nil {
			return
		}
		fmt.Println(all)
	}
	context.JSON(http.StatusOK, gin.H{
		"status": http.StatusOK,
		"msg":    fmt.Sprintf("%d files uploaded!", len(files)),
	})
}

func _upload(context *gin.Context) {
	file, err := context.FormFile("adada")
	if err != nil {
		return
	}
	log.Println(file.Filename)
	dst := "./" + file.Filename
	context.SaveUploadedFile(file, dst)

	context.JSON(http.StatusOK, gin.H{
		"status": http.StatusOK,
		"msg":    fmt.Sprintf("%s uploaded!", file.Filename),
	})
}
```

**下载**

```go
// 有些响应，比如图片，浏览器就会显示这个图片，而不是下载，所以我们需要使浏览器唤起下载行为
// 表示是文件流，唤起浏览器下载，一般设置了这个，就要设置文件名
c.Header("Content-Type", "application/octet-stream")
// 用来指定下载下来的文件名
c.Header("Content-Disposition", "attachment; filename="+"牛逼.png")
// 表示传输过程中的编码形式，乱码问题可能就是因为它
c.Header("Content-Transfer-Encoding", "binary")


// 直接响应一个路径下的文件
c.File("uploads/12.png")
```

前后端分离

```go
c.Header("fileName", "xxx.png")
c.Header("msg", "文件下载成功")
c.File("uploads/12.png")
```

## 会话

**cookie**基本不用了

- 明文，不安全
- 增加带宽消耗
- 可以禁用
- 有上限

```go
func testCookie(c *gin.Context){
   // 获取客户端是否携带cookie
   cookie, err := c.Cookie("key_cookie")
   if err != nil {
      cookie = "NotSet"
      // 给客户端设置cookie
      //  maxAge int, 单位为秒
      // path,cookie所在目录
      // domain string,域名
      //   secure 是否智能通过https访问
      // httpOnly bool  是否允许别人通过js获取自己的cookie
      c.SetCookie("key_cookie", "value_cookie", 60, "/",
         "localhost", false, true)
   }
   fmt.Printf("cookie的值是： %s\n", cookie)
}
```

**session**

`go get -u github.com/gorilla/sessions `

gorilla/sessions为自定义session后端提供cookie和文件系统session以及基础结构。

主要功能是：

- 简单的API：将其用作设置签名（以及可选的加密）cookie的简便方法。
- 内置的后端可将session存储在cookie或文件系统中。
- Flash消息：一直持续读取的session值。
- 切换session持久性（又称“记住我”）和设置其他属性的便捷方法。
- 旋转身份验证和加密密钥的机制。
- 每个请求有多个session，即使使用不同的后端也是如此。
- 自定义session后端的接口和基础结构：可以使用通用API检索并批量保存来自不同商店的session。

```go
1、初始化store
var store = sessions.NewCookieStore([]byte("something-very-secret"))

2、获取session对象
session, err := store.Get(context.Request, "SESSION")

3、设置
session.Values["user"] = "123"

4、获取
session.Values["user"]

5、删除
session.Options.MaxAge = -1

6、生效
session.Save(context.Request, context.Writer)
```



```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
	"net/http"
)

// 初始化一个cookie存储对象 something-very-secret ---- 加密密钥
var store = sessions.NewCookieStore([]byte("something-very-secret"))

func main() {
	r := gin.Default()
	r.GET("/userInfo", _verify, _userInfo)	// 验证 session
	r.GET("/login", _login)		// 登录 --- 添加 session
	r.GET("/quit", _quit)		// 退出 --- 删除 session
	r.Run()
}

func _quit(context *gin.Context) {
	session, err := store.Get(context.Request, "SESSION")
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"mag": err})
		return
	}
	// 将session的最大存储时间设置为小于零的数即为删除
	session.Options.MaxAge = -1
	session.Save(context.Request, context.Writer)
	context.JSON(http.StatusOK, gin.H{"msg": "success"})
}

func _login(context *gin.Context) {
	session, err := store.Get(context.Request, "SESSION")
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"mag": err})
		return
	}
	session.Values["user"] = "123"
	session.Save(context.Request, context.Writer)
	context.JSON(http.StatusOK, gin.H{"msg": "success"})
}

func _verify(context *gin.Context) {
	session, err := store.Get(context.Request, "SESSION")
	fmt.Println(session)

	if err != nil {
		fmt.Println(err)
		context.JSON(500, gin.H{"msg": "请登录"})
		context.Abort()
	} else if session.Values["user"] == "123" {
		context.Next()
	} else {
		context.JSON(500, gin.H{"msg": "第一个中间件拦截了"})
		context.Abort()
	}
}

type User struct {
	Name string
	Age  int
}

func _userInfo(context *gin.Context) {
	user := User{Name: "lll", Age: 11}
	context.JSON(http.StatusOK, user)
}
```



## 中间件

> **类似java的拦截器和Servlet**
>
> Gin框架允许开发者在处理请求的过程中，加入用户自己的钩子（Hook）函数。这个钩子函数就叫中间件，中间件适合处理一些公共的业务逻辑，比如登录认证、权限校验、数据分页、记录日志、耗时统计等 即比如，如果访问一个网页的话，不管访问什么路径都需要进行登录，此时就需要为所有路径的处理函数进行统一一个中间件
>
> Gin中的中间件必须是一个gin.HandlerFunc类型
>
> 每个路由，路径后面跟的参数其实都是中间件
>
> ```go
> func (group *RouterGroup) POST(relativePath string, handlers ...HandlerFunc) IRoutes {
> 	return group.handle(http.MethodPost, relativePath, handlers)
> }
> ```
>
> ```go
> r.GET("/login", _login)                // _login 就是一个中间件
> ```
>
> ```go
> r.GET("/userInfo", _verify, _userInfo) // _verify前置可以拦截
> ```

```go
func _verify(context *gin.Context) {
	session, err := store.Get(context.Request, "SESSION")
	fmt.Println(session)

	if err != nil {
		fmt.Println(err)
		context.JSON(500, gin.H{"msg": "请登录"})
		context.Abort()								// 拦截
	} else if session.Values["user"] == "123" {
		context.Next()								// 放行
	} else {
		context.JSON(500, gin.H{"msg": "第一个中间件拦截了"})
		context.Abort()
	}
}
```

**注意**

context.Next()之前的代码相当于java中的preHandle，之后的代码相当于postHandle

如果其中一个中间件响应了c.Abort()，后续中间件将不再执行，直接按照顺序走完所有的响应中间件

**全局中间件**

```go
func main() {
	r := gin.Default()
    r.Use(_verify)		// 
	r.GET("/userInfo", _userInfo)
	r.Run()
}
func _verify(context *gin.Context) {
	session, err := store.Get(context.Request, "SESSION")
	fmt.Println(session)

	if err != nil {
		fmt.Println(err)
		context.JSON(500, gin.H{"msg": "请登录"})
		context.Abort()
	} else if session.Values["user"] == "123" {
		context.Next()
	} else {
		context.JSON(500, gin.H{"msg": "第一个中间件拦截了"})
		context.Abort()
	}
}
```

**中间件数据传递**

```go
func main() {
	r := gin.Default()
	r.GET("/testSet", _set, _testSet)
	r.Run()
}

// 传递数据
func _set(context *gin.Context) {
	log.Println("### 来到了中间件~~")
	context.Set("name", "lalalal")
}
// 接收数据
func _testSet(c *gin.Context) {
	name, _ := c.Get("name")
	log.Println("拿到了中间件中的name", name)
	c.JSON(http.StatusOK, gin.H{"name": name})
}
```

**gin.Default**

从源码中可以看出，默认使用了Logger，Recovery两个中间件

```go
func Default() *Engine {
	debugPrintWARNINGDefault()
	engine := New()
	engine.Use(Logger(), Recovery())
	return engine
}
```

**jwt权限验证**

```js
func main() {
	r := gin.Default()
	xxx := r.Group("/xxx")
	api := xxx.Group("/api").Use(_jwt)
	{
		api.GET("/testJWT", _index)
	}
	r.Run()

}

func _jwt(context *gin.Context) {
	token := context.GetHeader("token")
	if token == "1234" {
		// 验证通过
		context.Next()
		return
	}
	context.JSON(http.StatusOK, gin.H{"mag": "请登录"})
	context.Abort()
}

func _index(context *gin.Context) {
	context.JSON(http.StatusOK, gin.H{"msg": "index"})
}
```

**耗时统计**

```go
func main() {
	r := gin.Default()
	all := r.Group("").Use(_ConsumeTime)
	{
		all.GET("/ConsumeTime", _login)
	}
	r.Run()
}

func _login(context *gin.Context) {
	context.JSON(http.StatusOK, gin.H{"msg": "yes"})
}

func _ConsumeTime(context *gin.Context) {
	start := time.Now()
	context.Next()
	since := time.Since(start)
	// 获取当前请求所对应的函数
	f := context.HandlerName()
	fmt.Printf("函数 %s 耗时 %d\n", f, since)
}
```

## 日志

**gin自带的日志**

```go
// 输出到文件和控制台
func main() {
	fLog, _ := os.Create("./gin_log.log")				// 创建日志文件
	gin.DefaultWriter = io.MultiWriter(fLog, os.Stdout)	// 配置，输出到文件 且 控制台
    // 设置输出的格式  默认
	r := gin.Default()
	r.GET("/testLog", func(context *gin.Context) {
		context.JSON(http.StatusOK, gin.H{"msg": "yes"})
	})
	r.Run()
}
```

