# Tomcat

## 简介

*   什么是JavaEE规范?

    JavaEE: Java Enterprise Edition,Java企业版。指Java企业级开发的技术规范总和。包含13项技术规范\:JDBC、JNDI、EJB、RMI、JSP、Servlet、XML、JMS、Java IDL、JTS、JTA、JavaMail、JAF。

*   因为Tomcat支持Servlet/JSP规范，所以Tomcat也被称为Web容器、Servlet容器。Servlet需要依赖Tomcat才能运行。

*   Tomcat的官网: <https://tomcat.apache.org/>

**小结**

1.  Web服务器的作用

> 封装HTTP协议操作，简化开发
>
> 可以将Web项目部署到服务器中，对外提供网上浏览服务

1.  Tomcat是一个轻量级的Web服务器，支持Servlet/JSP少量JavaEE规范，也称为Web容器，Servlet容器。

## 基本使用

### 目录结构

![1627178815892](http://minio.botuer.com\003JavaWeb\黑马\day08-HTTP\&Tomcat\&Servlet\ppt\assets\1627178815892.png)

bin:目录下有两类文件，一种是以`.bat`结尾的，是Windows系统的可执行文件，一种是以`.sh`结尾的，是Linux系统的可执行文件。

webapps:就是以后项目部署的目录

### 卸载

卸载比较简单，可以直接删除目录即可

### 启动

双击: bin\startup.bat

启动后，通过浏览器访问 `http://localhost:8080`能看到Apache Tomcat的内容就说明Tomcat已经启动成功。

==注意==: 启动的过程中，控制台有中文乱码，需要修改conf/logging.prooperties

![1627199827589](http://minio.botuer.com\003JavaWeb\黑马\day08-HTTP\&Tomcat\&Servlet\ppt\assets\1627199827589.png)

### 关闭

关闭有三种方式

*   直接x掉运行窗口:强制关闭\[不建议]
*   bin\shutdown.bat：正常关闭
*   ctrl+c： 正常关闭

### 配置

**修改端口**

*   Tomcat默认的端口是8080，要想修改Tomcat启动的端口号，需要修改 conf/server.xml

![1627200509883](http://minio.botuer.com\003JavaWeb\黑马\day08-HTTP\&Tomcat\&Servlet\ppt\assets\1627200509883.png)

> 注: HTTP协议默认端口号为80，如果将Tomcat端口号改为80，则将来访问Tomcat时，将不用输入端口号。

**启动时可能出现的错误**

*   Tomcat的端口号取值范围是0-65535之间任意未被占用的端口，如果设置的端口号被占用，启动的时候就会包如下的错误

    ![1627200780590](http://minio.botuer.com\003JavaWeb\黑马\day08-HTTP\&Tomcat\&Servlet\ppt\assets\1627200780590.png)

*   Tomcat启动的时候，启动窗口一闪而过: 需要检查JAVA\_HOME环境变量是否正确配置

### 部署

*   Tomcat部署项目： 将项目放置到webapps目录下，即部署完成。

**在拷贝的过程中也会越来越费时间，该如何解决呢?**

*   一般JavaWeb项目会被打包称==war==包，然后将war包放到Webapps目录下，Tomcat会自动解压缩war文件

## IDEA部署

*   创建普通的java项目

*   右击项目，Add Framework Support...

*   勾选Web Application

*   配置tomcat

*   将html、css等文件（夹）放在web目录下

*   启动tomcat

    ![image-20220519172237986](http://minio.botuer.com\AppData\Roaming\Typora\typora-user-images\image-20220519172237986.png)

