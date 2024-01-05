# Spring问题

## HttpServletRequest可以直接注入吗，会不会存在线程安全问题

- 在Spring框架中，`HttpServletRequest`是线程安全的
- 对于每个HTTP请求，Spring都会创建一个新的`HttpServletRequest`对象
- 因此，你可以在控制器（Controller）中注入并使用`HttpServletRequest`，而不用担心并发问题。

- `HttpServletRequest`对象和`HttpServletResponse`对象是有 web 容器创建的，如 Tomcat
- 这些对象只在处理该请求的线程中可见，并在响应生成后被丢弃

**以 Tomcat 为例**
- Tomcat是一个遵循Servlet规范的开源Servlet容器，它处理HTTP请求的方式符合该规范。当HTTP请求到达Tomcat时，Tomcat会创建`HttpServletRequest`和`HttpServletResponse`对象，并将它们传递到相应的Servlet（在Spring MVC中，通常是`DispatcherServlet`）。以下是Tomcat创建`HttpServletRequest`对象的过程的简化概述：

    - **监听端口**：Tomcat启动时会在指定的端口上启动一个或多个连接器（Connector），等待HTTP请求。

    - **接收HTTP请求**：当一个HTTP请求到达时，连接器负责接收请求并为其创建一个`Socket`对象。

    - **创建请求和响应对象**：连接器使用`Socket`对象来创建一个`Request`对象和一个`Response`对象。这些是Tomcat特有的实现类，分别实现了`HttpServletRequest`和`HttpServletResponse`接口。

    - **填充请求数据**：Tomcat解析HTTP请求数据（如HTTP方法、URL、头信息、Cookie、请求体等），并将这些数据填充到`Request`对象中。

    - **处理请求**：连接器将请求传递给它的管道（Pipeline），管道中定义了一系列的阀（Valve）和过滤器（Filter），最终请求会到达 spring 的`DispatcherServlet`。

    - **Servlet处理**：`DispatcherServlet`处理请求，调用相关的控制器和服务，最后生成响应。
        - 来自Spring源码的关键部分是`DispatcherServlet`类。这是Spring MVC的核心，它负责分派请求到相应的控制器
        - 在处理请求时，`DispatcherServlet`调用`doService`方法，它又调用`doDispatch`方法。
        - 在这个过程中，`HttpServletRequest`和`HttpServletResponse`对象被传递到各个组件，但它们始终保持在同一个线程中（ **ThreadLocal** ）。


    ```java
    // FrameworkServlet 是 DispatcherServlet 父抽象类
    protected final void processRequest(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
    
        LocaleContext localeContext = this.buildLocaleContext(request);
        // 将ServletRequest转换为ServletRequestAttributes
        // RequestContextHolder 封装了 ThreadLocal 的使用
        RequestAttributes previousAttributes = RequestContextHolder.getRequestAttributes();
        ServletRequestAttributes attributes = new ServletRequestAttributes(request, response);
        ServletRequestAttributes requestAttributes = this.buildRequestAttributes(request, response, previousAttributes);
        this.initContextHolders(request, localeContext, requestAttributes);
        RequestContextHolder.setRequestAttributes(attributes, true);
    
        try {
            // 在这里，Spring MVC会继续处理请求，例如调用控制器方法等
            doService(request, response);
        } finally {
            // 请求处理完成后，清理工作
            RequestContextHolder.resetRequestAttributes();
            if (previousAttributes != null) {
                RequestContextHolder.setRequestAttributes(previousAttributes, false);
            } else {
                RequestContextHolder.resetRequestAttributes();
            }
            attributes.requestCompleted();
        }
    }
    
    // DispatcherServlet 的 doService 方法中的代码片段
    protected void doService(HttpServletRequest request, HttpServletResponse response) throws Exception {
        // 将当前请求的属性绑定到线程
        RequestAttributes attributes = new ServletRequestAttributes(request);
        RequestContextHolder.setRequestAttributes(attributes);
    
        try {
            // 处理请求，例如调用控制器方法等
            doDispatch(request, response);
        } finally {
            // 清理工作：在请求处理完成后移除绑定的 RequestAttributes
            RequestContextHolder.resetRequestAttributes();
            // ... 其他的清理工作 ...
        }
    }
    // DispatcherServlet 的 doDispatch 方法中的代码片段
    protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
        // Determine handler for the current request.   确定当前请求的处理程序
        HandlerExecutionChain mappedHandler = getHandler(request);
        // Actually invoke the handler.                 真正调用处理程序
        ModelAndView mv = ha.handle(processedRequest, response, mappedHandler.getHandler());
        // Do view rendering if necessary.              如有必要，进行视图渲染。
        render(mv, processedRequest, response);
    }
    
    // RequestContextHolder 的代码片段
    public abstract class RequestContextHolder {
    
        private static final ThreadLocal<RequestAttributes> requestAttributesHolder =
                new NamedThreadLocal<>("Request attributes");
    
        public static void resetRequestAttributes() {
            requestAttributesHolder.remove();
        }
    
        public static void setRequestAttributes(RequestAttributes attributes) {
            requestAttributesHolder.set(attributes);
        }
    
        public static RequestAttributes getRequestAttributes() {
            return requestAttributesHolder.get();
        }
    }
    ```
## 跨域

https://www.ruanyifeng.com/blog/2016/04/cors.html

> 不生效排查
>
> - **安全配置冲突**：如果你的项目中使用了Spring Security，那么Spring Security的配置可能会覆盖或影响CORS设置。确保Spring Security配置中也允许了CORS。
>
>   ```java
>      @Override
>      protected void configure(HttpSecurity http) throws Exception {
>          http
>              // 其他配置...
>              .cors().and() // 激活CORS配置
>              // 其他配置...
>      }
>   ```
>
> - **控制器配置冲突**：在控制器中，如果你使用了`@CrossOrigin`注解并且与全局CORS配置冲突，它可能会覆盖全局的配置。
>
> - **通配符配置问题**：使用`allowedOrigins("*")`和`allowCredentials(true)`一起使用是不符合CORS规范的。当`allowCredentials`为`true`时，`allowedOrigins`不能使用通配符。你需要指定确切的域名。
>
> - **中间件/代理服务器**：如果你在中间件（如Nginx）或代理服务器（如Apache）后面运行应用程序，确保这些中间件也配置了正确的CORS策略。
>
> - **错误的请求信息**：检查发出的请求是否符合配置的CORS策略，例如请求的`Origin`头是否在允许的源列表中。
>
> - **拦截器顺序**：如果有其他拦截器可能在`CorsInterceptor`之前执行并且它们不是透明的（即它们可能处理或拒绝请求），这可能会导致CORS相关的预检请求不被正确处理。
>
> - **浏览器缓存**：有时浏览器缓存可能会导致CORS相关的变化没有立即反映。尝试清除浏览器缓存或在无痕模式下测试。
>
> - **Spring Boot版本**：如果你使用的是较老的Spring Boot版本，可能需要额外的配置或更新。

> 上游服务器配了，Nginx 需不需要再配置呢？
>
> - **直接访问Java应用**：如果客户端直接访问Java应用（不通过Nginx），并且Java应用已经配置了CORS，那么Nginx中*不需要*额外配置跨域。
> - **Nginx作为反向代理**：如果Nginx作为反向代理，将请求转发到Java应用，通常情况下，*不需要*在Nginx中配置CORS。但是，有些情况下，Nginx可能会*覆盖或丢失*从Java应用传递过来的CORS相关的响应头，这时你需要确保Nginx正确地传递这些头部。
> - **Nginx用于负载均衡**：如果使用Nginx进行负载均衡，分发请求到多个Java应用实例，通常情况下，*不需要*在Nginx中配置CORS。同样，要确保Nginx不会*干扰*CORS头的传递。
> - **静态资源**：如果Nginx用于托管静态资源（例如，前端JavaScript文件），而这些资源需要支持跨域请求，那么***需要***在Nginx中配置CORS。
> - **缓存和性能优化**：如果Nginx用于缓存或其他性能优化，并且这些优化可能影响CORS头的处理，那么可能需要在Nginx中进行一些额外配置。
> - **特定的安全需求**：如果有特定的安全需求，比如需要在Nginx层面进行更精细的跨域控制，那么在Nginx中配置CORS是必要的。

**Spring**

`@CrossOrigin`注解用于在Spring框架中处理跨域资源共享（CORS）的配置。它可以用来控制跨域请求的行为，包括允许的源、允许的HTTP方法、允许的头部信息等。

- origins：允许的源，可以是一个字符串数组，用于指定允许跨域请求的源。例如：`origins = "http://localhost:8080"` 或 `origins = {"http://localhost:8080", "http://example.com"}`
- allowedHeaders：允许的头部信息，用于指定允许跨域请求的自定义头部。例如：`allowedHeaders = {"Authorization", "Content-Type"}`
- exposedHeaders：暴露的头部信息，用于指定允许访问的自定义响应头部。例如：`exposedHeaders = {"Authorization"}`
- methods：允许的HTTP方法，用于指定允许的跨域请求的HTTP方法。例如：`methods = {RequestMethod.GET, RequestMethod.POST}`
- allowCredentials：是否允许发送身份凭证（如cookies）。默认为false。
- maxAge：预检请求的缓存时间（秒），用于指定OPTIONS预检请求的结果可以被缓存的时间。

下面是一个使用@CrossOrigin注解的示例：
```java
@RestController
public class MyController {

    @CrossOrigin(origins = "http://localhost:8080", maxAge = 3600)
    @RequestMapping("/example")
    public String example() {
        return "Hello, CORS!";
    }
}

```

**全局配置**

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 第一个匹配的映射将被用来决定CORS策略
        registry.addMapping("/api/**") // 指定路径为"/api/**"
                .allowedOrigins("http://localhost:8080") // 允许的源，可以使用具体的域名或IP地址
                .allowedMethods("GET", "POST") // 允许的HTTP方法
                .allowedHeaders("Authorization", "Content-Type") // 允许的请求头
                .allowCredentials(true) // 允许发送身份凭证（如cookies）
                .maxAge(3600); // 预检请求的缓存时间（秒）

        registry.addMapping("/**") // 匹配所有路径
                .allowedOrigins("*") // 允许的源，可以使用具体的域名或IP地址
                .allowedMethods("*") // 允许的HTTP方法，如GET、POST等
                .allowedHeaders("*") // 允许的请求头
                .allowCredentials(true) // 允许发送身份凭证（如cookies）
                .maxAge(3600); // 预检请求的缓存时间（秒）
    }
}
```

**Nginx配置**

```nginx
location / {
    # ... 其他配置 ...

    # 通用CORS头部
    add_header 'Access-Control-Allow-Origin' '$http_origin';
    add_header 'Access-Control-Allow-Credentials' "true";
    add_header 'Access-Control-Allow-Methods' 'GET, POST,OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, siteId, language';
    add_header 'Access-Control-Max-Age' 1728000;

    # ... 其他必要请求头 根据实际环境配置 ...
   # proxy_set_header        siteId  22;
   # proxy_set_header        loginMode  0;

    # 确保 Nginx 也为 OPTIONS 请求添加 CORS 相关头部
    # 如果后端已处理 OPTIONS 请求，则此行可选
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

## MultipartFile处理文件时阻塞的吗

**是否阻塞取决于是否读取了流中的内容**

- `InputStream` 提供了多个读取方法，如 `read()`、`read(byte[] b)`、`read(byte[] b, int off, int len)` 
- 没有数据就会一直阻塞，等待新数据
- 如果已经到达流的末尾，方法会返回一个特殊值（通常是 `-1`）来表示没有更多的数据，即`inputStream.read() == -1`判断结束

> 也就是说 MultipartFile 的 getInputStream 方法本身不阻塞，但是 getBytes 方法是阻塞的，会把所有数据读到内存

**将InputStream 重新发起http请求，是否阻塞（边读边发），取决于 HTTP 客户端库**，如 Apache HttpClient 或 OkHttp）中，通常可以配置请求以支持流式传输

## 单元测试

### java.lang.NoClassDefFoundError: org/hamcrest/SelfDescribing

- junit.jar: Includes the Hamcrest classes. The simple all-in-one solution to get started quickly.Starting with version 4.11, Hamcrest is no longer included in this jar.
- junit-dep.jar: Only includes the JUnit classes but not Hamcrest. Lets you use a different Hamcrest version.


两个办法解决：

   1.junit版本降到4.10

   2.导入hamcrest-core-1.3.jar
   ```xml
   <dependency>
        <groupId>org.hamcrest</groupId>
        <artifactId>hamcrest-core</artifactId>
        <version>1.3</version>
    </dependency>
    ```
如果用 SpringJUnit4ClassRunner， 只能引入 hamcrest-core 否则报错 SpringJUnit4ClassRunner requires JUnit 4.12 or higher.