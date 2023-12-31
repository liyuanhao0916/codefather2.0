---
isOriginal: true
category: 
    - 运维
    - 软件
    - 玩机
tag: 
  - Linux
  - Java
  - jdk
---

# Linux 软件安装

## 环境

### JDK1.8

#### 卸载jdk

```sh
rpm -qa |grep java
rpm -qa |grep jdk
rpm -qa |grep gcj

rpm -qa | grep java | xargs rpm -e --nodeps
```

#### 安装jdk

```sh
## 解压到 /usr/java
mkdir /usr/java
tar -zxvf jdk-8u331-linux-x64.tar.gz -C /usr/java
```

#### 配置环境变量

```sh
## 编辑profile，
vim /etc/profile


## 在上面增加下面内容
JAVA_HOME=/usr/java/jdk1.8.0_331
JRE_HOME=$JAVA_HOME/jre
PATH=$PATH:$JAVA_HOME/bin:$JRE_HOME/bin
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$JRE_HOME/lib
export JAVA_HOME JRE_HOME PATH CLASSPATH

source /etc/profile

java -version
```

***

### maven
#### centos
```sh
wget https://repo.huaweicloud.com/apache/maven/maven-3/3.8.1/binaries/apache-maven-3.8.1-bin.tar.gz
tar -zxvf apache-maven-3.8.1-bin.tar.gz
tar -zxvf apache-maven-3.8.1-bin.tar.gz
vim /etc/profile

source /etc/profile
mvn -v
``` 

```ini
export MAVEN_HOME=/usr/local/apache-maven-3.8.1/
export PATH=${PATH}:${MAVEN_HOME}/bin
```
#### ubuntu
```sh
sudo apt update
sudo apt install maven
mvn -v
```

***

### Docker

#### 卸载

```sh
yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine \
                  docker-ce
```

#### 安装

*   安装yum工具

```sh
yum install -y yum-utils \
           device-mapper-persistent-data \
           lvm2 --skip-broken
```

*   更新本地镜像源

```sh
## 设置docker镜像源
yum-config-manager \
    --add-repo \
    https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    
sed -i 's/download.docker.com/mirrors.aliyun.com\/docker-ce/g' /etc/yum.repos.d/docker-ce.repo

yum makecache fast
```

*   安装社区版

```sh
yum install -y docker-ce
```

*   关闭并禁用防火墙

    ```sh
    systemctl stop firewalld
    systemctl disable firewalld
    ```

#### 启动

```sh
systemctl start docker  ## 启动docker服务

systemctl stop docker  ## 停止docker服务

systemctl restart docker  ## 重启docker服务


docker -v
```

#### 配置镜像加速

docker官方镜像仓库网速较差，我们需要设置国内镜像服务：

参考阿里云的镜像加速文档：<https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors>

#### 安装DockerCompose

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

如果这里出现错误，需要修改自己的hosts：

```sh
echo "185.199.109.133 raw.githubusercontent.com" >> /etc/hosts
```
### Node
。。。
```sh
## 查看源
npm config get registry
## 设置淘宝源
npm config set registry https://registry.npm.taobao.org
## 设置官方源
npm config set registry http://registry.npmjs.org
```
### Yarn
#### Ubuntu
```sh
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

sudo apt update
sudo apt install yarn       ## 默认带Node
## 排除Node
sudo apt install --no-install-recommends yarn
yarn --version

## 查看源
yarn config get registry
## 设置淘宝源
yarn config set registry https://registry.npm.taobao.org/
## 设置官方源
yarn config set registry https://registry.yarnpkg.com
```
使用第三方软件快速修改、切换 yarn 镜像源

yrm （YARN registry manager）： 不仅可以快速切换镜像源，还可以测试自己网络访问不同源的速度

```sh
## 安装 yrm
npm install -g yrm
## 列出当前可用的所有镜像源
yrm ls
  #  npm -----  https://registry.npmjs.org/
  #  cnpm ----  http://r.cnpmjs.org/
  #  taobao --  https://registry.npm.taobao.org/
  #  nj ------  https://registry.nodejitsu.com/
  #  rednpm -- http://registry.mirror.cqupt.edu.cn
  #  skimdb -- https://skimdb.npmjs.com/registry
  #  yarn ----  https://registry.yarnpkg.com
## 使用淘宝镜像源
yrm use taobao
## 测试访问速度
yrm test taobao
```

***

## MQ

### RabbitMQ

docker安装

*   在线拉取

    ```sh
    docker pull rabbitmq
    ```

*   安装容器

    *   \-e RABBITMQ\_DEFAULT\_USER=admin \      #管理平台账号密码

        \-e RABBITMQ\_DEFAULT\_PASS=admin \\

    *   \--hostname mq1 \						#主机名，集群必须配

    *   \-p 15672:15672 \						#后台端口

        \-p 5672:5672 \							#内部消息通信端口

    ```sh
    docker run \
     -e RABBITMQ_DEFAULT_USER=admin \
     -e RABBITMQ_DEFAULT_PASS=admin \
     --name mq \
     --hostname mq1 \
     -p 15672:15672 \
     -p 5672:5672 \
     -d \
     rabbitmq
    ```

*   进入容器、开启管理（不开启无法访问管理页面，management版本的默认开启）

    ```sh
    docker exec -it mq bash

    rabbitmq-plugins enable rabbitmq_management
    ```

*   访问管理页面：[RabbitMQ Management](http://192.168.10.101:15672/)

*   管理页面--Channels报错Stats in management UI are disabled on this node

    解决

    ```sh
    #进入rabbitmq容器
    docker exec -it mq bash

    #进入容器后，cd到以下路径
    cd /etc/rabbitmq/conf.d/

    #修改 management_agent.disable_metrics_collector = false
    echo management_agent.disable_metrics_collector = false > management_agent.disable_metrics_collector.conf

    #退出容器
    exit

    #重启rabbitmq容器
    docker restart mq
    ```

***

### RocketMQ&#x20;

#### 集群部署

##### 下载上传解压

```sh
mkdir /usr/local/rocketmq
unzip rocketmq-all-4.9.4-bin-release.zip -d /usr/local/rocketmq
```

##### 配置环境变量

```sh
vim /etc/profile
```

```sh
ROCKETMQ_HOME=/usr/local/rocketmq/rocketmq-all-4.9.4-bin-release
PATH=$PATH:$ROCKETMQ_HOME/bin
export ROCKETMQ_HOME PATH
```

```sh
source /etc/profile
```

##### 创建消息存储路径

```sh
mkdir /usr/local/rocketmq/commitlog
mkdir /usr/local/rocketmq/consumequeue
mkdir /usr/local/rocketmq/index
```

##### 修改启动脚本参数

```sh
vim /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/bin/runbroker.sh
```

```sh
JAVA_OPT="${JAVA_OPT} -server -Xms256m -Xmx256m -Xmn128m"
```

```sh
vim /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/bin/runserver.sh
```

```sh
JAVA_OPT="${JAVA_OPT} -server -Xms256m -Xmx256m -Xmn128m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"
```

**====================上述步骤可直接克隆=====================**

#### 配置说明

```properties
================================================
===================配置模板======================
================================================
#所属集群名字:整个集群的名字，含nameserver，broker
brokerClusterName=rocketmq-cluster
#broker名字，给master和slave配对
brokerName=broker-a
#0 表示 Master，>0 表示 Slave
brokerId=0
#Broker 的角色
#- ASYNC_MASTER 异步复制Master
#- SYNC_MASTER 同步双写Master
#- SLAVE
brokerRole=SYNC_MASTER
#刷盘方式
#- ASYNC_FLUSH 异步刷盘
#- SYNC_FLUSH 同步刷盘
flushDiskType=SYNC_FLUSH
================================================
===================必须配置======================
================================================
#nameServer地址，分号分割
namesrvAddr=192.168.10.101:9876;192.168.10.102:9876
#Broker 对外服务的监听端口，默认10900，master和slave必须至少配一个，习惯配slave（11011、11911）
listenPort=10911
#存储路径：默认在当前用户主目录中，master和slave必须至少配一个，习惯配slave（加-s）
storePathRootDir=/usr/local/rocketmq/store
#commitLog 存储路径
storePathCommitLog=/usr/local/rocketmq/store/commitlog
#消费队列存储路径存储路径
storePathConsumeQueue=/usr/local/rocketmq/store/consumequeue
#消息索引存储路径
storePathIndex=/usr/local/rocketmq/store/index
#checkpoint 存储路径
storeCheckpoint=/usr/local/rocketmq/store/checkpoint
#abort 存储路径
abortFile=/usr/local/rocketmq/store/abort
================================================
===================可选配置======================
================================================
#在发送消息时，自动创建服务器不存在的topic，默认创建的队列数
defaultTopicQueueNums=4
#是否允许 Broker 自动创建Topic，建议线下开启，线上关闭
autoCreateTopicEnable=true
#是否允许 Broker 自动创建订阅组，建议线下开启，线上关闭
autoCreateSubscriptionGroup=true
#删除时间点，默认凌晨 4点
deleteWhen=04
#保留时间，默认 48 小时
fileReservedTime=120
#commitLog每个的大小默认1G
mapedFileSizeCommitLog=1073741824
#ConsumeQueue每个默认存30W条，根据业务情况调整
mapedFileSizeConsumeQueue=300000
#destroyMapedFileIntervalForcibly=120000
#redeleteHangedFileInterval=120000
#检测物理磁盘空间
diskMaxUsedSpaceRatio=88
#限制的消息大小
maxMessageSize=65536
#flushCommitLogLeastPages=4
#flushConsumeQueueLeastPages=2
#flushCommitLogThoroughInterval=10000
#flushConsumeQueueThoroughInterval=60000
#checkTransactionMessageEnable=false
#发消息线程池数量
#sendMessageThreadPoolNums=128
#拉消息线程池数量
#pullMessageThreadPoolNums=128
```

##### 虚拟机1\:broker-a.properties

```sh
vim /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/conf/2m-2s-sync/broker-a.properties
```

```properties
brokerClusterName=rocketmq-cluster
brokerName=broker-a
brokerId=0
brokerRole=SYNC_MASTER
flushDiskType=SYNC_FLUSH

namesrvAddr=192.168.10.101:9876;192.168.10.102:9876

listenPort=10911
storePathRootDir=/usr/local/rocketmq/store
storePathCommitLog=/usr/local/rocketmq/store/commitlog
storePathConsumeQueue=/usr/local/rocketmq/store/consumequeue
storePathIndex=/usr/local/rocketmq/store/index
storeCheckpoint=/usr/local/rocketmq/store/checkpoint
abortFile=/usr/local/rocketmq/store/abort
```

##### 虚拟机1\:broker-b-s.properties

```sh
vim /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/conf/2m-2s-sync/broker-b-s.properties
```

```properties
brokerClusterName=rocketmq-cluster
brokerName=broker-b
brokerId=1
brokerRole=SLAVE
flushDiskType=ASYNC_FLUSH

namesrvAddr=192.168.10.101:9876;192.168.10.102:9876

listenPort=11011
storePathRootDir=/usr/local/rocketmq/store-s
storePathCommitLog=/usr/local/rocketmq/store-s/commitlog
storePathConsumeQueue=/usr/local/rocketmq/store-s/consumequeue
storePathIndex=/usr/local/rocketmq/store-s/index
storeCheckpoint=/usr/local/rocketmq/store-s/checkpoint
abortFile=/usr/local/rocketmq/store-s/abort
```

##### 虚拟机2\:broker-b.properties

```sh
vim /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/conf/2m-2s-sync/broker-b.properties
```

```properties
brokerClusterName=rocketmq-cluster
brokerName=broker-b
brokerId=0
brokerRole=SYNC_MASTER
flushDiskType=SYNC_FLUSH

namesrvAddr=192.168.10.101:9876;192.168.10.102:9876

listenPort=10911
storePathRootDir=/usr/local/rocketmq/store
storePathCommitLog=/usr/local/rocketmq/store/commitlog
storePathConsumeQueue=/usr/local/rocketmq/store/consumequeue
storePathIndex=/usr/local/rocketmq/store/index
storeCheckpoint=/usr/local/rocketmq/store/checkpoint
abortFile=/usr/local/rocketmq/store/abort
```

##### 虚拟机2\:broker-a-s.properties

```sh
vim /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/conf/2m-2s-sync/broker-a-s.properties
```

```properties
brokerClusterName=rocketmq-cluster
brokerName=broker-a
brokerId=1
brokerRole=SLAVE
flushDiskType=ASYNC_FLUSH

namesrvAddr=192.168.10.101:9876;192.168.10.102:9876

listenPort=11011
storePathRootDir=/usr/local/rocketmq/store-s
storePathCommitLog=/usr/local/rocketmq/store-s/commitlog
storePathConsumeQueue=/usr/local/rocketmq/store-s/consumequeue
storePathIndex=/usr/local/rocketmq/store-s/index
storeCheckpoint=/usr/local/rocketmq/store-s/checkpoint
abortFile=/usr/local/rocketmq/store-s/abort
```

#### 启动

```sh
cd /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/bin

nohup sh mqnamesrv &

nohup sh mqbroker -c /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/conf/2m-2s-sync/broker-a.properties &

nohup sh mqbroker -c /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/conf/2m-2s-sync/broker-b-s.properties &
```

    cd /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/bin

    nohup sh mqnamesrv &

    nohup sh mqbroker -c /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/conf/2m-2s-sync/broker-b.properties &

    nohup sh mqbroker -c /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/conf/2m-2s-sync/broker-a-s.properties &

#### 查看

```sh
jps
```

#### 停止

```sh
sh mqshutdown namesrv
sh mqshutdown broker
```

#### 测试

```sh
=============发送消息===============
## 1.设置环境变量
export NAMESRV_ADDR=localhost:9876
## 2.使用安装包的Demo发送消息
sh /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/bin/tools.sh org.apache.rocketmq.example.quickstart.Producer
```

```sh
=============接受消息===============
## 1.设置环境变量
export NAMESRV_ADDR=localhost:9876
## 2.接收消息
sh /usr/local/rocketmq/rocketmq-all-4.9.4-bin-release/bin/tools.sh org.apache.rocketmq.example.quickstart.Consumer
```

#### 查看日志

```sh
## 查看nameServer日志
tail -500f ~/logs/rocketmqlogs/namesrv.log
## 查看broker日志
tail -500f ~/logs/rocketmqlogs/broker.log
```

#### Docker安装Rocketmq-console

```sh
docker pull styletang/rocketmq-console-ng

docker run -d \
--restart=always \
--name rmqadmin \
-e "JAVA_OPTS=-Drocketmq.namesrv.addr=192.168.10.101:9876;192.168.10.102:9876  \
-Dcom.rocketmq.sendMessageWithVIPChannel=false \
-Duser.timezone='Asia/Shanghai'" \
-v /etc/localtime:/etc/localtime \
-p 9999:8080 \
styletang/rocketmq-console-ng
```

*   访问[RocketMq-console-ng](http://192.168.10.101:9999)

***

## 微服务

### Dubbo & Zookeeper

#### zookeeper伪集群

*   安装JDK

```sh
#创建三个对应目录
mkdir -p /usr/local/zookeeper-cluster/zookeeper-1/data /usr/local/zookeeper-cluster/zookeeper-2/data /usr/local/zookeeper-cluster/zookeeper-3/data
#上传、解压
tar -zxvf /usr/local/apache-zookeeper-3.8.0-bin.tar.gz -C /usr/local
#改配置名字
cd /usr/local/apache-zookeeper-3.8.0-bin/conf
mv zoo_sample.cfg zoo.cfg
#添加集群服务（myid对应的ip端口）
vim zoo.cfg 
```

```properties
server.1=192.168.10.103:2881:3881  #ip是内网地址，不是公网 
server.2=192.168.10.103:2882:3882
server.3=192.168.10.103:2883:3883
```

```sh
#复制三份到对应夹
cp -r /usr/local/apache-zookeeper-3.8.0-bin/* /usr/local/zookeeper-cluster/zookeeper-1
cp -r /usr/local/apache-zookeeper-3.8.0-bin/* /usr/local/zookeeper-cluster/zookeeper-2
cp -r /usr/local/apache-zookeeper-3.8.0-bin/* /usr/local/zookeeper-cluster/zookeeper-3
#配置数据地址、端口号（默认2181） 另外两个略
vim /usr/local/zookeeper-cluster/zookeeper-1/conf/zoo.cfg
```

```properties
clientPort=2181
dataDir=/usr/local/zookeeper-cluster/zookeeper-1/data
```

```sh
#设置myid，分别为123（与server.1/2/3对应） 另外两个略
vim /usr/local/zookeeper-cluster/zookeeper-1/data/myid

1
```

```sh
#启动 另外两个略
/usr/local/zookeeper-cluster/zookeeper-1/bin/zkServer.sh start
```

```sh
#查启动状态 一主（leader）两从（follower）另外两个略
/usr/local/zookeeper-cluster/zookeeper-1/bin/zkServer.sh status
```

#### 安装dubbo-admin

dubbo-admin是一个web工程，需要tomcat启动

```sh
#创建对应目录
mkdir /usr/local/tomcat && cd /usr/local/tomcat
#下载、上传、解压
tar -zxvf apache-tomcat-7.0.52.tar.gz
#上传dubbo-admin.war到webapps夹，启动
sh /usr/local/tomcat/apache-tomcat-7.0.52/bin/startup.sh

#查看端口号是否占用
lsof -i:8080
#占用修改
vim /usr/local/tomcat/apache-tomcat-7.0.52/conf/server.xml
```

### Nacos

*   下载-上传-解压到/usr/local

*   启动

    ```sh
    cd /usr/local
    tar -zxvf nacos-server-2.1.0.tar.gz 

    cd /usr/local/nacos/bin
    sh startup.sh -m standalone
    ```

*   开机自启

    ```sh
    vim /lib/systemd/system/nacos.service
    ```

        [Unit]
        Description=nacos
        After=network.target

        [Service]
        Type=forking
        ExecStart=/usr/local/nacos/bin/startup.sh -m standalone
        ExecReload=/usr/local/nacos/bin/shutdown.sh
        ExecStop=/usr/local/nacos/bin/shutdown.sh
        PrivateTmp=true

        [Install]
        WantedBy=multi-user.target

    ```sh
    ## 编辑nacos/bin目录下的startup.sh, 修改JAVA_HOME的路径, 注释其他三行

    [ ! -e "$JAVA_HOME/bin/java" ] && JAVA_HOME=/usr/java/jdk1.8.0_331
    ## [ ! -e "$JAVA_HOME/bin/java" ] && JAVA_HOME=/usr/java
    ## [ ! -e "$JAVA_HOME/bin/java" ] && JAVA_HOME=/opt/taobao/java
    ## [ ! -e "$JAVA_HOME/bin/java" ] && unset JAVA_HOME

    ## 重新加载所有service服务
    systemctl daemon-reload
    systemctl enable nacos.service
    systemctl start nacos.service
    systemctl status nacos.service
    ```

*   访问<http://192.168.10.103:8848/nacos>

<hr>

### sentinal

**下载**

*   [Releases · alibaba/Sentinel (github.com)](https://github.com/alibaba/Sentinel/releases)

启动

    java -jar sentinel-dashboard-1.8.6_2.jar

**配置**

| **配置项**                          | **默认值**  | **说明** |
| -------------------------------- | -------- | ------ |
| server.port                      | 8080     | 服务端口   |
| sentinel.dashboard.auth.username | sentinel | 默认用户名  |
| sentinel.dashboard.auth.password | sentinel | 默认密码   |

例如，修改端口：

```sh
java -Dserver.port=8090 -jar sentinel-dashboard-1.8.1.jar
```

**访问**

访问<http://localhost:8080页面，就可以看到sentinel的控制台了：>

***

### seata

#### 部署Seata的tc-server

*   下载[下载中心 (seata.io)](http://seata.io/zh-cn/blog/download.html)

*   解压

    ![image-20221030184532713](http://minio.botuer.com/study-node/old/image-20221030184532713.png)

*   配置 --- 修改conf目录下的registry.conf

    ```properties
    registry {
      ## tc服务的注册中心类，这里选择nacos，也可以是eureka、zookeeper等
      type = "nacos"

      nacos {
        ## seata tc 服务注册到 nacos的服务名称，可以自定义
        application = "seata-tc-server"
        serverAddr = "127.0.0.1:8848"
        group = "DEFAULT_GROUP"
        namespace = ""
        cluster = "SH"
        username = "nacos"
        password = "nacos"
      }
    }

    config {
      ## 读取tc服务端的配置的方式，这里是从nacos配置中心读取，这样如果tc是集群，可以共享配置
      type = "nacos"
      ## 配置nacos地址等信息
      nacos {
        serverAddr = "127.0.0.1:8848"
        namespace = ""
        group = "SEATA_GROUP"
        username = "nacos"
        password = "nacos"
        dataId = "seataServer.properties"
      }
    }
    ```

*   在nacos添加配置

    特别注意，为了让tc服务的集群可以共享配置，我们选择了nacos作为统一配置中心。因此服务端配置seataServer.properties需要在nacos中配好。

    格式如下：

    ![image-20221030184713446](http://minio.botuer.com/study-node/old/image-20221030184713446.png)

    ```properties
    ## 数据存储方式，db代表数据库
    store.mode=db
    store.db.datasource=druid
    store.db.dbType=mysql
    store.db.driverClassName=com.mysql.jdbc.Driver
    store.db.url=jdbc:mysql://127.0.0.1:3306/seata?useUnicode=true&rewriteBatchedStatements=true
    store.db.user=root
    store.db.password=123
    store.db.minConn=5
    store.db.maxConn=30
    store.db.globalTable=global_table
    store.db.branchTable=branch_table
    store.db.queryLimit=100
    store.db.lockTable=lock_table
    store.db.maxWait=5000
    ## 事务、日志等配置
    server.recovery.committingRetryPeriod=1000
    server.recovery.asynCommittingRetryPeriod=1000
    server.recovery.rollbackingRetryPeriod=1000
    server.recovery.timeoutRetryPeriod=1000
    server.maxCommitRetryTimeout=-1
    server.maxRollbackRetryTimeout=-1
    server.rollbackRetryTimeoutUnlockEnable=false
    server.undo.logSaveDays=7
    server.undo.logDeletePeriod=86400000

    ## 客户端与服务端传输方式
    transport.serialization=seata
    transport.compressor=none
    ## 关闭metrics功能，提高性能
    metrics.enabled=false
    metrics.registryType=compact
    metrics.exporterList=prometheus
    metrics.exporterPrometheusPort=9898
    ```

*   创建数据库表

    注意：tc服务在管理分布式事务时，需要记录事务相关数据到数据库中，需要**提前建表**

    ```sql

    SET NAMES utf8mb4;
    SET FOREIGN_KEY_CHECKS = 0;

    -- ----------------------------
    -- 分支事务表
    -- ----------------------------
    DROP TABLE IF EXISTS `branch_table`;
    CREATE TABLE `branch_table`  (
      `branch_id` bigint(20) NOT NULL,
      `xid` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
      `transaction_id` bigint(20) NULL DEFAULT NULL,
      `resource_group_id` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
      `resource_id` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
      `branch_type` varchar(8) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
      `status` tinyint(4) NULL DEFAULT NULL,
      `client_id` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
      `application_data` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
      `gmt_create` datetime(6) NULL DEFAULT NULL,
      `gmt_modified` datetime(6) NULL DEFAULT NULL,
      PRIMARY KEY (`branch_id`) USING BTREE,
      INDEX `idx_xid`(`xid`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

    -- ----------------------------
    -- 全局事务表
    -- ----------------------------
    DROP TABLE IF EXISTS `global_table`;
    CREATE TABLE `global_table`  (
      `xid` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
      `transaction_id` bigint(20) NULL DEFAULT NULL,
      `status` tinyint(4) NOT NULL,
      `application_id` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
      `transaction_service_group` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
      `transaction_name` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
      `timeout` int(11) NULL DEFAULT NULL,
      `begin_time` bigint(20) NULL DEFAULT NULL,
      `application_data` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
      `gmt_create` datetime NULL DEFAULT NULL,
      `gmt_modified` datetime NULL DEFAULT NULL,
      PRIMARY KEY (`xid`) USING BTREE,
      INDEX `idx_gmt_modified_status`(`gmt_modified`, `status`) USING BTREE,
      INDEX `idx_transaction_id`(`transaction_id`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

    SET FOREIGN_KEY_CHECKS = 1;
    ```

*   启动TC服务

    进入bin目录，运行其中的seata-server.bat即可

    启动成功后，seata-server应该已经注册到nacos注册中心了

#### TC服务的高可用和异地容灾

*   将seata目录复制一份，起名为seata2 --- **唯一不同就是集群名**

*   进入seata2/bin目录，然后运行命令：**伪集群还要改端口号**

    ```sh
    seata-server.bat -p 8092
    ```

*   将事务组映射配置到nacos

    nacos中新建配置 --- client.properties --- SEATA\_GROUP

    ```properties
    ## 事务组映射关系
    service.vgroupMapping.seata-demo=SH

    service.enableDegrade=false
    service.disableGlobalTransaction=false
    ## 与TC服务的通信配置
    transport.type=TCP
    transport.server=NIO
    transport.heartbeat=true
    transport.enableClientBatchSendRequest=false
    transport.threadFactory.bossThreadPrefix=NettyBoss
    transport.threadFactory.workerThreadPrefix=NettyServerNIOWorker
    transport.threadFactory.serverExecutorThreadPrefix=NettyServerBizHandler
    transport.threadFactory.shareBossWorker=false
    transport.threadFactory.clientSelectorThreadPrefix=NettyClientSelector
    transport.threadFactory.clientSelectorThreadSize=1
    transport.threadFactory.clientWorkerThreadPrefix=NettyClientWorkerThread
    transport.threadFactory.bossThreadSize=1
    transport.threadFactory.workerThreadSize=default
    transport.shutdown.wait=3
    ## RM配置
    client.rm.asyncCommitBufferLimit=10000
    client.rm.lock.retryInterval=10
    client.rm.lock.retryTimes=30
    client.rm.lock.retryPolicyBranchRollbackOnConflict=true
    client.rm.reportRetryCount=5
    client.rm.tableMetaCheckEnable=false
    client.rm.tableMetaCheckerInterval=60000
    client.rm.sqlParserType=druid
    client.rm.reportSuccessEnable=false
    client.rm.sagaBranchRegisterEnable=false
    ## TM配置
    client.tm.commitRetryCount=5
    client.tm.rollbackRetryCount=5
    client.tm.defaultGlobalTransactionTimeout=60000
    client.tm.degradeCheck=false
    client.tm.degradeCheckAllowTimes=10
    client.tm.degradeCheckPeriod=2000

    ## undo日志配置
    client.undo.dataValidation=true
    client.undo.logSerialization=jackson
    client.undo.onlyCareUpdateColumns=true
    client.undo.logTable=undo_log
    client.undo.compress.enable=true
    client.undo.compress.type=zip
    client.undo.compress.threshold=64k
    client.log.exceptionRate=100
    ```

*   微服务读取nacos配置

    接下来，需要修改每一个微服务的application.yml，让微服务读取nacos中的client.properties：

    ```yaml
    seata:
      config:
        type: nacos
        nacos:
          server-addr: 127.0.0.1:8848
          username: nacos
          password: nacos
          group: SEATA_GROUP
          data-id: client.properties
    ```

    重启微服务，现在微服务到底是连接tc的SH集群，还是tc的HZ集群，都统一由nacos的client.properties来决定了

## 服务器

### Nginx

#### Nginx开源版

*   下载--上传--解压--进入nginx夹 -- 安装

    ```sh
    ./configure --prefix=/usr/local/nginx
    #
    make
    make install
    ```

*   安装c解析器gcc

    ```sh
    #若报错，则安装
    checking for OS
    + Linux 3.10.0-693.el7.x86_64 x86_64
    checking for C compiler ... not found
    ./configure: error: C compiler cc is not found

    #安装c解析器gcc
    yum install -y gcc
    ```

*   安装perl

    ```sh
    #若报错，则安装
    ./configure: error: the HTTP rewrite module requires the PCRE library.
    You can either disable the module by using --without-http_rewrite_module 
    option, or install the PCRE library into the system, or build the PCRE library 
    statically from the source with nginx by using --with-pcre=<path> option.

    #安装perl
    yum install -y pcre pcre-devel
    ```

*   安装zlib库

    ```sh
    #若报错，则安装
    ./configure: error: the HTTP gzip module requires the zlib library.
    You can either disable the module by using --without-http_gzip_module
    option, or install the zlib library into the system, or build the zlib library 
    statically from the source with nginx by using --with-zlib=<path> option.

    #安装zlib库
    yum install -y zlib zlib-devel
    ```



*   启动

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

*   安装为系统服务

    ```sh
    vim /usr/lib/systemd/system/nginx.service
    ```

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

    ```sh
    #重新加载系统服务
    systemctl daemon-reload
    systemctl start nginx.service

    ps -ef | grep nginx
    systemctl enable nginx.service
    ```



*   访问：[Welcome to nginx!](http://192.168.10.105/)

- 安装第三方模块 --- 安装br为例
    - `--with-compat`：在构建Nginx时启用与兼容性相关的特性
    - `--add-dynamic-module=/root/ngx_brotli-1.0.0rc`：指定模块路径
    - `--prefix=/usr/local/nginx/`：指定Nginx安装的目标路径
     
    ```sh
    ./configure --with-compat --add-dynamic-module=/root/ngx_brotli-1.0.0rc --prefix=/usr/local/nginx/
    ```
**高可用**
- 生产环境中，一台Nginx会出现单点故障，所以需要多台

- 一旦使用多台，就面临通过什么转发到多台上，再在前面加一个Nginx？显然就陷入了一直往前加的死循环
- Keepalived 是一个常用的开源软件，可以结合 Nginx 来实现高可用性和故障转移。它使用虚拟路由冗余协议（VRRP）来监测服务器的状态，并在主服务器故障时自动切换到备份服务器。

- **安装**

    ```sh
    yum install keepalived
    ```

- **配置**

    ```sh
    vim /etc/keepalived/keepalived.conf
    ```

    ```yml
    ! Configuration File for keepalived

    ### 全局参数（global_defs）：可以设置邮件通知、日志等选项。
    global_defs {
    router_id my_router_id 	#路由id：两台机器不一致
    }

    ### 配置 VRRP 实例
    vrrp_instance VI_1 { 		#vrrp协议的一个自定义实例名称
        state MASTER 			#主机  由优先级决定，自己更改，备用机为 BACKUP
        interface ens33 		#与系统网卡名一致
        virtual_router_id 51
        priority 100 			#优先级
        advert_int 1
        authentication { 		#通过密码身份校验，与第二台一致
            auth_type PASS
            auth_pass my_password
        }
        virtual_ipaddress { 	#身份认证：可配置多个
            192.168.10.200
            #192.168.10.201
        }
    }
    ```

- **启动**

    ```sh
    systemctl start keepalived
    ```

- **查看**

    ```sh
    ip addr
    ## 会多出一个，一旦主机停掉，从机马上切为虚拟ip
    ```

##### 
***

#### OpenResty版

*   安装开发库

    ```sh
    yum install -y pcre-devel openssl-devel gcc --skip-broken
    ```

*   安装OpenResty仓库

    > 在 CentOS 系统中添加 `openresty` 仓库，这样就可以便于安装、更新软件包（通过 `yum check-update` 命令）

    ```sh
    yum-config-manager --add-repo https://openresty.org/package/centos/openresty.repo
    ```

    如果提示说命令不存在，则运行：

    ```sh
    yum install -y yum-utils 
    ```

    然后再重复上面的命令

*   安装OpenResty

    ```bash
    yum install -y openresty
    ```

*   安装opm工具

    opm是OpenResty的一个管理工具，可以帮助我们安装一个第三方的Lua模块

    ```bash
    yum install -y openresty-opm
    ```

*   目录结构

    默认情况下，OpenResty安装的目录是：/usr/local/openresty

*   配置nginx的环境变量

    ```sh
    vim /etc/profile
    ```

    ```sh
    export NGINX_HOME=/usr/local/openresty/nginx
    export PATH=${NGINX_HOME}/sbin:$PATH
    ```

    ```sh
    source /etc/profile
    ```

*   启动、重启、停止

    ```sh
    ## 启动nginx
    nginx
    ## 重新加载配置
    nginx -s reload
    ## 停止
    nginx -s stop
    ```

*   访问

## 数据库

### Redis

#### 直接安装

*   下载-上传-解压至/usr/local

*   进入解压后的redis-版本目录

*   安装

    ```sh
    make && make install

    #报错安装gcc(c语言编写的需要c解析器)
    yum install -y gcc
    #zmalloc.h:50:31: 致命错误：jemalloc/jemalloc.h：没有那个或目录
    make  MALLOC=libc
    ```

*   启动

    ```sh
    #默认安装在/usr/local/bin目录下，该目录已经配置了环境变量，可在任意目录启动
    redis-server
    ```

*   配置

    ```sh
    cd /usr/local/redis-7.0.4
    cp redis.conf redis.conf.bck
    ```

    ```properties
    ## 允许访问的地址，默认是127.0.0.1，会导致只能在本地访问。修改为0.0.0.0则可以在任意IP访问，生产环境不要设置为0.0.0.0
    bind 0.0.0.0
    ## 守护进程，修改为yes后即可后台运行
    daemonize yes 
    ## 密码，设置后访问Redis必须输入密码
    requirepass 1234
    ```

    ```properties
    =====可选配置=====
    ## 监听的端口
    port 6379
    ## 工作目录，默认是当前目录，也就是运行redis-server时的命令，日志.持久化等会保存在这个目录
    dir .
    ## 数据库数量，设置为1，代表只使用1个库，默认有16个库，编号0~15
    databases 1
    ## 设置redis能够使用的最大内存
    maxmemory 512mb
    ## 日志，默认为空，不记录日志，可以指定日志名
    logfile "redis.log"
    ```

*   配置启动

    ```sh
    cd /usr/local/redis-7.0.4
    redis-server redis-conf ## 启动

    ## 关闭方式1
    ps -ef | grep redis
    kill -9 进程号  
    ## 关闭方式2
    redis-cli -a 1234 shutdown   #-a 密码
    ```

*   配置守护进程

    ```sh
    vim /etc/systemd/system/redis.service
    ```

        [Unit]
        Description=redis-server
        After=network.target

        [Service]
        Type=forking
        ExecStart=/usr/local/bin/redis-server /usr/local/redis-7.0.4/redis.conf
        PrivateTmp=true

        [Install]
        WantedBy=multi-user.target

    ```sh
    systemctl daemon-reload
    systemctl enable redis --now
    ```

***

#### docker安装

```sh
mkdir /usr/local/redis
vim /usr/local/redis/redis.conf
bind 0.0.0.0 	#开启远程权限
appendonly yes 	#开启aof持久化
#拉取镜像
docker pull redis
#创建容器
docker run --name redis  -d -v /usr/local/redis/data:/data -v /usr/local/redis/redis.conf:/usr/local/etc/redis/redis.conf -p 6379:6379 redis redis-server /usr/local/etc/redis/redis.conf
#进入
docker exec -it redis redis-cli
```

#### 主从集群

![image-20221030192503717](http://minio.botuer.com/study-node/old/image-20221030192503717.png)

共包含三个节点，一个主节点，两个从节点。

这里我们会在同一台虚拟机中开启3个redis实例，模拟主从集群，信息如下：

|        IP       | PORT |   角色   |
| :-------------: | :--: | :----: |
| 192.168.150.101 | 7001 | master |
| 192.168.150.101 | 7002 |  slave |
| 192.168.150.101 | 7003 |  slave |

*   创建目录

    我们创建三个夹，名字分别叫7001、7002、7003：

    ```sh
    ## 进入/tmp目录
    cd /tmp
    ## 创建目录
    mkdir 7001 7002 7003
    ```

*   持久化 --- 默认即可

    ```properties
    ## 开启RDB
    ## save ""
    save 3600 1
    save 300 100
    save 60 10000

    ## 关闭AOF
    appendonly no
    ```

*   复制配置

    ```sh
    ## 方式一：逐个拷贝
    cp redis-7.0.4/redis.conf 7001
    cp redis-7.0.4/redis.conf 7002
    cp redis-7.0.4/redis.conf 7003
    ## 方式二：管道组合命令，一键拷贝
    echo 7001 7002 7003 | xargs -t -n 1 cp redis-7.0.4/redis.conf
    ```

*   修改每个实例的端口、工作目录

    ```sh
    sed -i -e 's/6379/7001/g' -e 's/dir .\//dir \/tmp\/7001\//g' 7001/redis.conf
    sed -i -e 's/6379/7002/g' -e 's/dir .\//dir \/tmp\/7002\//g' 7002/redis.conf
    sed -i -e 's/6379/7003/g' -e 's/dir .\//dir \/tmp\/7003\//g' 7003/redis.conf
    ```

*   修改每个实例的声明IP

    ```properties
    ## redis实例的声明 IP
    replica-announce-ip 192.168.150.101
    ```

    每个目录都要改，我们一键完成修改（在/tmp目录执行下列命令）：

    ```sh
    ## 逐一执行
    sed -i '1a replica-announce-ip 192.168.150.101' 7001/redis.conf
    sed -i '1a replica-announce-ip 192.168.150.101' 7002/redis.conf
    sed -i '1a replica-announce-ip 192.168.150.101' 7003/redis.conf

    ## 或者一键修改
    printf '%s\n' 7001 7002 7003 | xargs -I{} -t sed -i '1a replica-announce-ip 192.168.150.101' {}/redis.conf
    ```

*   启动 --- 为了方便查看日志，我们打开3个ssh窗口，分别启动3个redis实例，启动命令

    ```sh
    ## 第1个
    redis-server 7001/redis.conf
    ## 第2个
    redis-server 7002/redis.conf
    ## 第3个
    redis-server 7003/redis.conf
    ```

*   一键停止

    ```sh
    printf '%s\n' 7001 7002 7003 | xargs -I{} -t redis-cli -p {} shutdown
    ```

*   开启主从关系

    > **从节点 执行命令 或 修改配置**
    >
    > replicaof 或者slaveof（5.0以前）命令
    >
    > *   修改配置（永久生效）
    >
    >     *   在redis.conf中添加一行配置：`slaveof <主节点ip> <主节点port>`
    > *   使用redis-cli客户端连接到redis服务，执行slaveof命令（重启后失效）：
    >
    >     ```sh
    >     slaveof <主节点ip> <主节点port>
    >     ```
    >
    > <strong><font color="red">注意</font></strong>：在5.0以后新增命令replicaof，与salveof效果一致。

    ```sh
    ## 连接 7002
    redis-cli -p 7002
    ## 执行slaveof
    slaveof 192.168.150.101 7001
    ```

    ```sh
    ## 连接 7003
    redis-cli -p 7003
    ## 执行slaveof
    slaveof 192.168.150.101 7001
    ```

    ```sh
    ## 连接 7001
    redis-cli -p 7001
    ## 查看状态
    info replication
    ```

    结果：

    ![image-20221030195558683](http://minio.botuer.com/study-node/old/image-20221030195558683.png)

*   测试

    *   利用redis-cli连接7001，执行`set num 123`

    *   利用redis-cli连接7002，执行`get num`，再执行`set num 666`

    *   利用redis-cli连接7003，执行`get num`，再执行`set num 888`

    可以发现，只有在7001这个master节点上可以执行写操作，7002和7003这两个slave节点只能执行读操作。

#### 哨兵集群

![image-20221030200205257](http://minio.botuer.com/study-node/old/image-20221030200205257.png)

三个sentinel实例信息如下：

| 节点 |        IP       |  PORT |
| -- | :-------------: | :---: |
| s1 | 192.168.150.101 | 27001 |
| s2 | 192.168.150.101 | 27002 |
| s3 | 192.168.150.101 | 27003 |

*   创建目录

    ```sh
    ## 进入/tmp目录
    cd /tmp
    ## 创建目录
    mkdir s1 s2 s3
    ```

*   s1目录创建sentinel.conf

    ```properties
    port 27001
    sentinel announce-ip 192.168.150.101
    sentinel monitor mymaster 192.168.150.101 7001 2
    sentinel down-after-milliseconds mymaster 5000
    sentinel failover-timeout mymaster 60000
    dir "/tmp/s1"
    ```

    > `port 27001`：是当前sentinel实例的端口
    >
    > `sentinel monitor mymaster 192.168.150.101 7001 2`：指定主节点信息
    >
    > *   `mymaster`：主节点名称，自定义，任意写
    > *   `192.168.150.101 7001`：主节点的ip和端口
    > *   `2`：选举master时的quorum值，票数超过此值当选

*   复制配置

    ```sh
    ## 方式一：逐个拷贝
    cp s1/sentinel.conf s2
    cp s1/sentinel.conf s3
    ## 方式二：管道组合命令，一键拷贝
    echo s2 s3 | xargs -t -n 1 cp s1/sentinel.conf
    ```

*   修改s2、s3的端口

    ```sh
    sed -i -e 's/27001/27002/g' -e 's/s1/s2/g' s2/sentinel.conf
    sed -i -e 's/27001/27003/g' -e 's/s1/s3/g' s3/sentinel.conf
    ```

*   启动

    ```sh
    ## 第1个
    redis-sentinel s1/sentinel.conf
    ## 第2个
    redis-sentinel s2/sentinel.conf
    ## 第3个
    redis-sentinel s3/sentinel.conf
    ```

*   测试 -- 让一个宕机

#### 分片集群

![image-20221030200833592](http://minio.botuer.com/study-node/old/image-20221030200833592.png)

这里我们会在同一台虚拟机中开启6个redis实例，模拟分片集群，信息如下：

|        IP       | PORT |   角色   |
| :-------------: | :--: | :----: |
| 192.168.150.101 | 7001 | master |
| 192.168.150.101 | 7002 | master |
| 192.168.150.101 | 7003 | master |
| 192.168.150.101 | 8001 |  slave |
| 192.168.150.101 | 8002 |  slave |
| 192.168.150.101 | 8003 |  slave |

*   创建目录

    ```sh
    ## 进入/tmp目录
    cd /tmp
    ## 删除旧的，避免配置干扰
    rm -rf 7001 7002 7003
    ## 创建目录
    mkdir 7001 7002 7003 8001 8002 8003
    ```

*   在/tmp下准备一个新的redis.conf，内容如下

    ```ini
    port 6379
    ## 开启集群功能
    cluster-enabled yes
    ## 集群的配置名称，不需要我们创建，由redis自己维护
    cluster-config-file /tmp/6379/nodes.conf
    ## 节点心跳失败的超时时间
    cluster-node-timeout 5000
    ## 持久化存放目录
    dir /tmp/6379
    ## 绑定地址
    bind 0.0.0.0
    ## 让redis后台运行
    daemonize yes
    ## 注册的实例ip
    replica-announce-ip 192.168.150.101
    ## 保护模式
    protected-mode no
    ## 数据库数量
    databases 1
    ## 日志
    logfile /tmp/6379/run.log
    ```

*   复制配置

    ```sh
    ## 进入/tmp目录
    cd /tmp
    ## 执行拷贝
    echo 7001 7002 7003 8001 8002 8003 | xargs -t -n 1 cp redis.conf
    ```

*   修改配置

    ```sh
    ## 进入/tmp目录
    cd /tmp
    ## 修改配置
    printf '%s\n' 7001 7002 7003 8001 8002 8003 | xargs -I{} -t sed -i 's/6379/{}/g' {}/redis.conf
    ```

*   启动

    ```sh
    ## 进入/tmp目录
    cd /tmp
    ## 一键启动所有服务
    printf '%s\n' 7001 7002 7003 8001 8002 8003 | xargs -I{} -t redis-server {}/redis.conf
    ```

*   查看

    ```sh
    ps -ef | grep redis
    ```

*   一键关闭

    ```sh
    printf '%s\n' 7001 7002 7003 8001 8002 8003 | xargs -I{} -t redis-cli -p {} shutdown
    ```

*   创建集群

    > 1）Redis5.0之前
    >
    > Redis5.0之前集群命令都是用redis安装包下的src/redis-trib.rb来实现的。因为redis-trib.rb是有ruby语言编写的所以需要安装ruby环境。
    >
    > ```sh
    > ## 安装依赖
    > yum -y install zlib ruby rubygems
    > gem install redis
    > ```
    >
    > 然后通过命令来管理集群：
    >
    > ```sh
    > ## 进入redis的src目录
    > cd /tmp/redis-6.2.4/src
    > ## 创建集群
    > ./redis-trib.rb create --replicas 1 192.168.150.101:7001 192.168.150.101:7002 192.168.150.101:7003 192.168.150.101:8001 192.168.150.101:8002 192.168.150.101:8003
    > ```
    >
    > 2）Redis5.0以后集群管理已经集成到了redis-cli中

    ```sh
    redis-cli --cluster create --cluster-replicas 1 192.168.150.101:7001 192.168.150.101:7002 192.168.150.101:7003 192.168.150.101:8001 192.168.150.101:8002 192.168.150.101:8003
    ```

    命令说明：

    *   `redis-cli --cluster`或者`./redis-trib.rb`：代表集群操作命令
    *   `create`：代表是创建集群
    *   `--replicas 1`或者`--cluster-replicas 1` ：指定集群中每个master的副本个数为1，此时`节点总数 ÷ (replicas + 1)` 得到的就是master的数量。因此节点列表中的前n个就是master，其它节点都是slave节点，随机分配到不同master

    **输入yes**

*   查看

    ```sh
    redis-cli -p 7001 cluster nodes
    ```

*   测试

    **注意：集群操作时，需要给`redis-cli`加上`-c`参数才可以：**

    ```sh
    ## 连接
    redis-cli -c -p 7001
    ## 存储数据
    set num 123
    ## 读取数据
    get num
    ## 再次存储
    set a 1
    ```

### mysql

#### 卸载

**1.** **关闭** **mysql** **服务**

```shell
systemctl stop mysqld.service
```

**2.** **查看当前** **mysql** **安装状况**

```shell
rpm -qa | grep -i mysql
## 或
yum list installed | grep mysql
```

**3.** **卸载上述命令查询出的已安装程序**

```shell
yum remove mysql-xxx mysql-xxx mysql-xxx mysqk-xxxx
```

务必卸载干净，反复执行`rpm -qa | grep -i mysql`确认是否有卸载残留

**4.** **删除** **mysql** **相关**

*   查找相关

```shell
find / -name mysql
```

*   删除上述命令查找出的相关

```shell
rm -rf xxx
```

**5.删除 my.cnf**

```shell
rm -rf /etc/my.cnf
```

#### 安装

**1. 检查/tmp临时目录权限（必不可少）**

由于mysql安装过程中，会通过mysql用户在/tmp目录下新建tmp\_db，所以请给/tmp较大的权限。执行 ：

```shell
chmod -R 777 /tmp
```

**2.** **安装前，检查依赖**

```shell
rpm -qa|grep libaio
rpm -qa|grep net-tools
```

**3. 将安装程序拷贝到/opt目录下**

在mysql的安装目录下执行：（必须按照顺序执行）

```shell
rpm -ivh mysql-community-common-8.0.25-1.el7.x86_64.rpm 
rpm -ivh mysql-community-client-plugins-8.0.25-1.el7.x86_64.rpm 
rpm -ivh mysql-community-libs-8.0.25-1.el7.x86_64.rpm 
rpm -ivh mysql-community-client-8.0.25-1.el7.x86_64.rpm 
rpm -ivh mysql-community-server-8.0.25-1.el7.x86_64.rpm
```

*   `rpm`是Redhat Package Manage缩写，通过RPM的管理，用户可以把源代码包装成以rpm为扩展名的形式，易于安装。
*   `-i`, --install 安装软件包
*   `-v`, --verbose 提供更多的详细信息输出
*   `-h`, --hash 软件包安装的时候列出哈希标记 (和 -v 一起使用效果更好)，展示进度条

> 若存在mariadb-libs问题，则执行**yum remove mysql-libs**即可

**4. 查看MySQL版本**

```shell
mysql --version 
#或
mysqladmin --version
```

**5. 服务的初始化**

为了保证数据库目录与的所有者为 mysql 登录用户，如果你是以 root 身份运行 mysql 服务，需要执行下面的命令初始化：

```shell
mysqld --initialize --user=mysql
```

说明： --initialize 选项默认以“安全”模式来初始化，则会为 root 用户生成一个密码并将`该密码标记为过期`，登录后你需要设置一个新的密码。生成的`临时密码`会往日志中记录一份。

查看密码：

```shell
cat /var/log/mysqld.log
```

root\@localhost: 后面就是初始化的密码

**6. 启动，查看状态**

```shell
#加不加.service后缀都可以 
启动：systemctl start mysqld.service 
关闭：systemctl stop mysqld.service 
重启：systemctl restart mysqld.service 
查看状态：systemctl status mysqld.service
```

**7. 查看MySQL服务是否自启动**

```shell
systemctl list-unit-files|grep mysqld.service
```

*   如不是enabled可以运行如下命令设置自启动

```shell
systemctl enable mysqld.service
```

*   如果希望不进行自启动，运行如下命令设置

```shell
systemctl disable mysqld.service
```

**8. 登录**

**首次登录**

通过`mysql -hlocalhost -P3306 -uroot -p`进行登录，在Enter password：录入初始化密码

**修改密码**

```mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
```

**确认网络**

1.在远程机器上使用ping ip地址`保证网络畅通`

2.在远程机器上使用telnet命令`保证端口号开放`访问

**方式一：关闭防火墙**

*   CentOS6 ：

```shell
service iptables stop
```

*   CentOS7：

```shell
#开启防火墙
systemctl start firewalld.service
#查看防火墙状态
systemctl status firewalld.service
#关闭防火墙
systemctl stop firewalld.service
#设置开机启用防火墙 
systemctl enable firewalld.service 
#设置开机禁用防火墙 
systemctl disable firewalld.service
```

**方式二：开放端口**

*   查看开放的端口号

```shell
firewall-cmd --list-all
```

*   设置开放的端口号

```shell
firewall-cmd --add-service=http --permanent
firewall-cmd --add-port=3306/tcp --permanent
```

*   重启防火墙

```shell
firewall-cmd --reload
```

**修改允许远程登陆**

```mysql
use mysql;
select Host,User from user;
update user set host = '%' where user ='root';
flush privileges;
```

> `%`是个 通配符 ，如果Host=192.168.1.%，那么就表示只要是IP地址前缀为“192.168.1.”的客户端都可以连接。如果`Host=%`，表示所有IP都有连接权限。
>
> 注意：在生产环境下不能为了省事将host设置为%，这样做会存在安全问题，具体的设置可以根据生产环境的IP进行设置。

配置新连接报错：错误号码 2058，分析是 mysql 密码加密方法变了。

\*\*解决方法一：\*\*升级远程连接工具版本

**解决方法二：**

```mysql
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'abc123';

```

修改不使用关闭

```sql
wait_timeout=31536000

interactive_timeout=31536000

```

#### docker安装

```sh
docker pull mysql

docker run -d \
--name mysql \
-v /data/mysql/data:/var/lib/mysql \
-v /data/mysql/conf:/etc/mysql/conf.d \
-v /data/mysql/log:/var/log/mysql \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=root \
mysql

#参数解释：
## --name： percona 指定是容器的名称
## -v： /data/mysql-data:/var/lib/mysql  将主机目录/data/mysql-data挂载到容器的/var/lib/mysql上
## -p： 33306:3306 设置端口映射，主机端口是33306，容器内部端口3306
## -e： MYSQL_ROOT_PASSWORD=root 设置容器参数，设置root用户的密码为root

## "报错Access denied for user 'root'@'120.244.40.125' (using password: YES)"

docker exec -it mysql bash 	    	        ## 以bash方式进入容器内部
mysql -u root -p 						            ## 登录 输入密码 root
use mysql;								
grant all privileges on *.* to 'root'@'%';			## 授权
flush privileges;                                   ## 刷新权限
```

### Canal

#### 开启MySQL主从

*   开启binlog

    ```sh
    vim /data/mysql/conf//my.cnf
    ```

    ```ini
    #设置binary log的存放地址和名，叫做mysql-bin
    log-bin=/var/lib/mysql/mysql-bin
    #指定对哪个database记录binary log events，这里记录heima这个库
    binlog-do-db=heima
    ```

*   设置用户权限

    添加一个仅用于数据同步的账户，出于安全考虑，这里仅提供对heima这个库的操作权限

    ```mysql
    create user canal@'%' IDENTIFIED by 'canal';
    GRANT SELECT, REPLICATION SLAVE, REPLICATION CLIENT,SUPER ON *.* TO 'canal'@'%' identified by 'canal';
    FLUSH PRIVILEGES;
    ```

*   重启

*   测试

    ```mysql
    show master status;
    ```

#### 安装Canal

*   创建网络

    我们需要创建一个网络，将MySQL、Canal、MQ放到同一个Docker网络中：

    ```sh
    docker network create heima
    ```

    让mysql加入这个网络：

    ```sh
    docker network connect heima mysql
    ```

*   上传，导入镜像

    ```sh
    docker load -i canal.tar
    ```

*   创建

    ```sh
    docker run -p 11111:11111 --name canal \
    -e canal.destinations=heima \
    -e canal.instance.master.address=mysql:3306  \
    -e canal.instance.dbUsername=canal  \
    -e canal.instance.dbPassword=canal  \
    -e canal.instance.connectionCharset=UTF-8 \
    -e canal.instance.tsdb.enable=true \
    -e canal.instance.gtidon=false  \
    -e canal.instance.filter.regex=heima\\..* \
    --network heima \
    -d canal/canal-server:v1.1.5
    ```

    *   `-p 11111:11111`：这是canal的默认监听端口

    *   `-e canal.instance.master.address=mysql:3306`：数据库地址和端口，如果不知道容器地址，可以通过`docker inspect 容器id`来查看

    *   `-e canal.instance.dbUsername=canal`：数据库用户名

    *   `-e canal.instance.dbPassword=canal` ：数据库密码

    *   `-e canal.instance.filter.regex=`：要监听的表名称

            #表名称监听支持的语法：
                mysql 数据解析关注的表，Perl正则表达式.
                多个正则之间以逗号(,)分隔，转义符需要双斜杠(\\) 
                常见例子：
                1.  所有表：.*   or  .*\\..*
                2.  canal schema下所有表： canal\\..*
                3.  canal下的以canal打头的表：canal\\.canal.*
                4.  canal schema下的一张表：canal.test1
                5.  多个规则组合使用然后以逗号隔开：	canal\\..*,mysql.test1,mysql.test2 

### Elasticsearch

#### 单点部署
**方式一：yum**
```shell
### java环境
### 下载并安装GPG key
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
### 添加yum仓库
vim /etc/yum.repos.d/elasticsearch.repo
```
```ini
[elasticsearch-7.x]
name=Elasticsearch repository for 7.x packages
baseurl=https://artifacts.elastic.co/packages/7.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
```
```shell
yum install elasticsearch       ### 安装
systemctl start elasticsearch   ### 启动
curl -X GET localhost:9200      ### 测试
```
内存小的一般会报错
```shell
vim /etc/elasticsearch/jvm.options
##############
-Xms512m
-Xmx512m
```
外网无法访问
```shell
vim /etc/elasticsearch/elasticsearch.yml
###############
network.host: 0.0.0.0
http.port: 9200
discovery.seed_hosts: ["127.0.0.1"]
```
**方式二：Docker**
*   创建网络

    **需要部署kibana容器，因此需要让es和kibana容器互联**

    ```sh
    #es-net是自定义的名称
    docker network create es-net
    ```

*   导入镜像，加载镜像

    ```sh
    docker load -i es.tar
    ```

*   运行

    ```sh
    docker run -d \
    	--name es \
        -e "ES_JAVA_OPTS=-Xms256m -Xmx256m" \
        -e "discovery.type=single-node" \
        -v es-data:/usr/share/elasticsearch/data \
        -v es-plugins:/usr/share/elasticsearch/plugins \
        --privileged \
        --network es-net \
        -p 9200:9200 \
        -p 9300:9300 \
    elasticsearch:7.12.1
    ```

    命令解释：

    *   `-e "cluster.name=es-docker-cluster"`：设置集群名称
    *   `-e "http.host=0.0.0.0"`：监听的地址，可以外网访问
    *   `-e "ES_JAVA_OPTS=-Xms512m -Xmx512m"`：内存大小
    *   `-e "discovery.type=single-node"`：非集群模式
    *   `-v es-data:/usr/share/elasticsearch/data`：挂载逻辑卷，绑定es的数据目录
    *   `-v es-logs:/usr/share/elasticsearch/logs`：挂载逻辑卷，绑定es的日志目录
    *   `-v es-plugins:/usr/share/elasticsearch/plugins`：挂载逻辑卷，绑定es的插件目录
    *   `--privileged`：授予逻辑卷访问权
    *   `--network es-net` ：加入一个名为es-net的网络中
    *   `-p 9200:9200`：端口映射配置

*   访问：<http://192.168.10.109:9200>

#### 部署Kibana

*   导入镜像，加载镜像

    ```sh
    docker load -i kibana.tar
    ```

*   运行

    ```sh
    docker run -d \
    --name kibana \
    -e ELASTICSEARCH_HOSTS=http://es:9200 \
    --network=es-net \
    -p 5601:5601  \
    kibana:7.12.1
    ```

    命令解释：

    *   `--network es-net` ：加入一个名为es-net的网络中，与elasticsearch在同一个网络中
    *   `-e ELASTICSEARCH_HOSTS=http://es:9200"`：设置elasticsearch的地址，因为kibana已经与elasticsearch在一个网络，因此可以用容器名直接访问elasticsearch
    *   `-p 5601:5601`：端口映射配置

    注意：启动较慢，可跟踪日志查看

    ```sh
    docker logs -f kibana
    ```

    ![image-20221006203919636](http://minio.botuer.com/study-node/old/typora202210062141819.png)

*   访问：<http://192.168.10.109:5601>

#### 安装分词器

##### 离线安装ik插件

*   安装插件需要知道elasticsearch的plugins目录位置，而我们用了数据卷挂载，因此需要查看elasticsearch的数据卷目录，通过下面命令查看

    ```sh
    docker volume inspect es-plugins
    ```

    ```json
    [
        {
            "CreatedAt": "2022-05-06T10:06:34+08:00",
            "Driver": "local",
            "Labels": null,
            "Mountpoint": "/var/lib/docker/volumes/es-plugins/_data",
            "Name": "es-plugins",
            "Options": null,
            "Scope": "local"
        }
    ]
    ```

*   解压elasticsearch-analysis-ik-7.12.1.zip、重命名为ik、上传至服务器/var/lib/docker/volumes/es-plugins/\_data目录下

*   重启容器

    ```sh
    docker restart es
    ```

*   查看日志

    ```sh
    docker logs -f es
    ```

*   测试

    *   IK分词器包含两种模式：

        *   `ik_smart`：最少切分

        *   `ik_max_word`：最细切分

##### 扩展词典

*   打开IK分词器config目录

*   在IKAnalyzer.cfg.xml配置内容添加

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
    <properties>
            <comment>IK Analyzer 扩展配置</comment>
            <!--用户可以在这里配置自己的扩展字典 *** 添加扩展词典-->
            <entry key="ext_dict">ext.dic</entry>
    </properties>
    ```

*   新建一个 ext.dic，可以参考config目录下复制一个配置进行修改

    ```properties
    奥力给
    ```

*   重启elasticsearch

    ```sh
    docker restart es

    ## 查看 日志
    docker logs -f elasticsearch
    ```

    ![image-20221006215716646](http://minio.botuer.com/study-node/old/typora202210062157724.png)

    **注意当前的编码必须是 UTF-8 格式，严禁使用Windows记事本编辑**

##### 停用词典

在互联网项目中，在网络间传输的速度很快，所以很多语言是不允许在网络上传递的，如：关于宗教、政治等敏感词语，那么我们在搜索时也应该忽略当前词汇。

IK分词器也提供了强大的停用词功能，让我们在索引时就直接忽略当前的停用词汇表中的内容。

*   IKAnalyzer.cfg.xml配置内容添加：

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
    <properties>
            <comment>IK Analyzer 扩展配置</comment>
            <!--用户可以在这里配置自己的扩展字典-->
            <entry key="ext_dict">ext.dic</entry>
             <!--用户可以在这里配置自己的扩展停止词字典  *** 添加停用词词典-->
            <entry key="ext_stopwords">stopword.dic</entry>
    </properties>
    ```

*   在 stopword.dic 添加停用词

    ```properties
    习大大
    ```

*   重启elasticsearch

    ```sh
    ## 重启服务
    docker restart elasticsearch
    docker restart kibana

    ## 查看 日志
    docker logs -f elasticsearch
    ```

日志中已经成功加载stopword.dic配置

##### 拼音分词器

*   拼音分词插件地址：<https://github.com/medcl/elasticsearch-analysis-pinyin>

*   安装方式与IK分词器一样，分三步：

    ​	①解压

    ​	②上传到虚拟机中，elasticsearch的plugin目录

    ​	③重启elasticsearch

    ​	④测试

#### 集群部署

##### 部署

部署es集群可以直接使用docker-compose来完成，不过要求你的Linux虚拟机至少有**4G**的内存空间

首先编写一个docker-compose，内容如下：

```sh
version: '2.2'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.12.1
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data01:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - elastic
  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.12.1
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data02:/usr/share/elasticsearch/data
    networks:
      - elastic
  es03:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.12.1
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data03:/usr/share/elasticsearch/data
    networks:
      - elastic

volumes:
  data01:
    driver: local
  data02:
    driver: local
  data03:
    driver: local

networks:
  elastic:
    driver: bridge
```

es运行需要修改一些linux系统权限，修改`/etc/sysctl.conf`

```sh
vi /etc/sysctl.conf
```

添加下面的内容：

```sh
vm.max_map_count=262144
```

然后执行命令，让配置生效：

```sh
sysctl -p
```

通过docker-compose启动集群：

```sh
docker-compose up -d
```

##### 监控

kibana可以监控es集群，不过新版本需要依赖es的x-pack 功能，配置比较复杂。

这里推荐使用cerebro来监控es集群状态，官方网址：<https://github.com/lmenezes/cerebro>

*   解压
*   进入bin目录，找到cerebro.bat，运行
*   访问<http://localhost:9000> 即可进入管理界面

## 源码

### Spring

版本

*   gradle6.1
*   spring5.1
*   jdk1.8
*   kotlin1.5.10

下载安装配置gradle

*   版本与spring对应：gradle/wrapper/gradle-wrapper.properties

*   配置环境变量GRADLE\_HOME和GRADLE\_USER\_HOME（可以是maven本地仓库）

*   下载的gradle-4.4.1-bin.zip放在gradle/wrapper/目录下

*   配置gradle-wrapper.properties

    ```properties
    #distributionUrl=https\://services.gradle.org/distributions/gradle-4.10.3-bin.zip
    distributionUrl=file://gradle-4.4.1-bin.zip
    ```

*   build.gradle

    ```groovy
    buildscript {
    	repositories {
    		gradlePluginPortal()
    		maven { url "http://maven.aliyun.com/nexus/content/groups/public/"}
    		maven{ url "http://maven.aliyun.com/nexus/content/repositories/jcenter"}
    		maven { url "https://repo.spring.io/plugins-release" }
    	}
    	dependencies {
    		classpath("io.spring.gradle:propdeps-plugin:0.0.9.RELEASE")
    		classpath("org.asciidoctor:asciidoctorj-pdf:1.5.0-alpha.16")
    	}
    }

    ...
       //还有一处 repositories也要修改
    ```

报错

    A problem occurred evaluating project ':spring-beans'. > No such property: immutableValues for class: org.gradle.api.internal.tasks.DefaultTaskDependency

*   修改：spring-beans.gradle注释掉这两行代码

    ```groovy
    //def deps = compileGroovy.taskDependencies.immutableValues + compileGroovy.taskDependencies.mutableValues
    //compileGroovy.dependsOn = deps - 'compileJava'
    ```

    报Could not find method useJUnitPlatform()

*   注释：spring-test.gradle中这行代码

    ```groovy
    //  useJUnitPlatform {
    //    includeEngines 'junit-jupiter'
    //    excludeTags 'failing-test-case'
    // }
    ```

新建工程，添加依赖

```groovy
compile(project(":spring-context"))
compileOnly group: 'org.projectlombok', name: 'lombok', version: '1.18.24'
```

报错：[Kotlin](https://so.csdn.net/so/search?q=Kotlin\&spm=1001.2101.3001.7020): Language version 1.1 is no longer supported; please, use version 1.2 or greater.

```groovy
kotlin compiler language/api 改为1.5

//build.gradle中也要改
compileKotlin {
	kotlinOptions {
		jvmTarget = "1.8"
		freeCompilerArgs = ["-Xjsr305=strict"]
		apiVersion = "1.5"
		languageVersion = "1.5"
	}
}
```

报错

```sh
Circular dependency between the following tasks:
:spring-beans:compileGroovy
\--- :spring-beans:compileJava
     \--- :spring-beans:compileKotlin
          \--- :spring-beans:compileGroovy (*)
```

![image-20221112025355216](http://minio.botuer.com/study-node/old/image-20221112025355216.png)

报错：java: 找不到符号   符号:   类 InstrumentationSavingAgent   位置: 程序包 org.springframework.instrument

    将spring-context.gradle的

    下面这一行
    optional(project(":spring-instrument"))
    修改为
    compile(project(":spring-instrument"))

前端

### Vue.js

*   安装node.js

*   安装vue

    ```sh
    npm i -g vue
    npm install -g @vue/cli
    npm install -g webpack
    ```

*   创建项目

    *   命令行`vue init webpack 项目名`
    *   图形化`vue ui`

