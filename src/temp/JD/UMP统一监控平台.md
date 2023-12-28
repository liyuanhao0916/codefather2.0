## 接入

### 接入流程

- 编写代码
- ump.jd.com - 监控服务 - 方法监控中配置方法key的监控和报警

- 启动服务

  - 查看是否存在因依赖冲突导致的启动不起来

  - 查看在 /export/home/tomcat/UMP-Monitor/logs/目录下是否存在以tp、jvm和business结尾的log文件

  - 查看是否有rsyslog进程是否启动

    ​      `ps -ef | grep ump-rsyslog`

  - 查看 rsyslog进程的启动账户是否有读log的权限

  - - a .tp

      > - key : 注册的监控点 key_name 值，须与 ump 平台配置的对应监控点 key 保持一致
      > - hostname：机器主机名或 IP，务必保证只使用一种
      > - processState：方法的执行状态，0 为正常，1 为异常。用于统计可用率
      > - time：该条日志产生时间 格式：yyyyMMddHHmmssSSS
      > - elapsedTime：为方法执行消耗的时间，默认单位（毫秒 ms）
      > - count:采集周期（5s）时间内此方法调用次数
      > - uuid：devops环境独有

      ```json
      {"time":"20130415135617820","key":"JCSS.ObjectCheck.checkfile","hostname":" YPT-Wangyuan ","processState":"0","elapsedTime":"36","count":2}
      ```

    - b.bussiness

      > - key : 注册的监控点 key_name 值，须与 ump 平台配置的对应监控点 key 保持一致
      > - hostname： 机器主机名或 IP，务必保证只使用一种
      > - time : 该条日志产生时间 格式：yyyyMMddHHmmssSSS
      > - type : 自定义类型，这里设为 0 即可
      > - value : 自定义值，这里设为 0 即可
      > - detail : 报警详细信息，长度限制 512 个字符
      > - uuid：devops环境独有

      ```json
      {"time":"20130531192148867","key":"ump.direct.alarm","hostname":" YPT-Wangyuan","type":"0","value":"0","detail":" good luck!"}
      ```

    - c.jvm

      > - key : 注册的监控点 key_name 值，须与 ump 平台配置的对应监控点 key 保持一致
      > - hostname： 机器主机名或 IP，务必保证只使用一种
      > - time : 该条日志产生时间 格式：yyyyMMddHHmmssSSS
      > - instancecode：实例标识：
      > - userdata：jvm暴露指标
      > - uuid：devops环境独有

      ```json
      {"logtype":"JVM","key":"ump.gateway.jvm","hostname":"xxx","time":"20190416212640159","datatype":"2","instancecode":"1249604942","userdata":{"PTC":"52","TC":"49","DTC":"35","LCC":"11288","TLCC":"11288","UCC":"0","NHMU":"113642968","HMU":"351844920","INHMU":"2555904","IHMU":"268435456","CNHMU":"116744192","CHMU":"1542455296","MNHMU":"-1","MHMU":"3817865216","FGCC":"3","YGCC":"14","FGCD":"0","YGCD":"0","FGCT":"346","YGCT":"614","FGCS":"0","YGCS":"0","FGCE":"0","YGCE":"0","CPU":"0.022"}}
      ```

### 代码接入

#### 方式1：AOP接入

- 依赖

  ```xml
  <!--ump-->
  <dependency>
    <groupId>com.jd.ump</groupId>
    <artifactId>profiler</artifactId>
    <version>4.0.5</version>
  </dependency>
  
  <!--从6.1.5开始，不需要再单独依赖 jannotation 这个 jar 包-->
  <dependency>
    <groupId>com.jd.ump</groupId>
    <artifactId>jannotation</artifactId>
    <version>4.1.0</version>
    <exclusions>
      <exclusion>
        <artifactId>log4j</artifactId>
        <groupId>log4j</groupId>
      </exclusion>
    </exclusions>
  </dependency>
  
  <!--ump aop方式接入-->
  <dependency>
    <groupId>com.jd.ump</groupId>
    <artifactId>profiler_aop_metrics</artifactId>
    <version>1.0.0</version>
  </dependency>
  ```

- 切面

  ```java
  @Aspect
  @Component
  public class UmpAspect {
      
      private static final Logger logger = LoggerFactory.getLogger(UmpAspect.class);
      
      @Around("execution(* com.jd.performance..*.*(..))")//aop切入包路径，配置需要监控的接口
      public Object ump(ProceedingJoinPoint joinPoint) throws Throwable {
          String key = joinPoint.getSignature().getDeclaringType().getName()
                          + "."
                          + joinPoint.getSignature().getName();
          logger.debug("Aspect开始:" + key);
          String appName = "jd-performance-server"; //j-one应用英文名
          CallerInfo callerInfo = Profiler.registerInfo(key, appName, false, true);
          Object obj = null;
          try {
              obj = joinPoint.proceed();
              Profiler.registerInfoEnd(callerInfo);//调用性能及次数接入
          } catch (Exception e) {
              Profiler.functionError(callerInfo);//调用率接入，注意需要能catch到接口的异常，调用率才能生效
              throw e;
          }
          logger.debug("Aspect结束:" + key);
          return obj;
      }
  }
  ```

- 配置

  - 方式1：配置类

    ```java
    @Configuration
    @EnableAspectJAutoProxy
    public class UmpConfigration {
    
        @Bean
        public JAnnotation jAnnotation() {
            JAnnotation jAnnotation = new JAnnotation();
            String appName = "jd-performance-server";//j-one应用英文名
            jAnnotation.setAppName(appName);
            jAnnotation.setSystemKey(appName + "-sysKey");
            jAnnotation.setJvmKey(appName + "-jvmKey");
            return jAnnotation;
        }
    }
    ```

  - 方式2：配置文件

    ```xml
    <!--开启aop动态代理-->
    <aop:aspectj-autoproxy proxy-target-class="true"/>
    
    <bean class="com.jd.ump.annotation.JAnnotation">
    	<!-- 初始化系统的心跳 key-->
    	<property name="systemKey" value="心跳key"></property>
    	<!-- 初始化系统的jvm监控 key-->
    	<property name="jvmKey" value="jvm监控点key"></property>
    </bean>
    ```

#### 方式2：注解

- 需要监控的方法

  ```java
  // 为此方法加入方法性能监控，方法心跳，并且监控中需要捕获异常来监控方法是否执行成功
  @JProfiler(jKey = "ump.all.Parameter",jAppName = "xxx"，mState = {JProEnum.TP,JProEnum.Heartbeat,JProEnum.FunctionError})
  public void exec() throws Exception {
          System.out.println("exec...");
          System.out.println("ump.all.Parameter");
          throw new Exception("ump.all.Parameter");
  }
  ```

- 配置同方式一

#### 方式3：侵入式

- 需要监控的方法

  ```java
  // 根据应用程序出现异常被捕获时，计算方法可用率
  CallerInfo info = null;
   try{
      info = Profiler.registerInfo(String key, boolean enableHeart, boolean enableTP);
       xxx;
       xxx;
   }catch(Exception e){
     xxx;
     xxx;
     Profiler.functionError(info);
   }finally{
     Profiler.registerInfoEnd(info);
  }
  ```

- 自定义监控

  ```java
  try{
     xxx;
     xxx;
  }catch(Exception e){
     LOGGER.error(e);
     // 发生异常被捕获时发送报警通知，detail可以设置为指定的错误信息描述 
     Profiler.businessAlarm(key,(new Date()).getTime(),detail);
  }
  
  
  if (retrn==false){
     // 根据业务逻辑判断，需要报警时发出报警通知 
     Profiler.businessAlarm(key,(new Date()).getTime(),detail);
  }
  ```

  > businessAlarm参数
  >
  > ```java
  > /**
  >  * 调用此方法将传递报警信息到监控系统直接报警
  >  * 当某种业务产生的事件需要直接报警，可以调用此方法。
  >  * 
  >  * @param key :在http://ump.jd.com上注册的自定义监控点的key,为空或仅含有空格则不会报警
  >  * @param time：该条信息产生的时间
  >  * @param detail:报警信息详细描述,允许的最大长度为512字符,为空或仅含有空格则不会报警
  >  * @param rtxList:配置的ERP帐号列表,使用","分割帐号.eg:xxxx,xxxx,xxxx
  >  * @param mailList:配置的邮箱帐号列表,使用","分割帐号.eg:xx@jd.com,xx@jd.com,xx@jd.com
  >  * @param smsList:配置的手机号列表,使用","分割帐号.eg:187xxxx,135xxxxx,159xxxxx,
  >  */
  > public static void businessAlarm(String key, long time, String detail,String rtxList, String mailList, String smsList)
  >     
  > public static void businessAlarm(String key, long time, String detail)
  > ```

- JVM监控

  ```java
  Profiler.registerJVMInfo(String key)
  ```

#### 方式4：拦截器

> 类似AOP，唯一不同
>
> - 拦截器通过MethodInvocation对象拿到类名，方法名
>
> - AOP是通过ProceedingJoinPoint对象拿到类名，方法名

- 拦截器

  ```java
  public class MyUMPMethodInterceptor implements MethodInterceptor {
  
      @Override
      public Object invoke(MethodInvocation methodInvocation) throws Throwable {
          String key = methodInvocation.getMethod().getDeclaringClass().getName()
                  + "."
                  + methodInvocation.getMethod().getName();
          String appName = "jd-performance-server"; //j-one应用英文名
          CallerInfo callerInfo = Profiler.registerInfo(key, appName, false, true);
          Object obj = null;
          try {
              obj = methodInvocation.proceed();
              Profiler.registerInfoEnd(callerInfo);//调用性能及次数接入
          } catch (Exception e) {
              Profiler.functionError(callerInfo);//调用率接入，注意需要能catch到接口的异常，调用率才能生效
              throw e;
          }
          return obj;
      }
  }
  ```

- 配置

  ```xml
  <!-- 拦截器加入到容器 -->
  <bean id="umpMethodInterceptor" class="com.jd.test.interceptor.UmpMethodInterceptor"/>
  <!-- 开启aop动态代理 -->
  <aop:config proxy-target-class="true">
      <!-- 切点 -->
      <aop:pointcut id="umpMethodPointcut"
                    expression="execution(* com.jd.official.ehr.is..*.impl.*BaseService*.*(..)) "/>
      <!-- 通知 -->
      <aop:advisor advice-ref="umpMethodInterceptor" pointcut-ref="umpMethodPointcut"/>
  </aop:config>
  ```

