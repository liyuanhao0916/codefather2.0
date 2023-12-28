# Docker

## 概述

- 问题一：服务部署时需要依赖函数库Libraries和依赖项Dependencies，一台机器部署多个服务存在依赖的冲突，需要一个容器把各个服务一一隔离
- 问题二：部署的服务在不同的操作系统迁移，系统应用不同，函数库有差异，需要把调用的系统应用函数库一起打包
  - 系统内核：所有Linux发行版的内核都是Linux，例如CentOS、Ubuntu、Fedora等。内核可以与计算机硬件交互，对外提供**内核指令**，用于操作计算机硬件。
  - 系统应用：操作系统本身提供的应用、函数库。这些函数库是对内核指令的封装，使用更加方便。
- 解决
  - Docker允许开发中将应用、依赖、函数库、配置一起**打包**，形成可移植镜像
  - Docker应用运行在容器中，使用沙箱机制，相互**隔离**
  - Docker镜像中包含完整运行环境，包括系统函数库，仅依赖系统的Linux内核，因此可以在任意Linux操作系统上运行
- Docker和虚拟机的区别
  - docker是一个系统进程；虚拟机是在操作系统中的操作系统
  - docker体积小、启动速度快、性能好；虚拟机体积大、启动速度慢、性能一般

## 架构

- **镜像（Image）**：Docker将应用程序及其所需的依赖、函数库、环境、配置等文件打包在一起，称为镜像。这个文件包是只读的。

- **容器（Container）**：镜像中的应用程序运行后，加载到内存，形成的进程就是**容器**，只是Docker会给容器进程做隔离，对外不可见。

  > 一切应用最终都是代码组成，都是硬盘中的一个个的字节形成的**文件**。只有运行时，才会加载到内存，形成进程。

- **Docker Registry**：镜像共享平台

  - [DockerHub](https://hub.docker.com/)
  - [网易云镜像服务](https://c.163yun.com/hub)、[阿里云镜像库](https://cr.console.aliyun.com/)

- 服务端：Docker守护进程，负责处理Docker指令，管理镜像、容器等

- 客户端：通过命令或RestAPI向Docker服务端发送指令。可以在本地或远程向服务端发送指令。

## 镜像操作

- 镜像名称：[repository]:[tag]  如mysql：8.0

  - 没有tag默认最新版本

- 命令

  ```bash
  docker images								#
  docker rmi nginx:latest			#
  
  #提交本地docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
  docker commit -a "leifengyang"  -m "首页变化" 341d81f7504f guignginx:v1.0
  
  =========离线安装========
  #打包docker save -o [保存的目标文件名称] [镜像名称]
  docker save -o nginx.tar nginx:latest
  docker load -i nginx.tar		#加载
  
  =========在线安装========
  ## 把旧镜像的名字，改成仓库要求的新版名字docker tag local-image:tagname new-repo:tagname 
  docker tag guignginx:v1.0 leifengyang/guignginx:v1.0
  docker login 	#登录
  docker push new-repo:tagname  #推送
  docker logout	#退出
  docker pull   #拉取
  ```

- 报错Cannot connect to the Docker daemon at unix，重启服务

  ```sh
  systemctl start docker 
  ```

## 容器操作

- 创建并运行 

  docker run []  镜像名

  - --name 容器名随便起
  - --restart=always 开机自启
  - -p  端口映射 宿主机：容器
  - -v   挂载        宿主机：容器
  - -e  环境变量
  - -d  后台运行

  ```sh
  docker ps							## 查看正在运行的容器
  docker ps -a  				## 查看所有
  docker rm  容器id/名字	## 删除停止的容器
  docker rm -f mynginx   #强制删除正在运行中的
  docker pause 容器名     ##   暂停
  docker unpause 容器名   ##   恢复
  docker stop 容器名      ##    停止
  docker start 容器名     ##      开始
  docker run --name containerName -p  --restart=always 80:80 -d nginx
  #更改（无挂载才能更改）
  docker update 容器id/名字 --restart=always
  docker logs 容器名/id   #排错
  #把容器指定位置的东西复制出来 
  docker cp 5eff66eec7e1:/etc/nginx/nginx.conf  /data/conf/nginx.conf
  #把外面的内容复制到容器里面
  docker cp  /data/conf/nginx.conf  5eff66eec7e1:/etc/nginx/nginx.conf
  ```

- 进入容器，修改文件

  - -it : 给当前进入的容器创建一个标准输入、输出终端，允许我们与容器交互
  - bash：进入容器后执行的命令，bash是一个linux终端交互命令

  ```sh
  docker exec -it 随便起的容器名 bash
  ```

  修改主页：路径/usr/share/nginx/html

  容器内没有vim命令

  ```sh
  cd /usr/share/nginx/html
  
  sed -i -e 's#Welcome to nginx#传智教育欢迎您#g' -e 's#<head>#<head><meta charset="utf-8">#g' index.html
  ```

- 数据卷（容器数据管理）

  > **数据卷（volume）**是一个虚拟目录，指向宿主机文件系统中的某个目录

  - docker volume create ###  创建数据卷

  - docker volume ls  查看

  - docker volume inspect ###  查看##的详细信息

  - docker volume rm ###     删除

  - docker volume prune    删除所有未使用的数据卷

  - 挂载

    > 目录挂载与数据卷挂载的语法是类似的：
    >
    > - -v [宿主机目录]:[容器内目录]
    > - -v [宿主机文件]:[容器内文件]
  
    -v html:/usr/share/nginx/html  

    ```sh
    docker run --name my_nginx -v html:/usr/share/nginx/html -p 80:80 -d nginx
    ```
  
  - 查看修改

    ```sh
    docker volume inspect html
    ===============================
    [
        {
            "CreatedAt": "2022-06-28T12:43:10+08:00",
            "Driver": "local",
            "Labels": {},
            "Mountpoint": "/var/lib/docker/volumes/html/_data",
            "Name": "html",
            "Options": {},
            "Scope": "local"
        }
    ]
    ============================
    cd /var/lib/docker/volumes/html/_data
    vim index.html
    ```

## Dockerfile自定义镜像

### 概述

> 1. Dockerfile的本质是一个文件，通过指令描述镜像的构建过程
>
> 2. Dockerfile的第一行必须是FROM，从一个基础镜像来构建
>
> 3. 基础镜像可以是基本操作系统，如Ubuntu。也可以是其他人制作好的镜像，例如：java:8-alpine

- 镜像结构

  > 简单来说，镜像就是在系统函数库、运行环境基础上，添加应用程序文件、配置文件、依赖文件等组合，然后编写好启动脚本打包在一起形成的文件

  - 基础镜像BaseImage：系统库，依赖环境
  - 入口Entrypoint：镜像运行的入口，一般是程序启动的脚本和参数
  - 层Layer：位于基础镜像和入口之间，在基础镜像基础上添加安装包、依赖、配置等，每次操作都形成新的层

- Dockerfile语法

  更新详细语法说明，请参考官网文档： https://docs.docker.com/engine/reference/builder

  > 我们要构建镜像，其实就是实现上述打包的过程
  >
  > 我们只需要告诉Docker，我们的镜像的组成，需要哪些BaseImage、需要拷贝什么文件、需要安装什么依赖、启动脚本是什么，将来Docker会帮助我们构建镜像

  **Dockerfile就是一个文本文件**，其中包含一个个的**指令(Instruction)**，用指令来说明要执行什么操作来构建镜像。每一个指令都会形成一层Layer

  - from 指定基础镜像  如from centos7
  - env   设置环境    env key value
  - cope 拷贝本地文件到镜像的指定目录
  - run  执行Linux的shell命令，一般是安装过程的命令
  - expose 指定容器运行时监听的端口，是给镜像使用者看的
  - entrypoint 镜像中应用的启动命令，容器运行时调用

### 基于Ubuntu构建Java项目

> 需要：
>
> - ubuntu没有jdk，需要jdk
>
> - java项目的jar包
>
> - Dockerfile
>
>   > Dockerfile文件内容：
>   >
>   > ```dockerfile
>   > ## 指定基础镜像
>   > FROM ubuntu:16.04
>   > ## 配置环境变量，JDK的安装目录
>   > ENV JAVA_DIR=/usr/local
>   > 
>   > ## 拷贝jdk和java项目的包
>   > COPY ./jdk8.tar.gz $JAVA_DIR/
>   > COPY ./docker-demo.jar /tmp/app.jar
>   > 
>   > ## 安装JDK
>   > RUN cd $JAVA_DIR \
>   > && tar -xf ./jdk8.tar.gz \
>   > && mv ./jdk1.8.0_144 ./java8
>   > 
>   > ## 配置环境变量
>   > ENV JAVA_HOME=$JAVA_DIR/java8
>   > ENV PATH=$PATH:$JAVA_HOME/bin
>   > 
>   > ## 暴露端口
>   > EXPOSE 8090
>   > ## 入口，java项目的启动命令
>   > ENTRYPOINT java -jar /tmp/app.jar
>   > ```

- 拷贝上述三个文件到某文件夹，这里用docker-demo

- 构建镜像

  - -t 是tag的意思，构建的版本名称
  - **. 表示当前目录**

  ```sh
  docker build -t javaweb:1.0 .
  ```

运行后，此时镜像中就有了我们自定义的镜像：Javaweb：1.0

- 创建容器

  ```sh
  docker run --name java_demo -p 8090:8090 -d javaweb:1.0
  ```

- 访问  [192.168.10.101:8090/hello/count](http://192.168.10.101:8090/hello/count)

### 基于java8构建Java项目

> 虽然我们可以基于Ubuntu基础镜像，添加任意自己需要的安装包，构建镜像，但是却比较麻烦。所以大多数情况下，我们都可以在一些安装了部分软件的基础镜像上做改造

用别人的镜像：**只需  指定基础镜像、暴露端口、指定入口**

- 在某目录下创建Dockerfile文件

  ```dockerfile
  FROM java:8-alpine
  COPY ./docker-demo.jar /tmp/app.jar
  EXPOSE 8090
  ENTRYPOINT java -jar /tmp/app.jar
  ```

- 构建镜像

  ```sh
  docker build -t javaweb:2.0
  ```

- 创建容器

- 访问

## DockerCompose

基于Compose文件帮我们快速的部署分布式应用，而无需手动一个个创建和运行容器

**Compose文件相当于多个docker run命令的集合**

```yaml
version: "3.8"  #compose的版本

services:   				#微服务配置
 mysql:    					#相当于docker run的--name
   image: mysql:5.7.25
   environment: 			#相当于docker run的-e
    MYSQL_ROOT_PASSWORD: 123 
   volumes:					#相当于docker run的-v
    - "/tmp/mysql/data:/var/lib/mysql"
    - "/tmp/mysql/conf/hmy.cnf:/etc/mysql/conf.d/hmy.cnf"
 web:
   build: .					##相当于docker build，随后创建临时容器
   ports:
    - "8090:8090"			#相当于docker run的-p
```

**说明：mysql只是内部调用，不需要暴露端口，web服务在build后创建临时容器，不需要--name**

### 安装

```sh
## 安装
curl -L https://github.com/docker/compose/releases/download/1.23.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```

```sh
## 修改权限
chmod +x /usr/local/bin/docker-compose
```

```sh
## 补全命令
curl -L https://raw.githubusercontent.com/docker/compose/1.29.1/contrib/completion/bash/docker-compose > /etc/bash_completion.d/docker-compose
```

如果这里出现错误，需要修改自己的hosts文件：

```sh
echo "185.199.109.133 raw.githubusercontent.com" >> /etc/hosts
```

### 部署微服务集群

- 创建要部署的cloud-demo目录结构

  - gateway

  - mysql

  - order-service

  - user-service

  - docker-compose.yml

    ```yaml
    version: "3.2"
    
    services:
      nacos:
        image: nacos/nacos-server
        environment:
          MODE: standalone
        ports:
          - "8848:8848"
      mysql:
        image: mysql:5.7.25
        environment:
          MYSQL_ROOT_PASSWORD: 123
        volumes:
          - "$PWD/mysql/data:/var/lib/mysql"
          - "$PWD/mysql/conf:/etc/mysql/conf.d/"
      userservice:
        build: ./user-service
      orderservice:
        build: ./order-service
      gateway:
        build: ./gateway
        ports:
          - "10010:10010"
    ```

- 每个微服务目录下都含有相应的jar包和Dockerfile

  ```dockerfile
  FROM java:8-alpine
  COPY ./app.jar /tmp/app.jar
  ENTRYPOINT java -jar /tmp/app.jar
  ```

- 修改微服务配置

  > 因为微服务将来要部署为docker容器，之前的代码都是localhost，肯定不行。而容器之间互联不是通过IP地址，而是通过容器名。这里我们将order-service、user-service、gateway服务的mysql、nacos地址都修改为基于容器名的访问。

  **把所有localhost改为服务名称**

  ```yaml
  spring:
    datasource:
      #改前：url: jdbc:mysql://localhost:3306/cloud_order?useSSL=false
      url: jdbc:mysql://mysql:3306/cloud_order?useSSL=false
      username: root
      password: 123
      driver-class-name: com.mysql.jdbc.Driver
    application:
      name: orderservice
    cloud:
      nacos:
      #改前： server-addr: localhost:8848
        server-addr: nacos:8848 ## nacos服务地址
  ```

- 修改pom文件，**都打包名为app.jar**

  ```xml
  <build>
    <!-- 服务打包的最终名称 -->
    <finalName>app</finalName>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
  ```

- 把jar包拷贝到对应文件夹

- 部署：放到服务器中，进入到cloud-demo目录，执行命令

  ```sh
  docker-compose up -d
  ```

- docker ps  查看容器

- docker-compose logs -f  查看日志

  报错：connection refused 拒绝连接  ，由于nacos启动太慢，userservice或orderservice注册时被拒绝

  解决：docker-compose restart gateway userservice orderservice   重启微服务

- docker-compose stop 停止

- docker-compose restart 重启

- docker-compose down 停止并删除

- 访问：[192.168.10.101:10010/user/2?authorization=admin](http://192.168.10.101:10010/user/2?authorization=admin)

  ​			[192.168.10.101:10010/order/102?authorization=admin](http://192.168.10.101:10010/order/102?authorization=admin)

## Docker镜像仓库 

搭建镜像仓库可以基于Docker官方提供的DockerRegistry来实现。

官网地址：https://hub.docker.com/_/registry

### 简化版：没有图形化界面

```sh
docker run -d \
    --restart=always \
    --name registry	\
    -p 5000:5000 \
    -v registry-data:/var/lib/registry \
    registry
```

命令中挂载了一个数据卷registry-data到容器内的/var/lib/registry 目录，这是私有镜像库存放数据的目录。

访问：[192.168.10.101:5000/v2/_catalog](http://192.168.10.101:5000/v2/_catalog)

### 图形化界面

是在DockerRegistry基础上增加了GUI，引用了registry镜像

- 配置Docker信任地址

  > 我们的私服采用的是http协议，默认不被Docker信任，所以需要做一个配置

  **在json文件中添加内容时，一定要以逗号分隔**

  ```sh
  ## 打开要修改的文件
  vi /etc/docker/daemon.json
  ## 添加内容：
  "insecure-registries":["http://192.168.10.101:8080"]
  ## 重加载
  systemctl daemon-reload
  ## 重启docker
  systemctl restart docker
  ```

- 新建一个对应文件夹，如registry-ui，创建docker-compose.yml

  ```yml
  version: '3.0'
  services:
    registry:
      image: registry
      volumes:
        - ./registry-data:/var/lib/registry
    ui:
      image: joxit/docker-registry-ui:static
      ports:
        - 8080:80
      environment:
        - REGISTRY_TITLE=传智教育私有仓库
        - REGISTRY_URL=http://registry:5000
      depends_on:
        - registry
  ```

- 访问：[Docker Registry UI](http://192.168.10.101:8080/)

### 推送拉取镜像

- 推送镜像到私有镜像服务必须先tag，相当于重命名为Registry能识别的格式，本质上是同一个（内存地址相同）

- 重新tag本地镜像，名称前缀为私有仓库的地址：192.168.10.101:8080/

  ```
  docker tag nginx:latest 192.168.150.101:8080/nginx:1.0 
  ```

- 推送镜像

  ```
  docker push 192.168.150.101:8080/nginx:1.0 
  ```

- 拉取镜像

  ```
  docker pull 192.168.150.101:8080/nginx:1.0 
  ```
