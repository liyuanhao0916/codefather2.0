# Spring Security

## 认证

- 依赖

  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
  ```

- 流程

  - 前端输入账号密码发送登录请求
  - 后端查库，比较，如果正确，使用用户名生成一个jwt
  - 把jwt响应给前端
  - 登录以后访问其他请求时携带token
  - 后端解析jwt，获得用户信息
  - 鉴权：查看是否有权访问
  - 访问资源，响应给前端

- SpringSecurity原理

  - SpringSecurity的原理其实就是一个过滤器链，内部包含了提供各种功能的过滤器（15个）

    ![image-20221202145314697](http://minio.botuer.com/study-node/old/image-20221202145314697.png)

  - 其中重要的有

    - **UsernamePasswordAuthenticationFilter**:负责处理在登陆页面填写了用户名密码后的登陆请求
    - **ExceptionTranslationFilter：**处理过滤器链中抛出的任何AccessDeniedException和AuthenticationException
    - **FilterSecurityInterceptor：**负责权限校验的过滤器

- 认证流程

  ![image-20211214151515385](http://minio.botuer.com/study-node/old/image-20211214151515385.png)

  > Authentication接口: 它的实现类，表示当前访问系统的用户，封装了用户相关信息
  >
  > AuthenticationManager接口：定义了认证Authentication的方法 
  >
  > UserDetailsService接口：加载用户特定数据的核心接口。里面定义了一个根据用户名查询用户信息的方法
  >
  > UserDetails接口：提供核心用户信息。通过UserDetailsService根据用户名获取处理的用户信息要封装成UserDetails对象返回。然后将这些信息封装到Authentication对象中
  >

  - 提交用户名和密码后，先经过UsernamePasswordAuthenticationFilter（AbstractAuthenticationProcessingFilter的实现类），封装Authentication对象，此对象中并没有权限信息
  - 调用authenticate方法进行认证
  - 经过ProviderManager（AuthenticationManager实现类），调用DaoAuthenticationProvider的authenticate方法进行认证
  - 经过DaoAuthenticationProvider（AbstractUserDetailsAuthenticationProvider实现类），调用loadUserByUsername方法查询用户
  - 经过InMemoryUserDetailsManager（UserDetailsService实现类），根据用户名在内存中查询用户及权限，把对应信息及权限信息包装成UserDetails对象
  - 返回UserDetails给DaoAuthenticationProvider，通过PasswordEncode对比Authentication密码是否正确，如果正确就把UserDetails中的权限信息设置到Authentication对象中
  - 返回Authentication对象给UsernamePasswordAuthenticationFilter，如果返回了Authentication对象，就使用SecurityContextHolder.getContext().setAuthentication()方法存储对象

## 授权