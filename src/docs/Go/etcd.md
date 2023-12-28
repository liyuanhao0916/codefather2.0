# etcd

## 介绍

etcd 是一款分布式存储中间件，使用 Go 语言编写，并通过 **Raft 一致性算法**处理和确保分布式一致性，**解决了分布式系统中数据一致性的问题**

etcd 常用于微服务架构中的**服务注册与发现中心**，相较于 ZooKeeper 部署更简单，而且具有数据持久化、支持 SSL 客户端安全认证的独特优势

由于 etcd 中涉及了数据一致性、多版本并发控制、watch 监控、磁盘 IO 读写等知识点，深入学习 etcd 可以帮助我们从开源项目中学习底层原理，进一步提高分布式架构设计的能力

etcd 作为一个可信赖的分布式键值存储服务，它能够为整个分布式集群存储一些关键数据，协助分布式集群的正常运转

**CAP 原理**是描述分布式系统下节点数据同步的基本定理，分别指Consistency（一致性）、Availability（可用性）和 Partition tolerance（分区容错性），这三个要素最多只能同时实现两点，不能三者兼顾，基于分布式系统的基本特质，P（分区容错性）是必须要满足的，所以接下来需要考虑满足 C（一致性）还是 A（可用性），**etcd 满足 CAP 理论中的 CP（一致性和分区容错性） 指标**，由此我们知道，etcd 解决了分布式系统中一致性存储的问题

etcd 可集中管理配置信息。服务端将配置信息存储于 etcd，客户端通过 etcd 得到服务配置信息，etcd 监听配置信息的改变，发现改变通知客户端

### 安装

**包管理工具安装** --- centos7 `yum install etcd` --- 版本可能比较低

**二进制安装** --- linux下安装脚本

```shell
ETCD_VER=v3.4.4
GITHUB_URL=https://github.com/etcd-io/etcd/releases/download
DOWNLOAD_URL=${GITHUB_URL}
rm -f /tmp/etcd-${ETCD_VER}-linux-amd64.tar.gz
rm -rf /tmp/etcd-download-test && mkdir -p /tmp/etcd-download-test
curl -L ${DOWNLOAD_URL}/${ETCD_VER}/etcd-${ETCD_VER}-linux-amd64.tar.gz -o /tmp/etcd-${ETCD_VER}-linux-amd64.tar.gz
tar xzvf /tmp/etcd-${ETCD_VER}-linux-amd64.tar.gz -C /tmp/etcd-download-test --strip-components=1
rm -f /tmp/etcd-${ETCD_VER}-linux-amd64.tar.gz
/tmp/etcd-download-test/etcd --version
/tmp/etcd-download-test/etcdctl version
```

**源码编译安装** --- 需要go环境

- clone源码
- 进入所在目录 运行go run xxx

**docker安装** --- 弊端：启动时会将 etcd 的端口暴露出来

### 集群

引导集群启动三种方式

- 静态启动
- etcd动态发现
- DNS发现

**静态启动** --- 必须在知道成员ip的前提下才能使用此方式启动

想在一台机器上实践 etcd 集群的搭建，可以通过 goreman 工具，goreman 是一个 Go 语言编写的多进程管理工具，是对 Ruby 下广泛使用的 Foreman 的重写

下面我们使用 goreman 来演示在一台物理机上面以静态方式启动 etcd 集群

- 安装goreman `go get github.com/mattn/goreman`，编译后的文件放在$GOPATH/bin中，$GOPATH/bin目录已经添加到了系统$PATH中，所以我们可以方便地执行命令goreman命令

- 编写 Procfile 脚本，我们启动三个 etcd，具体对应如下
  - hostname：infra1，ip：127.0.0.1，客户端交互端口：12379，peer通信端口：12380
  - hostname：infra2，ip：127.0.0.1，客户端交互端口：22379，peer通信端口：22380
  - hostname：infra3，ip：127.0.0.1，客户端交互端口：32379，peer通信端口：32380

```procfile
etcd1: etcd --name infra1 \
--listen-client-urls http://127.0.0.1:12379 \
--advertise-client-urls http://127.0.0.1:12379 \
--listen-peer-urls http://127.0.0.1:12380 \
--initial-advertise-peer-urls http://127.0.0.1:12380 \
--initial-cluster-token etcd-cluster-1 \
--initial-cluster 'infra1=http://127.0.0.1:12380,infra2=http://127.0.0.1:22380,infra3=http://127.0.0.1:32380' \
--initial-cluster-state new \
--enable-pprof --logger=zap --log-outputs=stderr
```

```
--name：etcd 集群中的节点名，这里可以随意，方便区分且不重复即可
--listen-client-urls：监听用于客户端通信的 url，同样可以监听多个
--advertise-client-urls：建议使用的客户端通信 url，该值用于 etcd 代理或 etcd 成员与 etcd 节点通信
--listen-peer-urls：监听用于节点之间通信的 url，可监听多个，集群内部将通过这些 url 进行数据交互(如选举、数据同步等)
--initial-advertise-peer-urls：建议用于节点之间通信的 url，节点间将以该值进行通信
--initial-cluster-token： etcd-cluster-1，节点的 token 值，设置该值后集群将生成唯一 ID，并为每个节点也生成唯一 ID。当使用相同配置文件再启动一个集群时，只要该 token 值不一样，etcd 集群就不会相互影响
--initial-cluster：集群中所有的 initial-advertise-peer-urls 的合集
--initial-cluster-state：new，新建集群的标志
```

- 启动etcd集群 `goreman -f /opt/procfile start`
- 查看集群成员 `etcdctl --endpoints=http://localhost:22379  member list`

**etcd动态发现** --- 基于 Discovery Service，即发现服务，帮助新的 etcd 成员使用共享 URL 在集群引导阶段发现所有其他成员。Discovery Service 使用已有的 etcd 集群来协调新集群的启动，主要操作如下：

- 首先，所有新成员都与发现服务交互，并帮助生成预期的成员列表；
- 之后，每个新成员使用此列表引导其服务器，该列表执行与--initial-cluster标志相同的功能，即设置所有集群的成员信息，如
  - hostname：etcd1，ip：192.168.202.128，客户端交互端口：2379，peer通信端口：2380
  - hostname：etcd2，ip：192.168.202.129，客户端交互端口：2379，peer通信端口：2380
  - hostname：etcd3，ip：192.168.202.130，客户端交互端口：2379，peer通信端口：2380
- 获取 discovery 的 token（这块有点懵）
  - 首先，需要生成新集群的唯一令牌，该令牌将用于键空间的唯一前缀，比较简单的方法是使用uuidgen生成UUID `UUID=$(uuidgen)`
  - 指定集群大小：获取令牌时，必须指定集群的大小，发现服务使用该数值来确定组成集群的所有成员，我们需要把该 url 作为--discovery参数来启动 etcd，节点会自动使用该路径对应的目录进行 etcd 的服务注册与发现

```
curl -X PUT http://10.0.10.10:2379/v2/keys/discovery/6c007a14875d53d9bf0ef5a6fc0257c817f0fb83/_config/size -d value=3
```

- 发现服务
  - 当我们本地没有可用的 etcd 集群，etcd 官网提供了一个可以公网访问的 etcd 存储地址。你可以通过如下命令得到 etcd 服务的目录 --- `curl https://discovery.etcd.io/new?size=3`，返回一个地址并把它作为--discovery参数使用
- 启动集群

```sh
etcd 发现模式下，启动 etcd 的命令如下：
# etcd1 启动
$ /opt/etcd/bin/etcd  --name etcd1 --initial-advertise-peer-urls http://192.168.202.128:2380 \
  --listen-peer-urls http://192.168.202.128:2380 \
  --data-dir /opt/etcd/data \
  --listen-client-urls http://192.168.202.128:2379,http://127.0.0.1:2379 \
  --advertise-client-urls http://192.168.202.128:2379 \
  --discovery https://discovery.etcd.io/3e86b59982e49066c5d813af1c2e2579cbf573de
```

etcd2 和 etcd3 启动类似，替换 listen-peer-urls 和 advertise-client-urls 即可。需要注意的是：在我们完成了集群的初始化后，--discovery就失去了作用。当需要增加节点时，需要使用 etcdctl 进行操作。
为了安全，每次启动新 etcd 集群时，都会使用新的 discovery token 进行注册。当出现初始化启动的节点超过了指定的数量时，多余的节点会自动转化为 Proxy 模式的 etcd（在后面课时会详细介绍）。

- 验证

```sh
/opt/etcd/bin/etcdctl  --endpoints="http://192.168.202.128:2379,http://192.168.202.129:2379,http://192.168.202.130:2379"  endpoint  health
## 结果如下
http://192.168.202.128:2379 is healthy: successfully committed proposal: took = 3.157068ms
http://192.168.202.130:2379 is healthy: successfully committed proposal: took = 3.300984ms
http://192.168.202.129:2379 is healthy: successfully committed proposal: took = 3.263923ms
```

**总结**

```
curl https://discovery.etcd.io/new?size=3
https://discovery.etcd.io/a81b5818e67a6ea83e9d4daea5ecbc92

# grab this token
TOKEN=token-01
CLUSTER_STATE=new
DISCOVERY=https://discovery.etcd.io/a81b5818e67a6ea83e9d4daea5ecbc92


etcd --data-dir=data.etcd --name n1 \
    --initial-advertise-peer-urls http://10.240.0.17:2380 --listen-peer-urls http://10.240.0.17:2380 \
    --advertise-client-urls http://10.240.0.17:2379 --listen-client-urls http://10.240.0.17:2379 \
    --discovery ${DISCOVERY} \
    --initial-cluster-state ${CLUSTER_STATE} --initial-cluster-token ${TOKEN}


etcd --data-dir=data.etcd --name n2 \
    --initial-advertise-peer-urls http://10.240.0.18:2380 --listen-peer-urls http://10.240.0.18:2380 \
    --advertise-client-urls http://10.240.0.18:2379 --listen-client-urls http://10.240.0.18:2379 \
    --discovery ${DISCOVERY} \
    --initial-cluster-state ${CLUSTER_STATE} --initial-cluster-token ${TOKEN}


etcd --data-dir=data.etcd --name n3 \
    --initial-advertise-peer-urls http://10.240.0.19:2380 --listen-peer-urls http://10.240.0.19:2380 \
    --advertise-client-urls http://10.240.0.19:2379 --listen-client-urls http:/10.240.0.19:2379 \
    --discovery ${DISCOVERY} \
    --initial-cluster-state ${CLUSTER_STATE} --initial-cluster-token ${TOKEN}
```

测试

```
    export ETCDCTL_API=3
    HOST_1=10.240.0.17
    HOST_2=10.240.0.18
    HOST_3=10.240.0.19
    ENDPOINTS=$HOST_1:2379,$HOST_2:2379,$HOST_3:2379

    etcdctl --endpoints=$ENDPOINTS member list
```



### 通信安全

etcd 支持通过 TLS 协议进行的加密通信，TLS 通道可用于对等体（指 etcd 集群中的服务实例）之间的加密内部群集通信以及加密的客户端流量。

客户端 TLS 设置群集的实现。
想要实现数据 HTTPS 加密协议访问、保障数据的安全，就需要 SSL 证书，TLS 是 SSL 与 HTTPS 安全传输层协议名称

**TLS加密**

需要命令行工具CFSSL、cfssljson

CFSSL 是 CloudFlare 的 PKI/TLS 加密利器。它既是命令行工具，也可以用于签名、验证和捆绑 TLS 证书的 HTTP API 服务器，需要 Go 1.12+ 版本才能构建

- 环境配置 安装三台etcd
- 安装CFSSL

```sh
$ ls ~/Downloads/cfssl
cfssl-certinfo_1.4.1_linux_amd64 cfssl_1.4.1_linux_amd64          cfssljson_1.4.1_linux_amd64
chmod +x cfssl_1.4.1_linux_amd64 cfssljson_1.4.1_linux_amd64 cfssl-certinfo_1.4.1_linux_amd64
mv cfssl_1.4.1_linux_amd64 /usr/local/bin/cfssl
mv cfssljson_1.4.1_linux_amd64 /usr/local/bin/cfssljson
mv cfssl-certinfo_1.4.1_linux_amd64 /usr/bin/cfssl-certinfo

## 验证 
cfssl version
```

- 配置 CA 并创建 TLS 证书

  使用 CloudFlare's PKI 工具 CFSSL 来配置 PKI 安全策略，然后用它创建 Certificate Authority（CA，即证书机构），并为 etcd 创建 TLS 证书

```sh
## 创建SSL配置目录
mkdir /opt/etcd/{bin,cfg,ssl} -p
cd /opt/etcd/ssl/

## 完善etcd CA 配置 ，写入ca-config.json
cat << EOF | tee ca-config.json
{
  "signing": {
    "default": {
      "expiry": "87600h"
    },
    "profiles": {
      "etcd": {
         "expiry": "87600h",
         "usages": [
            "signing",
            "key encipherment",
            "server auth",
            "client auth"
        ]
      }
    }
  }
}
EOF

## 生成获取etcd ca 证书，需要证书签名的请求文件，因此在ca-csr.json 写入配置如下
cat << EOF | tee ca-csr.json
{
    "CN": "etcd CA",
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "C": "CN",
            "L": "Shanghai",
            "ST": "Shanghai"
        }
    ]
}
EOF

## 根据上面的配置，生成 CA 凭证和私钥：
$ cfssl gencert -initca ca-csr.json | cfssljson -bare ca

## 生成 etcd server 证书，写入 server-csr.json 如下的配置：
cat << EOF | tee server-csr.json
{
    "CN": "etcd",
    "hosts": [
    "192.168.202.128",
    "192.168.202.129",
    "192.168.202.130"
    ],
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "C": "CN",
            "L": "Beijing",
            "ST": "Beijing"
        }
    ]
}
EOF

## 最后就可以生成 server 证书了：
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=etcd server-csr.json | cfssljson -bare server

## 启动 etcd 集群，配置如下：
#etcd1 启动
$ /opt/etcd/bin/etcd --name etcd1 --initial-advertise-peer-urls https://192.168.202.128:2380 \
     --listen-peer-urls https://192.168.202.128:2380 \
     --listen-client-urls https://192.168.202.128:2379,https://127.0.0.1:2379 \
     --advertise-client-urls https://192.168.202.128:2379 \
     --initial-cluster-token etcd-cluster-1 \
     --initial-cluster etcd1=https://192.168.202.128:2380, etcd2=https://192.168.202.129:2380, etcd3=https://192.168.202.130:2380 \
     --initial-cluster-state new \
     --client-cert-auth --trusted-ca-file=/opt/etcd/ssl/ca.pem \
     --cert-file=/opt/etcd/ssl/server.pem --key-file=/opt/etcd/ssl/server-key.pem \
     --peer-client-cert-auth --peer-trusted-ca-file=/opt/etcd/ssl/ca.pem \
     --peer-cert-file=/opt/etcd/ssl/server.pem --peer-key-file=/opt/etcd/ssl/server-key.pem

## etcd2 和 etcd3 启动类似，注意替换 listen-peer-urls 和 advertise-client-urls。通过三台服务器的控制台可以知道，集群已经成功建立

## 验证
$ /opt/etcd/bin/etcdctl --cacert=/opt/etcd/ssl/ca.pem --cert=/opt/etcd/ssl/server.pem --key=/opt/etcd/ssl/server-key.pem --endpoints="https://192.168.202.128:2379,https://192.168.202.129:2379,https://192.168.202.130:2379"  endpoint health
# 输出如下：
https://192.168.202.129:2379 is healthy: successfully committed proposal: took = 9.492956ms
https://192.168.202.130:2379 is healthy: successfully committed proposal: took = 12.805109ms
https://192.168.202.128:2379 is healthy: successfully committed proposal: took = 13.036091ms

## 查看三个节点的健康状况，endpoint health，输出的结果符合我们的预期。
## 经过 TLS 加密的 etcd 集群，在进行操作时，需要加上认证相关的信息。


```

- 自动证书

  如果集群需要加密的通信但不需要经过身份验证的连接，可以将 etcd 配置为自动生成其密钥。在初始化时，每个成员都基于其通告的 IP 地址和主机创建自己的密钥集。
  在每台机器上，etcd 将使用以下标志启动：

```sh
$ etcd --name etcd1 --initial-advertise-peer-urls https://192.168.202.128:2380 \
  --listen-peer-urls https://192.168.202.128:2380 \
  --listen-client-urls https://192.168.202.128:2379,https://127.0.0.1:2379 \
  --advertise-client-urls https://10.0.1.10:2379 \
  --initial-cluster-token etcd-cluster-1 \
  --initial-cluster infra0=https://192.168.202.128:2380,infra1=https://192.168.202.129:2380,infra2=https://192.168.202.130:2380 \
  --initial-cluster-state new \
  --auto-tls \
  --peer-auto-tls
```

由于自动签发证书并不能认证身份，直接 curl 会返回错误，需要使用 curl 的-k命令屏蔽对证书链的校验。



Discovery Service 用于生成集群的发现令牌，需要注意的是，该令牌仅用于集群引导阶段，不能用于运行时重新配置或集群监视。一个发现令牌只能代表一个 etcd 集群，只要此令牌上的发现协议启动，即使它中途失败，也不能用于引导另一个 etcd 集群

### 常用术语

![常用术语](https://s0.lgstatic.com/i/image/M00/92/44/CgqCHmARCcmANlKJAAHkVwh99Nk525.png)

### 特性

**简单**：etcd 的安装简单，且为用户提供了 HTTP API，使用起来也很简单。

**存储**：etcd 的基本功能，数据分层存储在文件目录中，类似于我们日常使用的文件系统。

**Watch 机制**：Watch 指定的键、前缀目录的更改，并对更改时间进行通知。

**安全通信**：支持 SSL 证书验证。

**高性能**：etcd 单实例可以支持 2K/s 读操作，官方也有提供基准测试脚本。

**一致可靠**：基于 Raft 共识算法，实现分布式系统内部数据存储、服务调用的一致性和高可用性。

### 应用场景

**注册发现**

**键值对存储**

**消息发布订阅**

**分布式锁**

### 核心架构

![核心架构](https://s0.lgstatic.com/i/image/M00/92/39/Ciqc1GARCeeAadU3AAAioFsPKBs142.png)

**etcd Server** 用于对外接收和处理客户端的请求；

**gRPC Server** 则是 etcd 与其他 etcd 节点之间的通信和信息同步；

**MVCC**，即多版本控制，etcd 的存储模块，键值对的每一次操作行为都会被记录存储，这些数据底层存储在 BoltDB 数据库中；

**WAL**，预写式日志，etcd 中的数据提交前都会记录到日志；

**Snapshot** 快照，以防 WAL 日志过多，用于存储某一时刻 etcd 的所有数据；


Snapshot 和 WAL 相结合，etcd 可以有效地进行数据存储和节点故障恢复等操作

虽然 etcd 内部实现机制复杂，但对外提供了简单的 API 接口，方便客户端调用。我们可以通过etcdctl 客户端命令行操作和访问 etcd 中的数据，或者通过HTTP API接口直接访问 etcd。

etcd 中的数据结构很简单，它的数据存储其实就是键值对的有序映射。etcd 还提供了一种键值对监测机制，即 Watch 机制，客户端通过订阅相关的键值对，获取其更改的事件信息。Watch 机制实时获取 etcd 中的增量数据更新，使数据与 etcd 同步。

etcd 目前有 V2.x 和 V3.x 两个大版本。etcd V2 和 V3 是在底层使用同一套 Raft 算法的两个独立应用，但相互之间实现原理和使用方法上差别很大，接口不一样、存储不一样，两个版本的数据互相隔离。至于由 etcd V2 升级到 etcd V3 的情况，原有数据只能通过 etcd V2 接口访问，V3 接口创建的数据只能通过新的 V3 的接口访问。

## etcdctl

etcdctl 是一个命令行客户端，便于我们进行服务测试或手动修改数据库内容，我们刚开始熟悉 etcd 功能时可以通过 etdctl 客户端熟悉相关操作。etcdctl 在两个不同的 etcd 版本（v2 和 v3）下的功能和使用方式也完全不同。一般通过如下方式来指定使用 etcd 的版本：
export ETCDCTL_API=2
export ETCDCTL_API=3

下面主要说明v3的命令

### CRUD

数据库操作

数据库操作基本围绕着对键值和目录的 CRUD 操作（即增删改查），及其对应的生命周期管理。我们上手这些操作其实很方便，因为这些操作是符合 REST 风格的一套 API 操作。

**键操作**：包括最常用的增删改查操作，包括 PUT、GET、DELETE 等命令。

```sh
## PUT 设置或者更新某个键的值。例如：
$ etcdctl put /test/foo1 "Hello world"
$ etcdctl put /test/foo2 "Hello world2"
$ etcdctl put /test/foo3 "Hello world3"
```

```sh
$ etcdctl del foo
1 # 删除了一个键

## 删除从 foo 到 foo9 范围的键的命令：
$ etcdctl del foo foo9
2 # 删除了两个键

## 删除键 zoo 并返回被删除的键值对的命令：
$ etcdctl del --prev-kv zoo
1   # 一个键被删除
zoo # 被删除的键
val # 被删除的键的值

## 删除前缀为 zoo 的键的命令：
$ etcdctl del --prefix zoo
2 # 删除了两个键

## 删除大于等于键 b 的 byte 值的键的命令：
$ etcdctl del --from-key b
2 # 删除了两个键
```

```sh

## GET 获取指定键的值。例如获取 /testdir/testkey 对应的值：
$ etcdctl get /testdir/testkey
Hello world

## 除此之外， etcdctl 的 GET 命令还提供了根据指定的键（key），获取其对应的十六进制格式值
$ etcdctl get /test/foo1 --hex
\x2f\x74\x65\x73\x74\x64\x69\x72\x2f\x74\x65\x73\x74\x6b\x65\x79 #键
\x48\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64 #值
## 加上--print-value-only可以读取对应的值。十六进制在 etcd 中有多处使用，如租约 ID也是十六进制。

## GET 范围内的值：左闭右开
$ etcdctl get /test/foo1 /test/foo3	## 获取了大于等于 /test/foo1，且小于 /test/foo3 的键值对
/test/foo1
Hello world
/test/foo2
Hello world2

## 获取某个前缀的所有键值对，通过 --prefix 可以指定前缀：
$ etcdctl get --prefix /test/foo
/test/foo1
Hello world
/test/foo2
Hello world2
/test/foo3
Hello world3
## 还可以通过  --limit=2 限制获取的数量：
etcdctl get --prefix --limit=2 /test/foo
## 还可以通过  -- rev=？ 访问修改的每个版本的值
$ etcdctl get --prefix --rev=2 foo #  访问第 2 个版本的 key
foo
bar
$ etcdctl get --prefix --rev=1 foo #  访问第 1 个版本的 key
## 还可以通过  --from-key 访问大于等于某个键的键值
$ etcdctl get --from-key b		# 假如a=123，b=456，c=789
b
456
z
789
```

### watch

监视键值对的改动

watch 监测一个键值的变化，一旦键值发生更新，就会输出最新的值并退出

```sh
## 更新 testkey 键值为 Hello watch。
$ etcdctl watch testkey
# 在另外一个终端: etcdctl put testkey Hello watch
testkey
Hello watch

## 从 foo to foo9 范围内键的命令：
$ etcdctl watch foo foo9
# 在另外一个终端: etcdctl put foo bar
PUT
foo
bar
# 在另外一个终端: etcdctl put foo1 bar1
PUT
foo1
bar1

## 以 16 进制格式在键 foo 上进行观察的命令：
$ etcdctl watch foo --hex
# 在另外一个终端: etcdctl put foo bar
PUT
\x66\x6f\x6f          # 键
\x62\x61\x72          # 值

## 观察多个键 foo 和 zoo 的命令：
$ etcdctl watch -i
$ watch foo
$ watch zoo
# 在另外一个终端: etcdctl put foo bar
PUT
foo
bar
# 在另外一个终端: etcdctl put zoo val
PUT
zoo
val
```

应用服务想要获取某个键的所有修改，如果客户端与etcd服务端一直保持连接，watch就可以一直监测，但是如果出现了异常，异常期间的改动，客户端就无法接收到更新，所以需要能观察到**历史变动**

```sh
## 改
$ etcdctl put foo bar         # revision = 2
OK
$ etcdctl put foo1 bar1       # revision = 3
OK
$ etcdctl put foo bar_new     # revision = 4
OK
$ etcdctl put foo1 bar1_new   # revision = 5
OK

# 从修订版本 2 开始观察键 `foo` 的改动
$ etcdctl watch --rev=2 foo	
PUT
foo
bar
PUT
foo
bar_new

## 从上一次历史修改开始观察：
# 在键 `foo` 上观察变更并返回被修改的值和上个修订版本的值
$ etcdctl watch --prev-kv foo
# 在另外一个终端: etcdctl put foo bar_latest
PUT
foo         # 键
bar_new     # 在修改前键 foo 的上一个值
foo         # 键
bar_latest  # 修改后键 foo 的值
```

压缩修订版本。
参照上述内容，etcd 保存修订版本以便应用客户端可以读取键的历史版本。但是，为了避免积累无限数量的历史数据，需要对历史的修订版本进行压缩。**经过压缩，etcd 删除历史修订版本，释放存储空间，且在压缩修订版本之前的数据将不可访问。**

```sh
$ etcdctl compact 5
compacted revision 5 #在压缩修订版本之前的任何修订版本都不可访问
$ etcdctl get --rev=4 foo
{"level":"warn","ts":"2020-05-04T16:37:38.020+0800","caller":"clientv3/retry_interceptor.go:62","msg":"retrying of unary invoker failed","target":"endpoint://client-c0d35565-0584-4c07-bfeb-034773278656/127.0.0.1:2379","attempt":0,"error":"rpc error: code = OutOfRange desc = etcdserver: mvcc: required revision has been compacted"}
Error: etcdserver: mvcc: required revision has been compacted
```

### lease

（租约），类似于 Redis 中的 TTL(Time To Live)。etcd 中的键值对可以绑定到租约上，实现存活周期控制。在实际应用中，常用来实现服务的心跳，即服务在启动时获取租约，将租约与服务地址绑定，并写入 etcd 服务器，为了保持心跳状态，服务会定时刷新租约。

**授予租约**
应用客户端可以为 etcd 集群里面的键授予租约。当键被附加到租约时，它的存活时间被绑定到租约的存活时间，而租约的存活时间相应的被 TTL 管理。在授予租约时，每个租约的最小 TTL 值由应用客户端指定。一旦租约的 TTL 到期，租约就会过期并且所有附带的键都将被删除。

```sh
# 授予租约，TTL 为 100 秒
$ etcdctl lease grant 100
lease 694d71ddacfda227 granted with TTL(10s)
# 附加键 foo 到租约 694d71ddacfda227
$ etcdctl put --lease=694d71ddacfda227 foo10 bar
OK
```

在实际的操作中，建议 TTL 时间设置久一点，避免来不及操作而出现如下错误：

```sh
{"level":"warn","ts":"2020-12-04T17:12:27.957+0800","caller":"clientv3/retry_interceptor.go:62","msg":"retrying of unary invoker failed","target":"endpoint://client-f87e9b9e-a583-453b-8781-325f2984cef0/127.0.0.1:2379","attempt":0,"error":"rpc error: code = NotFound desc = etcdserver: requested lease not found"}
```

**撤销租约**
应用通过租约 ID 可以撤销租约。撤销租约将删除所有附带的 key。

```sh
$ etcdctl lease revoke 694d71ddacfda227
lease 694d71ddacfda227 revoked
$ etcdctl get foo10
```

**刷新租期**
应用程序可以通过刷新其 TTL 保持租约存活，因此不会过期。

```sh
$ etcdctl lease keep-alive 694d71ddacfda227
lease 694d71ddacfda227 keepalived with TTL(100)
lease 694d71ddacfda227 keepalived with TTL(100)
...
```

**查询租期**
应用客户端可以查询租赁信息，检查续订或租赁的状态，是否存在或者是否已过期。应用客户端还可以查询特定租约绑定的 key。

```sh
$ etcdctl lease grant 300
lease 694d71ddacfda22c granted with TTL(300s)
$ etcdctl put --lease=694d71ddacfda22c foo10 bar
OK

## 获取有关租赁信息以及哪些 key 绑定了租赁信息：
$ etcdctl lease timetolive 694d71ddacfda22c
lease 694d71ddacfda22c granted with TTL(300s), remaining(282s)
$ etcdctl lease timetolive --keys 694d71ddacfda22c
lease 694d71ddacfda22c granted with TTL(300s), remaining(220s), attached keys([foo10])
```

### member

更新成员有两种情况：client URLs和peer URLs。

- client URLs 用于客户端的 URL，也就是对外服务的 URL；
- peer URLs 用作监听 URL，用于与其他节点通讯。

**更新 client URLs**
为了更新成员的 client URLs，只需要使用更新后的 client URL 标记（即 --advertise-client-urls）或者环境变量来重启这个成员（ETCD_ADVERTISE_CLIENT_URLS）。重启后的成员将自行发布更新后的 URL，错误更新的 client URL 将不会影响 etcd 集群的健康。

**更新 peer URLs**
要更新成员的 peer URLs，首先通过成员命令更新它，然后重启成员，因为更新 peer URL 修改了集群范围配置并能影响 etcd 集群的健康。
当我们要更新某个成员的 peer URL，需要找到该目标成员的 ID，使用 etcdctl 列出所有成员：

```sh
//设置环境变量
$ ENDPOINTS=http://localhost:22379
// 查询所有的集群成员
$ etcdctl  --endpoints=$ENDPOINTS  member list -w table
+------------------+---------+--------+------------------------+------------------------+------------+
|        ID        | STATUS  |  NAME  |       PEER ADDRS       |      CLIENT ADDRS      | IS LEARNER |
+------------------+---------+--------+------------------------+------------------------+------------+
| 8211f1d0f64f3269 | started | infra1 | http://127.0.0.1:12380 | http://127.0.0.1:12379 |      false |
| 91bc3c398fb3c146 | started | infra2 | http://127.0.0.1:22380 | http://127.0.0.1:22379 |      false |
| fd422379fda50e48 | started | infra3 | http://127.0.0.1:32380 | http://127.0.0.1:32379 |      false |
+------------------+---------+--------+------------------------+------------------------+------------+
```

在这个例子中，我们启动了三个节点的 etcd 集群。更新 8211f1d0f64f3269 成员 ID 并修改它的 peer URLs 值为 http://127.0.0.1:2380。随后使用新的配置重启 infra 1，即可完成 etcd 集群成员的 peer URLs 更新

```sh
$ etcdctl   --endpoints=http://localhost:12379  \
	member update 8211f1d0f64f3269  \
	--peer-urls=http://127.0.0.1:2380
```

**删除成员**

```sh
$ etcdctl --endpoints=$ENDPOINTS member remove 8211f1d0f64f3269 

## Member 8211f1d0f64f3269 removed from cluster ef37ad9dc622a7c4
```

此时目标成员将会自行关闭服务，并在日志中打印出移除信息，这种方式可以安全地移除 leader 和其他成员。如果是移除 leader 的场景，新 leader 被选举时集群将处于不活动状态（inactive），且持续时间通常由选举超时时间和投票过程决定

**添加成员**

```sh
## 添加到现有集群
$ etcdctl --endpoints=http://localhost:22379 member add infra4 --peer urls=http://localhost:2380

## 使用新集群
etcd --name infra4 --listen-client-urls http://127.0.0.1:2379 \
	--advertise-client-urls http://127.0.0.1:2379 \
	--listen-peer-urls http://127.0.0.1:2380 \
	--initial-advertise-peer-urls http://127.0.0.1:2380 \
	--initial-cluster-token ef37ad9dc622a7c4 \
	--initial-cluster-state existing \
	--initial-cluster 'infra4=http://127.0.0.1:2380,infra2=http://127.0.0.1:22380,infra3=http://127.0.0.1:32380' \
	--enable-pprof --logger=zap --log-outputs=stderr
	
	## 会报错，因为peer URLs 不匹配，导致了启动报错，在现有集群添加时，他是知道现有集群的信息的，并打印出了几个环境变量，这就是使用新集群的时候他不知道的，故，需要假如几个环境变量
$ export ETCD_NAME="infra4"
$ export ETCD_INITIAL_CLUSTER="infra4=http://localhost:2380,infra2=http://127.0.0.1:22380,infra3=http://127.0.0.1:32380"
$ export ETCD_INITIAL_CLUSTER_STATE=existing

$ etcd --listen-client-urls http://localhost:2379 --advertise-client-urls http://localhost:2379 --listen-peer-urls http://localhost:2380 --initial-advertise-peer-urls http://localhost:2380
```

如上述的命令执行完成，新成员将作为集群的一部分运行并立即开始同步集群的其他成员。如果**添加多个成员，官方推荐的做法是每次配置单个成员，并在添加更多新成员前验证它正确启动**

除此之外，如果添加新成员到一个节点的集群，在新成员启动前集群无法继续工作（无法写入数据），因为它需要两个成员作为 galosh 才能在一致性上达成一致。这种情况仅会发生在 etcdctl member add影响集群和新成员成功建立连接到已有成员的时间内。

**运行时重配置的设计及注意点**
我上面介绍了 etcd 集群重配置的常见操作。运行时重配置是分布式系统中难点之一，也很容易出错，我们需要了解运行时重配置命令的设计和注意点。
*两阶段配置变更设计*
在 etcd 中，出于安全考虑，每个 etcd 集群节点进行运行时重配置都必须经历两个阶段：通知集群新配置、加入新成员。

- 阶段一：通知集群新配置

  将成员添加到 etcd 集群中，需要通过调用 API 将新成员添加到集群中。当集群同意配置修改时，API 调用返回

- 阶段二：加入新成员

  要将新的 etcd 成员加入现有集群，需要**指定正确的initial-cluster并将initial-cluster-state设置为 existing**。成员启动时，它首先与现有集群通信，并验证当前集群配置是否与initial-cluster中指定的预期配置匹配。当新成员成功启动时，集群已达到预期的配置。
  将过程分为两个独立的阶段，运维人员需要了解集群成员身份的变化，这实际上为我们提供了更大的灵活性，也更容易理解这个过程。
  我们通过上面的实践可以发现，进行集群运行重配置时，每一阶段都会确认集群成员的数量和状态，当第一阶段没有问题时才会进行下一阶段的操作。这是为了第一阶段的状态不正常时，我们可以及时进行修正，从而避免因为第一阶段的配置问题，导致集群进入无序和混乱的状态。

*集群重配置注意点*
我们在前面进行了集群运行时重配置的介绍与实践，但有两点你在重配置时要特别注意。

- 集群永久失去它的大多数成员，需要从旧数据目录启动新集群来恢复之前的状态

  集群永久失去它的大多数成员的情况下，完全有可能从现有集群中强制删除发生故障的成员来完成恢复。但是，etcd 不支持该方法，因为它绕过了不安全的常规共识提交阶段。
  如果要删除的成员实际上并没有挂掉或通过同一集群中的不同成员强行删除，etcd 最终会得到具有相同 clusterID 的分散集群。这种方式将会导致后续很难调试和修复。

- 运行时重配置禁止使用公用发现服务

  公共发现服务应该仅用于引导集群。成功引导集群后，成员的 IP 地址都是已知的。若要将新成员加入现有集群，需使用运行时重新配置 API。
  如果依靠公共发现服务会存在一些问题，如公共发现服务自身存在的网络问题、公共发现服务后端是否能够支撑访问负载等。
  如果要使用运行时重配置的发现服务，你最好选择构建一个私有服务

## go操作

使用官方的`etcd/clientv3`包来连接etcd并进行相关操作

```sh
go get go.etcd.io/etcd/clientv3
```

### put、get

```go
package main

import (
    "context"
    "fmt"
    "time"

    "go.etcd.io/etcd/clientv3"
)

// etcd client put/get demo
// use etcd/clientv3

func main() {
    
    // 连接etcd
    cli, err := clientv3.New(clientv3.Config{
        Endpoints:   []string{"127.0.0.1:2379"},
        DialTimeout: 5 * time.Second,
    })
    if err != nil {
        // handle error!
        fmt.Printf("connect to etcd failed, err:%v\n", err)
        return
    }
    fmt.Println("connect to etcd success")
    defer cli.Close()	// 自动释放
    // put
    ctx, cancel := context.WithTimeout(context.Background(), time.Second)
    _, err = cli.Put(ctx, "lmh", "lmh")
    cancel()
    if err != nil {
        fmt.Printf("put to etcd failed, err:%v\n", err)
        return
    }
    // get
    ctx, cancel = context.WithTimeout(context.Background(), time.Second)
    resp, err := cli.Get(ctx, "lmh")
    cancel()
    if err != nil {
        fmt.Printf("get from etcd failed, err:%v\n", err)
        return
    }
    for _, ev := range resp.Kvs {
        fmt.Printf("%s:%s\n", ev.Key, ev.Value)
    }
}
```

### watch

此时程序就会阻塞等待etcd中lmh这个key的变化。

```go
func main() {
    cli, err := clientv3.New(clientv3.Config{
        Endpoints:   []string{"127.0.0.1:2379"},
        DialTimeout: 5 * time.Second,
    })
    if err != nil {
        fmt.Printf("connect to etcd failed, err:%v\n", err)
        return
    }
    fmt.Println("connect to etcd success")
    defer cli.Close()
    // watch key:lmh change
    rch := cli.Watch(context.Background(), "lmh") // <-chan WatchResponse
    for wresp := range rch {
        for _, ev := range wresp.Events {
            fmt.Printf("Type: %s Key:%s Value:%s\n", ev.Type, ev.Kv.Key, ev.Kv.Value)
        }
    }
}
```

### lease

```go
func main() {
    cli, err := clientv3.New(clientv3.Config{
        Endpoints:   []string{"127.0.0.1:2379"},
        DialTimeout: time.Second * 5,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("connect to etcd success.")
    defer cli.Close()

    // 创建一个5秒的租约
    resp, err := cli.Grant(context.TODO(), 5)
    if err != nil {
        log.Fatal(err)
    }

    // 5秒钟之后, /lmh/ 这个key就会被移除
    _, err = cli.Put(context.TODO(), "/lmh/", "lmh", clientv3.WithLease(resp.ID))
    if err != nil {
        log.Fatal(err)
    }
}
```

### KeepAlive

```go
func main() {
    cli, err := clientv3.New(clientv3.Config{
        Endpoints:   []string{"127.0.0.1:2379"},
        DialTimeout: time.Second * 5,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("connect to etcd success.")
    defer cli.Close()

    resp, err := cli.Grant(context.TODO(), 5)
    if err != nil {
        log.Fatal(err)
    }

    _, err = cli.Put(context.TODO(), "/lmh/", "lmh", clientv3.WithLease(resp.ID))
    if err != nil {
        log.Fatal(err)
    }

    // the key 'foo' will be kept forever
    ch, kaerr := cli.KeepAlive(context.TODO(), resp.ID)
    if kaerr != nil {
        log.Fatal(kaerr)
    }
    for {
        ka := <-ch
        fmt.Println("ttl:", ka.TTL)
    }
}
```

### 分布式锁

go.etcd.io/etcd/clientv3/concurrency在etcd之上实现并发操作，如分布式锁、屏障和选举。

```go
import "go.etcd.io/etcd/clientv3/concurrency"

func main(){
    cli, err := clientv3.New(clientv3.Config{Endpoints: endpoints})
	if err != nil {
	    log.Fatal(err)
	}
	defer cli.Close()
	
	// 创建两个单独的会话用来演示锁竞争
	s1, err := concurrency.NewSession(cli)
	if err != nil {
	    log.Fatal(err)
	}
	defer s1.Close()
	m1 := concurrency.NewMutex(s1, "/my-lock/")
	
	s2, err := concurrency.NewSession(cli)
	if err != nil {
	    log.Fatal(err)
	}
	defer s2.Close()
	m2 := concurrency.NewMutex(s2, "/my-lock/")
	
	// 会话s1获取锁
	if err := m1.Lock(context.TODO()); err != nil {
	    log.Fatal(err)
	}
	fmt.Println("acquired lock for s1")
	
	m2Locked := make(chan struct{})
	go func() {
	    defer close(m2Locked)
	    // 等待直到会话s1释放了/my-lock/的锁
	    if err := m2.Lock(context.TODO()); err != nil {
	        log.Fatal(err)
	    }
	}()
	
	if err := m1.Unlock(context.TODO()); err != nil {
	    log.Fatal(err)
	}
	fmt.Println("released lock for s1")
	
	<-m2Locked
	fmt.Println("acquired lock for s2")
}
```

## 高级操作

### 网关

**etcd-gateway**

etcd 网关是一个简单的TCP 代理，可将网络数据转发到 etcd 集群。网关是无状态且透明的，它既不会检查客户端请求，也不会干扰集群响应，支持多个 etcd 服务器实例，并采用简单的循环策略。etcd 网关将请求路由到可用端点，并向客户端隐藏故障，使得客户端感知不到服务端的故障。后期可能会支持其他访问策略，例如加权轮询。

**grpc-gateway**

etcd v3 使用 gRPC 作为消息传输协议。etcd 项目中包括了基于 gRPC 的 Go client 和命令行工具 etcdctl，客户端通过 gRPC 框架与 etcd 集群通讯。对于不支持 gRPC 的客户端语言，etcd 提供 JSON 的 gRPC-Gateway，通过 gRPC-Gateway 提供 RESTful 代理，转换 HTTP/JSON 请求为 gRPC 的 Protocol Buffer 格式的消息。

这里你需要注意的是，在 HTTP 请求体中的 JSON 对象，其包含的 key 和 value 字段都被定义成了 byte 数组，因此必须在 JSON 对象中，使用 base64 编码对内容进行处理。为了方便，我在下面例子将会使用 curl 发起 HTTP 请求，其他的 HTTP/JSON 客户端（如浏览器、Postman 等）都可以进行这些操作。

即使是 v3 版本下的 API，gRPC-Gateway 提供的接口路径在内部细分的版本下也有不同，所以需要注意当前正在使用的 etcd 版本。

[rpc.swagger.json](https://github.com/etcd-io/etcd/blob/master/Documentation/dev-guide/apispec/swagger/rpc.swagger.json)

```sh
$ curl -L http://localhost:2379/v3/kv/put \
  -X POST -d '{"key": "Zm9v", "value": "YmFy"}'		## 实际写入的键值对为 foo：bar
# 输出结果如下：
{"header":{"cluster_id":"14841639068965178418","member_id":"10276657743932975437","revision":"16","raft_term":"9"}}
```

```sh
$ curl -L http://localhost:2379/v3/kv/range \		## range范围查询
  -X POST -d '{"key": "Zm9v"}'
# 输出结果如下：
{"header":{"cluster_id":"14841639068965178418","member_id":"10276657743932975437","revision":"16","raft_term":"9"},"kvs":[{"key":"Zm9v","create_revision":"13","mod_revision":"16","version":"4","value":"YmFy"}],"count":"1"}
```

```sh
$ curl -L http://localhost:2379/v3/kv/range \
  -X POST -d '{"key": "Zm9v", "range_end": "Zm9w"}'		## 指定前缀
# 输出结果如下：
{"header":{"cluster_id":"14841639068965178418","member_id":"10276657743932975437","revision":"16","raft_term":"9"},"kvs":[{"key":"Zm9v","create_revision":"13","mod_revision":"16","version":"4","value":"YmFy"}],"count":"1"}
```

```sh
$ curl -N http://localhost:2379/v3/watch \
  -X POST -d '{"create_request": {"key":"Zm9v"} }' &	## watch
# 输出结果如下：
{"result":{"header":{"cluster_id":"12585971608760269493","member_id":"13847567121247652255","revision":"1","raft_term":"2"},"created":true}}

$ curl -L http://localhost:2379/v3/kv/put \
  -X POST -d '{"key": "Zm9v", "value": "YmFy"}' >/dev/null 2>&1		## 更新
```

```sh
# 查询键值对的版本
$ curl -L http://localhost:2379/v3/kv/range   -X POST -d '{"key": "Zm9v"}'
#响应结果
{"header":{"cluster_id":"14841639068965178418","member_id":"10276657743932975437","revision":"20","raft_term":"9"},"kvs":[{"key":"Zm9v","create_revision":"13","mod_revision":"20","version":"8","value":"YmFy"}],"count":"1"}
# 事务，对比指定键值对的创建版本
$ curl -L http://localhost:2379/v3/kv/txn \
  -X POST \
  -d '{"compare":[{"target":"CREATE","key":"Zm9v","createRevision":"13"}],"success":[{"requestPut":{"key":"Zm9v","value":"YmFy"}}]}'
 #响应结果
 {"header":{"cluster_id":"14841639068965178418","member_id":"10276657743932975437","revision":"20","raft_term":"9"},"succeeded":true,"responses":[{"response_put":{"header":{"revision":"20"}}}]}
 
# 事务，对比指定键值对的版本
$ curl -L http://localhost:2379/v3/kv/txn \
  -X POST \
  -d '{"compare":[{"version":"8","result":"EQUAL","target":"VERSION","key":"Zm9v"}],"success":[{"requestRange":{"key":"Zm9v"}}]}'
 #响应结果
{"header":{"cluster_id":"14841639068965178418","member_id":"10276657743932975437","revision":"6","raft_term":"3"},"succeeded":true,"responses":[{"response_range":{"header":{"revision":"6"},"kvs":[{"key":"Zm9v","create_revision":"2","mod_revision":"6","version":"4","value":"YmF6"}],"count":"1"}}]}
```

**总结**

etcd 网关通常用于 etcd 集群的门户，是一个简单的 TCP 代理，将客户端请求转发到 etcd 集群，对外屏蔽了 etcd 集群内部的实际情况，在集群出现故障或者异常时，可以通过 etcd 网关进行切换；

gRPC-Gateway 则是对于 etcd 的 gRPC 通信协议的补充，有些语言的客户端不支持 gRPC 通信协议，此时就可以使用 gRPC-Gateway 对外提供的 HTTP API 接口。通过 HTTP 请求，实现与 gRPC 调用协议同样的功能。

### gRPC proxy

gRPC proxy 是在 gRPC 层（L7）运行的无状态 etcd 反向代理，旨在减少核心 etcd 集群上的总处理负载。gRPC proxy 合并了监视和 Lease API 请求，实现了水平可伸缩性。同时，为了保护集群免受滥用客户端的侵害，gRPC proxy 实现了键值对的读请求缓存。

```sh
## 使用etcd grpc-proxy start的命令开启 etcd 的 gRPC proxy 模式，包含上表中的静态成员：
$ etcd grpc-proxy start --endpoints=http://192.168.10.7:2379,http://192.168.10.8:2379,http://192.168.10.9:2379 --listen-addr=192.168.10.7:12379

{"level":"info","ts":"2020-12-13T01:41:57.561+0800","caller":"etcdmain/grpc_proxy.go:320","msg":"listening for gRPC proxy client requests","address":"192.168.10.7:12379"}
{"level":"info","ts":"2020-12-13T01:41:57.561+0800","caller":"etcdmain/grpc_proxy.go:218","msg":"started gRPC proxy","address":"192.168.10.7:12379"}
```

在192.168.10.7上进行监听并转发到其他成员上

下面经过proxy发送请求

```sh
$ ETCDCTL_API=3 etcdctl --endpoints=192.168.10.7:12379 put foo bar
OK
$ ETCDCTL_API=3 etcdctl --endpoints=192.168.10.7:12379 get foo
foo
bar
```

**客户端端点同步**

gRPC 代理是 gRPC 命名的提供者，支持在启动时通过写入相同的前缀端点名称进行注册。这样可以使客户端将其端点与具有一组相同前缀端点名的代理端点同步，进而实现高可用性

没有配置代理的前缀端点名时，获取其成员列表只会显示当前节点的信息，也不会包含其他的端点

下面我们来启动两个 gRPC 代理，在启动时通过`--resolver-prefix`指定自定义的前缀___grpc_proxy_endpoint来注册 gRPC 代理

```sh
$ etcd grpc-proxy start --endpoints=localhost:12379  \
	--listen-addr=127.0.0.1:23790  \
    --advertise-client-url=127.0.0.1:23790  \
    --resolver-prefix="___grpc_proxy_endpoint"  \
    --resolver-ttl=60

$ etcd grpc-proxy start --endpoints=localhost:12379 \
  --listen-addr=127.0.0.1:23791 \
  --advertise-client-url=127.0.0.1:23791 \
  --resolver-prefix="___grpc_proxy_endpoint" \
  --resolver-ttl=60
  
  ## 查询成员
  ETCDCTL_API=3 etcdctl --endpoints=http://localhost:23790 member list --write-out table
  ## 发现不加前缀只显示当前节点，加前缀后会列出同前缀的所有节点
```

go客户端中实现如下

```go
cli, err := clientv3.New(clientv3.Config{
    Endpoints: []string{"http://localhost:23790"},
})
if err != nil {
    log.Fatal(err)
}
defer cli.Close()
// 获取注册过的 grpc-proxy 端点
if err := cli.Sync(context.Background()); err != nil {
    log.Fatal(err)
}
```

**可伸缩的watch api**

如果客户端监视同一键或某一范围内的键，gRPC 代理可以将这些客户端监视程序（c-watcher）合并为连接到 etcd 服务器的单个监视程序（s-watcher）。当 watch 事件发生时，代理将所有事件从 s-watcher 广播到其 c-watcher。

假设 N 个客户端监视相同的 key，则 gRPC 代理可以将 etcd 服务器上的监视负载从 N 减少到 1。用户可以部署多个 gRPC 代理，进一步分配服务器负载。

为了有效地将多个客户端监视程序合并为一个监视程序，gRPC 代理在可能的情况下将新的 c-watcher 合并为现有的 s-watcher。*由于网络延迟或缓冲的未传递事件，合并的 s-watcher 可能与 etcd 服务器不同步*。

*如果没有指定监视版本*，gRPC 代理将*不能保证 c-watcher 从最近的存储修订版本开始监视*。例如，如果客户端从修订版本为 1000 的 etcd 服务器监视，则该监视者将从修订版本 1000 开始。如果客户端从 gRPC 代理监视，则可能从修订版本 990 开始监视。

*类似的限制也适用于取消*。取消 watch 后，etcd 服务器的修订版可能大于取消响应修订版。

对于大多数情况，这两个限制一般不会引起问题，未来也可能会有其他选项强制观察者绕过 gRPC 代理以获得更准确的修订响应。

**可伸缩的lease api**

为了保持客户端申请租约的有效性，客户端至少建立一个 gRPC 连接到 etcd 服务器，以定期发送心跳信号。如果 etcd 工作负载涉及很多的客户端租约活动，这些流可能会导致 CPU 使用率过高。为了减少核心集群上的流总数，gRPC 代理支持将 lease 流合并。

假设有 N 个客户端正在更新租约，则单个 gRPC 代理将 etcd 服务器上的流负载从 N 减少到 1。在部署的过程中，可能还有其他 gRPC 代理，进一步在多个代理之间分配流。

在下图示例中，三个客户端更新了三个独立的租约（L1、L2 和 L3）。gRPC 代理将三个客户端租约流（c-stream）合并为连接到 etcd 服务器的单个租约（s-stream），以保持活动流。代理将客户端租约的心跳从 c-stream 转发到 s-stream，然后将响应返回到相应的 c-stream。

**命名空间**

上面我们讲到 gRPC proxy 的端点可以通过配置前缀，自动发现。而当应用程序期望对整个键空间有完全控制，etcd 集群与其他应用程序共享的情况下，为了使所有应用程序都不会相互干扰地运行，代理可以对etcd 键空间进行分区，以便客户端大概率访问完整的键空间。

当给代理提供标志`--namespace`时，所有进入代理的客户端请求都将转换为在键上具有用户定义的前缀。普通的请求对 etcd 集群的访问将会在我们指定的前缀（即指定的 --namespace 的值）下，而来自代理的响应将删除该前缀；而这个操作对于客户端来说是透明的，根本察觉不到前缀。

```sh
./etcd grpc-proxy start --endpoints=localhost:12379 \
  --listen-addr=127.0.0.1:23790 \
  --namespace=my-prefix/
```

```sh
## 通过代理获取，无需指定前缀
$ ETCDCTL_API=3 etcdctl --endpoints=localhost:23790 put my-key abc	
# OK
$ ETCDCTL_API=3 etcdctl --endpoints=localhost:23790 get my-key
# my-key
# abc

## 通过集群直接获取，需要指定前缀
$ ETCDCTL_API=3 etcdctl --endpoints=localhost:2379 get my-prefix/my-key
# my-prefix/my-key
# abc
```

**指标与健康检查**

gRPC 代理为--endpoints定义的 etcd 成员公开了/health和 Prometheus 的/metrics接口（普罗米修斯的监测接口）。我们通过浏览器访问这两个接口：

```http
## 直接通过浏览器访问
192.168.10.7:12379/metrics
```

除了使用默认的端点访问这两个接口，另一种方法是定义一个附加 URL，该 URL 将通过 --metrics-addr 标志来响应/metrics和/health端点。命令如下所示 ：

```sh
$ ./etcd grpc-proxy start \
  --endpoints http://localhost:12379 \
  --metrics-addr http://0.0.0.0:6633 \
  --listen-addr 127.0.0.1:23790 \
```

**TLS代理加密**

通过使用 gRPC 代理 etcd 集群的 TLS，可以给没有使用 HTTPS 加密方式的本地客户端提供服务，实现 etcd 集群的 TLS 加密中止，即未加密的客户端与 gRPC 代理通过 HTTP 方式通信，gRPC 代理与 etcd 集群通过 TLS 加密通信

```sh
## 没有使用代理
$ etcd --listen-client-urls https://localhost:12379 \
	--advertise-client-urls https://localhost:2379 \
	--cert-file=peer.crt --key-file=peer.key --trusted-ca-file=ca.crt --client-cert-auth
	
# 访问失败
$ ETCDCTL_API=3 etcdctl --endpoints=http://localhost:2379 endpoint status
# 访问成功
$ ETCDCTL_API=3 etcdctl --endpoints=https://localhost:2379 --cert=client.crt --key=client.key --cacert=ca.crt endpoint status
```



```sh
## 通过使用客户端证书连接到 etcd 端点https://localhost:2379，并在 localhost:12379 上启动 gRPC 代理
$ etcd grpc-proxy start --endpoints=https://localhost:2379 \
	--listen-addr localhost:12379 \
	--cert client.crt --key client.key --cacert=ca.crt --insecure-skip-tls-verify
	
## 启动后，我们通过 gRPC 代理写入一个键值对测试：
$ ETCDCTL_API=3 etcdctl --endpoints=http://localhost:12379 put abc def
# OK
```

可以看到，使用 HTTP 的方式设置成功。
回顾上述操作，我们通过 etcd 的 gRPC 代理实现了代理与实际的 etcd 集群之间的 TLS 加密，而本地的客户端通过 HTTP 的方式与 gRPC 代理通信。因此这是一个简便的调试和开发手段，你在生产环境需要谨慎使用，以防安全风险。

### 配置与调优

**推荐服务器配置**

*CPU 处理器*

大部分情况下，etcd 的部署对 CPU 处理器的要求不高。一般的集群只需要**双核到四核**的 CPU 就能平稳运行。如果 etcd 集群负载的客户端达到数千个，每秒的请求数可能是**成千上万**个，这种情况就需要增加 CPU 的配置，通常需要**八到十六个**专用内核。

*内存大小*

etcd 对内存的需求同样也不是很高，etcd 服务端内存占用相对较小。当然，即使这样我们也得分配足够的内存给 etcd，**通常 8GB** 大小的内存就足够了。etcd 服务器会缓存键值数据，其余**大部分内存用于跟踪 watch 监视器**。因此，对于具有数**千个 watch 监视器或者数百万键值对**的大型部署，我们需要相应地将内存扩展到 **16GB 以上**。

*磁盘*

磁盘 IO 速度是影响 etcd 集群性能和稳定性的最关键因素。IO 速度慢的磁盘会增加 etcd 请求的延迟，并有可能影响集群的稳定性。etcd 的一致性共识算法 Raft 依赖元数据，持久存储在日志中，因此大多数 etcd 集群成员须将请求写入磁盘。
另外，etcd 还将以增量的方式将检查点写入磁盘中，以便截断该日志。如果这些写入花费的时间太长，心跳可能会超时并触发选举，进而破坏集群的稳定性。通常，可以使用基准测试工具判断磁盘的速度是否适合 etcd，为了测量实际的顺序 IOPS，建议使用磁盘基准测试工具，例如 DiskBench 或者 fio。
etcd 对磁盘写入延迟非常敏感，通常需要 7200 RPM 转速的磁盘。对于负载较重的集群，官方建议使用 SSD 固态硬盘。etcd 仅需要适度的磁盘带宽，但是当故障成员需要赶上集群时，更大的磁盘带宽可以缩短恢复时间。通常，10MB/s 的带宽可以在 15 秒内恢复 100MB 数据，对于大型集群，建议使用 100MB/s 或更高的速度在 15 秒内恢复 1GB 数据。
在条件允许的情况下，一般使用 **SSD** 作为 etcd 的存储。与机械硬盘相比，SSD 写入延迟较低，能够提高 etcd 的稳定性和可靠性。如果使用**机械硬盘，尽量使用转速达到 15,000 RPM 的磁盘**。对于机械磁盘和 SSD，使用 RAID 0 也是提高磁盘速度的有效方法。由于 etcd 的一致复制已经获得了高可用性，至少三个集群成员不需要 RAID 的镜像和磁盘阵列。

*网络*

多个成员的 etcd 集群部署得益于快速可靠的网络。为了使 etcd 既能实现一致性，又能够实现容忍分区性，需要网络保证低延迟和高带宽。低延迟使得 etcd 成员可以快速通信，高带宽可以减少恢复故障 etcd 成员的时间，具有分区中断的不可靠网络将导致 etcd 集群的可用性降低。**1GbE** 对于常见的 etcd 部署就足够了，**对于大型 etcd 集群，10GbE 的网络可以缩短平均恢复时间。**
我们还可以通过规避在多个数据中心部署 etcd 成员的方式来减少网络开销，单个数据中心内部署 etcd 成员可以避免延迟开销，提升 etcd 集群的可用性。





**调优**

etcd 启动时的**默认设置适用于网络低延迟的场景**，网络延迟较高的场景下，如网络跨域数据中心，心跳间隔和选举超时的设置就需要优化。每一次超时时间应该包含一个请求从发出到响应成功的时间，当然网络慢不仅是延迟导致的，还可能受到 etcd 集群成员的低速磁盘 IO 影响。

*磁盘*

etcd 集群对磁盘的延迟非常敏感。因为 etcd 需要存储变更日志，多个进程同时操作磁盘可能引起更高的 fsync 延迟。IO 的延迟问题可能引起 etcd 丢失心跳、请求超时或者 Leader 临时丢失，可以通过提高 etcd 进程的磁盘优先级来解决磁盘延迟问题。
在 Linux 系统中，etcd 的磁盘优先级可以通过 Ionic 去配置，Ionice 用来获取或设置程序的 IO 调度与优先级。因此，我们可以执行如下的命令：

```sh
$ sudo ionice -c2 -n0 -p `pgrep etcd`
## 上述命令指定-c2尽最大努力的调度策略，即操作系统将会尽最大努力设置 etcd 进程为最高优先级。
```

*网络调优*

如果 etcd 集群的 Leader 实例拥有大量并发客户端连接，网络延迟可能会导致 Follower 成员与 Leader 之间通信的请求处理被延迟。在 Follower 的 Send Buffer 中能看到错误的列表，类似如下的错误：
dropped MsgProp to 917ad13ee8235c3a since streamMsg's sending buffer is full
dropped MsgAppResp to 917ad13ee8235c3a since streamMsg's sending buffer is full

面对这种情况，你可以通过提高 Leader 的网络优先级来提高 Follower 的请求的响应。在 Linux 系统中，你可以使用流量控制机制来确定对等流量的优先级。流量控制器 TC（Traffic Control）用于 Linux 内核的流量控制，其实现主要是通过在输出端口处建立一个队列来实现流量控制。

```sh
tc qdisc add dev ens192 root handle 1: prio bands 3
tc filter add dev ens192 parent 1: protocol ip prio 1 u32 match ip sport 2380 0xffff flowid 1:1
tc filter add dev ens192 parent 1: protocol ip prio 1 u32 match ip dport 2380 0xffff flowid 1:1
tc filter add dev ens192 parent 1: protocol ip prio 2 u32 match ip sport 2379 0xffff flowid 1:1
tc filter add dev ens192 parent 1: protocol ip prio 2 u32 match ip dport 2379 0xffff flowid 1:1
```

如上的五条命令中，

- 其中第一条命令，建立一个优先级队列，并将该队列绑定到网络物理设备 ens192 上，其编号为 1:0。我们可以查看本地网卡的名称，以我的 Centos 7 为例，可以观察到本地的网卡名称为 ens192（`通过 ip addr 查看`）

- 接着有四条过滤器的命令，过滤器主要服务于分类。通过上述代码，可以观察到：用于成员间通信的 2380 端口的命令优先级高于 2379 端口。每一个端口有两条命令，分别对应：sport 和 dport。依次执行过滤器，对于相同的优先级，系统将按照命令的先后顺序执行。这几个过滤器还用到了 u32 选择器(命令中 u32 后面的部分)来匹配不同的数据流
- protocol ip表示该过滤器应该检查报文分组的协议字段。prio 1表示它们对报文处理的优先级，对于不同优先级的过滤器，系统将按照从小到大的优先级排序
- 第二条和第三条命令，判断的是 dport 和 sport 字段，表示出去或者进来的不同类数据包。如果该字段与Oxffff进行与操作的结果是 2380，则flowid 1:1表示将把该数据流分配给类别 1:1。通过 TC 命令你能够提高 Leader 与 etcd 集群成员之间的网络优先级，使得 etcd 集群处于一个可靠的状态。更加详细的有关 TC 的用法这里我就不再赘述了，你可以参考 [TC 的手册页](https://wenku.baidu.com/view/d91bebbbfd0a79563c1e72dd.html)

*快照* --- 降低内存压力

etcd 追加所有键值对的变更到日志中，这些日志每一行记录一个 key 的变更，日志规模在不断增长。当简单使用 etcd 时，这些日志增长不会有问题，但集群规模比较大的时候，问题就会显现，日志就会越来越多且数据量也会变得越来越大。
**为了避免大量日志，etcd 会定期生成快照。这些快照通过将当前状态的修改保存到日志，并移除旧的日志，以实现日志的压缩。**
创建快照对于 etcd v2 版本来说开销比较大，所以只有当更改记录操作达到一定数量后，才会制作快照。在 etcd 中，**默认**创建快照的配置是每 **10000 次更改**才会保存快照，如果 etcd 的**内存和磁盘使用率过高，也可以降低这个阈值**，命令如下所示：

```sh
$ etcd --snapshot-count=5000
#或者使用环境变量的方式
$ ETCD_SNAPSHOT_COUNT=5000 etcd
```

*时间参数*

基本的分布式一致性协议依赖于两个单独的时间参数，分别是心跳间隔和选举超时：


心跳间隔（Heartbeat Interval），该参数通常用来保活，代表 Leader 通知所有的 Follower，它还活着，仍然是 Leader，该参数被设置为节点之间网络往返时间，etcd **默认心跳间隔是 100ms**；


选举超时（Election Timeout），它表示 Follower 在多久后还没有收到 Leader 的心跳，它就自己尝试重新发起选举变成 Leader，一般为了避免脑裂发生，这个时间会稍微长一点，etcd 的**默认选举超时是 1000ms**，当然**如果时间太长也会导致数据一致性的问题**。


一个 etcd 集群中的所有节点应该设置一样的心跳间隔和选举超时。如果设置不一样可能导致集群不稳定。默认值可以通过命令行参数或环境参数覆盖，如下所示，单位是 ms。
```sh
# 命令行参数:
$ etcd --heartbeat-interval=100 --election-timeout=500
# 环境参数:
$ ETCD_HEARTBEAT_INTERVAL=100 ETCD_ELECTION_TIMEOUT=500 etcd
```

在实际调整参数时需要做一些权衡，需要考虑网络、服务硬件、负载、集群的规模等因素。**心跳间隔推荐设置为节点之间的最大 RTT，一般可设置为 RTT 的 0.5-1.5 倍**。如果心跳间隔太短，etcd 实例会频繁发送没必要的心跳，增加 CPU 和网络的使用率。另外，过长的心跳间隔也会延长选举超时时间，一旦选举超时过长，还会导致需要更长的时间才能发现 Leader 故障。**测量 RTT 最简单方法就是用PING 工具**。

对于选举超时的时间，应该基于心跳间隔和节点的平均 RTT 去设置。**选举超时应该至少是 RTT 的 10 倍，这样才能视为在该网络中容错**。例如，节点间的 RTT 是 10ms，那么超时时间至少应该是 100ms。

> 选举超时时间**最大限制是 50000ms（即 50s）**，只有 etcd 被部署在**全球范围内**时，才应该使用这个值。如果出现不均匀的网络性能或者常规的网络延迟和丢失，会引起多次 etcd 网络重试，所以 5s 是一个安全的 RTT 最高值。只有心跳间隔为 5s 时，超时时间才应该设置为 50s。

### 底层架构

**项目结构**

![项目结构](https://s0.lgstatic.com/i/image6/M00/04/BD/CioPOWAuMueATk02AAE0xMg7j9w742.png)

etcd 核心的模块有 lease、mvcc、raft、etcdserver，其余都是辅助的功能。其中 etcdserver 是其他模块的整合

**架构图**

![架构图](https://s0.lgstatic.com/i/image6/M00/04/C0/Cgp9HWAuMvWARHxgAACMKTNJgfw845.png)

*客户端层*：包括 **clientv3** 和 **etcdctl** 等客户端。用户通过命令行或者客户端调用提供了 RESTful 风格的API，降低了 etcd的使用复杂度。除此之外，客户端层的负载均衡（etcd V3.4 版本的客户端默认使用的是 Round-robin，即轮询调度）和节点间故障转移等特性，提升了etcd 服务端的高可用性。需要注意的是，etcd V3.4之前版本的客户端存在负载均衡的 Bug，如果第一个节点出现异常，访问服务端时也可能会出现异常，建议进行升级。

*API 接口层*：API 接口层提供了客户端访问服务端的通信协议和接口定义，以及服务端节点之间相互通信的协议。etcd 有 V3和V2 两个版本。etcd V3 使用**gRPC** 作为消息传输协议；对于之前的V2 版本，etcd 默认使用HTTP/1.x 协议。对于不支持 gRPC的客户端语言，etcd 提供 JSON的**grpc-gateway**。通过 grpc-gateway 提供 RESTful 代理，转换 HTTP/JSON 请求为 gRPC 的 Protocol Buffer 格式的消息

*etcd Raft 层*：负责 Leader **选举**和**日志复制**等功能，除了与本节点的 etcd Server 通信之外，还与集群中的其他 etcd 节点进行交互，实现**分布式一致性数据同步**的关键工作。

*逻辑层*：etcd 的业务逻辑层，包括**鉴权、租约、KVServer、MVCC 和 Compactor 压缩**等核心功能特性。

*etcd 存储*：实现了**快照**、**预写式日志 WAL**（Write Ahead Log）。etcd V3 版本中，使用 **BoltDB** 来持久化存储集群元数据和用户写入的数据。



**交互**

![交互图](https://s0.lgstatic.com/i/image6/M00/07/3C/Cgp9HWAzS5qAINI_AAE7hCmxS4Q375.png)

执行一个写入请求，从上到下依次经过   客户端 → API 接口层 → etcd Server → etcd raft 算法库

- etcd Server：接收**客户端**的请求，在上述的etcd 项目代码中对应**etcdserver 包**。请求到达 etcd Server 之后，经过 **KVServer 拦截**，实现诸如日志、Metrics 监控、请求校验等功能。etcd Server 中的raft模块，用于与 etcd-raft 库进行通信。applierV3 模块封装了 etcd V3 版本的数据存储；WAL 用于写数据日志，**WAL中保存了任期号、投票信息、已提交索引、提案内容等**，**etcd 根据 WAL 中的内容在启动时恢复，以此实现集群的数据一致性**
- etcdraft：etcd 的raft 库。**raftLog 用于管理 raft 协议中单个节点的日志**，**都处于内存中**。raftLog 中还有两种结构体 unstable和storage，unsable 中存储不稳定的数据，表示还没有 commit，而 storage中都是已经被 commit 了的数据。这两种结构体分别用于不同步骤的存储。除此之外，raft 库更重要的是负责与集群中的其他 etcd Server进行交互，实现分布式一致性。

```
发起请求 put foo bar
	→ 客户端通过负载均衡选择etcd节点
	→ etcd Server接收到请求 
	→ gRPC 拦截器拦截 
	→ Quota 模块校验 etcd db 文件大小是否超过了配额 
    → KVServer 模块将请求发送给本模块中的raft，这里负责与 etcd raft模块进行通信
    → 若 客户端提交数据到非 leader 节点时，该节点需要将请求转发到 etcd leader 节点处理
	→ KVServer 模块向raft发起提案，命令为put foo bar，即使用put 方法将 foo 更新为 bar 
	→ raft 保存到 raftLog 的 unstable 对象中 
	
	→ Leader 节点通过 RaftHttp 网络模块转发提案给其他节点
	→ 其他节点收到并回复给Leader
	→ Leader接收到日志日志数据，统计应答数量，超过半数条件就构造 Ready对象，提案状态变为已提交
	→ etcd raft 通过ready对象通知etcd Server 该日志commit
	→ etcd Server 收到后写入日志到 WAL
	→ 正式通知最上层的 etcd Server已提交该日志
	→ etcd Server 调用ApplierV3 模块将日志写入持久化存储
	→ etcd Server 应答客户端该数据写入成功
	→ 在 etcd raft中修改raftLog模块的数据，日志写入storage
```

> 在应答某条日志数据是否已经 commit 时，为什么 etcd raft 模块首先写入到 WAL 模块中？
>
> 这是因为该过程仅仅添加一条日志，一方面开销小，速度会很快；另一方面，如果在后面 applierV3 写入失败，etcd 服务端在重启的时候也可以根据 WAL 模块中的日志数据进行恢复。etcd Server 从 raft 模块获取已提交的日志条目，由 applierV3 模块通过 MVCC 模块执行提案内容，更新状态机。
> 整个过程中，etcd raft 模块中的 raftLog 数据在内存中存储，在服务重启后失效；客户端请求的数据则被持久化保存到 WAL 和 applierV3 中，不会在重启之后丢失。

### 读操作核心

将整个读操作划分成如下几个步骤：

- etcdctl 会创建一个 clientv3 库对象，选取一个合适的 etcd 节点；

- 调用 KVServer 模块的 Range RPC 方法（上一课时有讲解），发送请求；

- 拦截器拦截，主要做一些校验和监控；

- 调用 KVServer 模块的 Range 接口获取数据；

接着就进入了读请求的核心步骤，会经过**线性读 ReadIndex 模块、MVCC（包含 treeIndex 和 BlotDB）模块**。

线性读是相对串行读来讲的概念。集群模式下会有多个 etcd 节点，不同节点之间可能存在一致性问题，串行读直接返回状态数据，不需要与集群中其他节点交互。这种方式速度快，开销小，但是会存在数据不一致的情况。

线性读则需要集群成员之间达成共识，存在开销，响应速度相对慢。但是能够保证数据的一致性，etcd 默认读模式是线性读。
继续往下，看看如何读取 etcd 中的数据。etcd 中查询请求，**查询单个键或者一组键，以及查询数量，到了底层实际都会调用 Range keys 方法**

![](https://s0.lgstatic.com/i/image6/M01/07/57/Cgp9HWAzZP6AeJMpAAA5nlj8jwI348.png)

- 在 **treeIndex** 中根据键利用 **BTree** 快速查询该键对应的索引项 keyIndex，索引项中包含 Revision；
- 根据查询到的版本号信息 Revision，在 Backend 的**缓存 Buffer** 中利用**二分法**查找，如果命中则直接返回；
- 若缓存中不符合条件，在 BlotDB 中查找（基于 **BlotDB** 的索引，底层是**B+Tree**），查询之后返回键值对信息
- 图中 ReadTx 和 BatchTx 是两个接口，用于读写请求。在创建 Backend 结构体时，默认也会创建 readTx 和 batchTx，readTx 实现了 ReadTx ，负责处理只读请求；batchTx 实现了 BatchTx 接口，负责处理读写请求。

```go
// 位于 mvcc/kvstore_txn.go:117
func (tr *storeTxnRead) rangeKeys(key, end []byte, curRev int64, ro RangeOptions) (*RangeResult, error) {
	rev := ro.Rev
	if rev > curRev {
		return &RangeResult{KVs: nil, Count: -1, Rev: curRev}, ErrFutureRev
	}
	if rev <= 0 {
		rev = curRev
	}
	if rev < tr.s.compactMainRev {
		return &RangeResult{KVs: nil, Count: -1, Rev: 0}, ErrCompacted
	}
  // 获取索引项 keyIndex，索引项中包含 Revision
	revpairs := tr.s.kvindex.Revisions(key, end, rev)
	tr.trace.Step("range keys from in-memory index tree")
  // 结果为空，直接返回
	if len(revpairs) == 0 {
		return &RangeResult{KVs: nil, Count: 0, Rev: curRev}, nil
	}
	if ro.Count {
		return &RangeResult{KVs: nil, Count: len(revpairs), Rev: curRev}, nil
	}
	limit := int(ro.Limit)
	if limit <= 0 || limit > len(revpairs) {
		limit = len(revpairs)
	}
	kvs := make([]mvccpb.KeyValue, limit)
	revBytes := newRevBytes()
	for i, revpair := range revpairs[:len(kvs)] {
		revToBytes(revpair, revBytes)
    // UnsafeRange 实现了 ReadTx，查询对应的键值对
		_, vs := tr.tx.UnsafeRange(keyBucketName, revBytes, nil, 0)
		if len(vs) != 1 {
			tr.s.lg.Fatal(
				"range failed to find revision pair",
				zap.Int64("revision-main", revpair.main),
				zap.Int64("revision-sub", revpair.sub),
			)
		}
		if err := kvs[i].Unmarshal(vs[0]); err != nil {
			tr.s.lg.Fatal(
				"failed to unmarshal mvccpb.KeyValue",
				zap.Error(err),
			)
		}
	}
	tr.trace.Step("range keys from bolt db")
	return &RangeResult{KVs: kvs, Count: len(revpairs), Rev: curRev}, nil
}
```

在上述代码的实现中，我们需要通过Revisions方法从 Btree 中获取范围内所有的 keyIndex，以此才能获取一个范围内的所有键值对。Revisions方法实现如下：

```go
// 位于 mvcc/index.go:106
func (ti *treeIndex) Revisions(key, end []byte, atRev int64) (revs []revision) {
	if end == nil {
		rev, _, _, err := ti.Get(key, atRev)
		if err != nil {
			return nil
		}
		return []revision{rev}
	}
	ti.visit(key, end, func(ki *keyIndex) {
    // 使用 keyIndex.get 来遍历整棵树
		if rev, _, _, err := ki.get(ti.lg, atRev); err == nil {
			revs = append(revs, rev)
		}
	})
	return revs
}
```

如果只获取一个键对应的版本，使用 treeIndex 方法即可，但是一般会从 Btree 索引中获取多个 Revision 值，此时需要调用 keyIndex.get 方法来遍历整棵树并选取合适的版本。这是因为BoltDB 保存一个 key 的多个历史版本，每一个 key 的 keyIndex 中其实都存储着多个历史版本，我们需要根据传入的参数返回正确的版本。
对于上层的键值存储来说，它会利用这里返回的 Revision，从真正存储数据的 BoltDB 中查询当前 key 对应 Revision 的数据。BoltDB 内部使用的也是类似 bucket（桶）的方式存储，其实就是对应 MySQL 中的表结构，用户的 key 数据存放的 bucket 名字的是 key，etcd MVCC 元数据存放的 bucket 是 meta。

### 写操作核心

将整个写操作划分成如下几个步骤：

- 客户端通过负载均衡算法选择一个 etcd 节点，发起 gRPC 调用；

- etcd Server 收到客户端请求；

- 经过 gRPC 拦截、Quota 校验，Quota 模块用于校验 etcd db 文件大小是否超过了配额；

- 接着 KVServer 模块将请求发送给本模块中的 raft，这里负责与 etcd raft 模块进行通信，发起一个提案，命令为put foo bar，即使用 put 方法将 foo 更新为 bar；

- 提案经过转发之后，半数节点成功持久化；

- MVCC 模块更新状态机。


 put 接口的执行过程：

![](https://s0.lgstatic.com/i/image6/M01/07/58/Cgp9HWAzZT2AXZHsAABJ2oP8TZY732.png)

调用 put 向 etcd 写入数据时，首先会使用传入的键构建 keyIndex 结构体，基于 currentRevision 自增生成新的 Revision 如{1,0}，并从 treeIndex 中获取相关版本 Revision 等信息；写事务提交之后，将本次写操作的缓存 buffer 合并（merge）到读缓存上（图中 ReadTx 中的缓存）。代码实现如下所示：

```go
//位于 mvcc/index.go:53
func (ti *treeIndex) Put(key []byte, rev revision) {
	keyi := &keyIndex{key: key}
  // 加锁，互斥
	ti.Lock()
	defer ti.Unlock()
  // 获取版本信息
	item := ti.tree.Get(keyi)
	if item == nil {
		keyi.put(ti.lg, rev.main, rev.sub)
		ti.tree.ReplaceOrInsert(keyi)
		return
	}
	okeyi := item.(*keyIndex)
	okeyi.put(ti.lg, rev.main, rev.sub)
}
```

treeIndex.Put 在获取 Btree 中的 keyIndex 结构之后，会通过 keyIndex.put 在其中加入新的 revision，方法实现如下

```go
// 位于 mvcc/key_index.go:77
func (ki *keyIndex) put(lg *zap.Logger, main int64, sub int64) {
	rev := revision{main: main, sub: sub}
  // 校验版本号
	if !rev.GreaterThan(ki.modified) {
		lg.Panic(
			"'put' with an unexpected smaller revision",
			zap.Int64("given-revision-main", rev.main),
			zap.Int64("given-revision-sub", rev.sub),
			zap.Int64("modified-revision-main", ki.modified.main),
			zap.Int64("modified-revision-sub", ki.modified.sub),
		)
	}
	if len(ki.generations) == 0 {
		ki.generations = append(ki.generations, generation{})
	}
	g := &ki.generations[len(ki.generations)-1]
	if len(g.revs) == 0 { // 创建一个新的键
		keysGauge.Inc()
		g.created = rev
	}
	g.revs = append(g.revs, rev)
	g.ver++
	ki.modified = rev
}
```

从上述代码我们可以知道，构造的 Revision 结构体写入 keyIndex 键索引时，会改变 generation 结构体中的属性，generation 中包括一个键的多个不同的版本信息，包括创建版本、修改次数等参数。因此我们可以通过该方法了解 generation 结构体中的各个成员如何定义和赋值。
revision{1,0} 是生成的全局版本号，作为 BoltDB 的 key，经过序列化包括 key 名称、key 创建时的版本号（create_revision）、value 值和租约等信息为二进制数据之后，将填充到 BoltDB 的 value 中，同时将该键和 Revision 等信息存储到 Btree。

### 数据一致性

**在分布式环境中，常用数据复制来避免单点故障**，实现多副本，提高服务的**高可用**性以及系统的吞吐量。

etcd 集群中的多个节点不可避免地会出现相互之间数据不一致的情况。但**不管是同步复制、异步复制还是半同步复制，都会存在可用性或者一致性的问题**。

我们一般会使用**共识算法**来解决多个节点数据一致性的问题，常见的共识算法有 Paxos和Raft。ZooKeeper 使用的是 ZAB 协议，etcd 使用的共识算法就是Raft。etcd-raft 模块是 etcd中解决分布式一致性的模块





**etcd raft对外接口**

raft 库对外提供了一个 Node 接口，由 raft/node.go 中的 node结构体实现，Node 接口需要实现的函数包括：Tick、Propose、Ready、Step 等。
我们重点需要了解 Ready 接口，该接口将返回类型为 Ready 的 channel，该通道表示当前时间点的channel。应用层需要关注该 channel，当发生变更时，其中的数据也将会进行相应的操作。其他的函数对应的功能如下：

- Tick：时钟，触发选举或者发送心跳；

- Propose：通过 channel 向 raft StateMachine 提交一个 Op，提交的是本地 MsgProp 类型的消息；

- Step：节点收到 Peer 节点发送的 Msg 时会通过该接口提交给 raft 状态机，Step 接口通过 recvc channel向raft StateMachine 传递 Msg；


然后是 raft 算法的实现，node 结构体实现了 Node 接口，其定义如下：

```go
type node struct {
    propc      chan msgWithResult
    recvc      chan pb.Message
    confc      chan pb.ConfChangeV2
    confstatec chan pb.ConfState
    readyc     chan Ready
    advancec   chan struct{}
    tickc chan struct{}
    done       chan struct{}
    stop       chan struct{}
    status     chan chan Status
    rn *RawNode
}
```

在 raft/raft.go 中还有两个核心数据结构：

- Config，封装了与 raft 算法相关的配置参数，公开用于外部调用。

- raft，具体实现 raft 算法的结构体。





**节点状态转换**

raft StateMachine 的状态机转换，实际上就是 raft 算法中各种角色的转换。每个 raft 节点，可能具有以下三种状态中的一种。

- Candidate：候选人状态，该状态意味着将进行一次新的选举。

- Follower：跟随者状态，该状态意味着选举结束。

- Leader：领导者状态，选举出来的节点，所有数据提交都必须先提交到 Leader 上。


每一个状态都有其对应的状态机，每次收到一条提交的数据时，都会根据其不同的状态将消息输入到不同状态的状态机中。同时，在进行 tick 操作时，每种状态对应的处理函数也是不一样的。
因此 raft 结构体中将不同的状态及其不同的处理函数，独立出来几个成员变量：

- state，保存当前节点状态；

- tick 函数，每个状态对应的 tick 函数不同；

- step，状态机函数，同样每个状态对应的状态机也不相同。

raft 状态转换的接口都在 raft.go 中，其定义如下：

```go
func (r *raft) becomeFollower(term uint64, lead uint64)
func (r *raft) becomePreCandidate()
func (r *raft) becomeCandidate()
func (r *raft) becomeLeader()
```

raft 在不同的状态下，etcd 将 raft 相关的所有处理都抽象为了 Msg，通过 Step 接口处理，来驱动 raft StateMachine 状态机运转的

```go
func (r *raft) Step(m pb.Message) error {``
	r.step(r, m)
}
```

这里的step是一个回调函数，根据不同的状态会设置不同的回调函数来驱动 raft，这个回调函数 stepFunc 就是在becomeXX()函数完成的设置：

```go
type raft struct {
    ...
	step stepFunc
}
```

step 回调函数有如下几个值，注意其中 stepCandidate 会处理 PreCandidate 和 Candidate 两种状态，这几个函数的实现其实就是对各种 Msg 进行处理

```go
func stepFollower(r *raft, m pb.Message) error
func stepCandidate(r *raft, m pb.Message) error
func stepLeader(r *raft, m pb.Message) error
```





**raft消息**

raft 算法本质上是一个大的状态机，任何的操作例如选举、提交数据等，最后都被封装成一个消息结构体，输入到 raft 算法库的状态机中。
在 raft/raftpb/raft.proto 文件中，定义了 raft 算法中传输消息的结构体。raft 算法其实由好几个协议组成，etcd-raft 将其统一定义在了 Message 结构体之中，以下总结了该结构体的成员用途：

```go
// 位于 raft/raftpb/raft.pb.go:295
type Message struct {
    Type       MessageType `protobuf:"varint,1,opt,name=type,enum=raftpb.MessageType" json:"type"` // 消息类型
    To         uint64      `protobuf:"varint,2,opt,name=to" json:"to"` // 消息接收者的节点ID
    From       uint64      `protobuf:"varint,3,opt,name=from" json:"from"` // 消息发送者的节点 ID
    Term       uint64      `protobuf:"varint,4,opt,name=term" json:"term"` // 任期 ID
    LogTerm    uint64      `protobuf:"varint,5,opt,name=logTerm" json:"logTerm"` // 日志所处的任期 ID
    Index      uint64      `protobuf:"varint,6,opt,name=index" json:"index"` // 日志索引 ID，用于节点向 Leader 汇报自己已经commit的日志数据 ID
    Entries    []Entry     `protobuf:"bytes,7,rep,name=entries" json:"entries"` // 日志条目数组
    Commit     uint64      `protobuf:"varint,8,opt,name=commit" json:"commit"` // 提交日志索引
    Snapshot   Snapshot    `protobuf:"bytes,9,opt,name=snapshot" json:"snapshot"` // 快照数据
    Reject     bool        `protobuf:"varint,10,opt,name=reject" json:"reject"` // 是否拒绝
    RejectHint uint64      `protobuf:"varint,11,opt,name=rejectHint" json:"rejectHint"` // 拒绝同步日志请求时返回的当前节点日志 ID，用于被拒绝方快速定位到下一次合适的同步日志位置
    Context    []byte      `protobuf:"bytes,12,opt,name=context" json:"context,omitempty"` // 上下文数据
    XXX_unrecognized []byte      `json:"-"`
}
```

Message结构体相关的数据类型为 MessageType，MessageType 有 19 种。我将其中常用的协议（即不同的消息类型）的用途总结成如下的表格：

![](https://s0.lgstatic.com/i/image6/M01/0F/10/Cgp9HWA9EJ2ABd9rAAO37xDchBs024.png)





**选举**

发起选举对节点的状态有限制，很显然只有在Candidate 或者 Follower 状态下的节点才有可能发起一个选举流程，而这两种状态的节点，其对应的tick 函数为 raft.tickElection 函数，用来发起选举和选举超时控制。发起选举的流程如下。

- 节点启动时都以Follower 启动，同时随机生成自己的选举超时时间。是为了避免有两个节点同时进行选举

- 在Follower的tickElection 函数中，当选举超时，节点向自己发送 MsgHup 消息。

- 在状态机函数 raft.Step函数中，收到 MsgHup 消息之后，节点首先判断当前有没有 apply 的配置变更消息，如果有就忽略该消息。即，当有配置更新的情况下不能进行选举操作，即要保证每一次集群成员变化时只能变化一个，不能多个集群成员的状态同时发生变化。

- 否则进入 campaign 函数中进行选举：首先将任期号增加 1，然后广播给其他节点选举消息，带上的其他字段，包括：节点当前的最后一条日志索引（Index 字段）、最后一条日志对应的任期号（LogTerm 字段）、选举任期号（Term 字段，即前面已经进行 +1 之后的任期号）、Context 字段（目的是告知这一次是否是 Leader 转让类需要强制进行选举的消息）。

- 如果在一个选举超时期间内，发起新的选举流程的节点，得到了超过半数的节点投票，那么状态就切换到 Leader 状态。成为 Leader的同时，Leader 将发送一条 dummy 的 append 消息，目的是提交该节点上在此任期之前的值。

当收到任期号大于当前节点任期号的消息，且该消息类型如果是选举类的消息（类型为 prevote 或者 vote）时，节点会做出以下判断。

- 首先判断该**消息是否为强制要求进行选举的类型**（context 为 campaignTransfer，表示进行 Leader转让）。

- 判断当前**是否在租约期内**，满足的条件包括：checkQuorum 为 true、当前节点保存的 Leader 不为空、没有到选举超时。

- 如果不是强制要求选举，且在租约期内，就忽略该选举消息，这样做是为了避免出现那些分裂集群的节点，频繁发起新的选举请求。

- 如果不是忽略选举消息的情况，除非是 prevote 类的选举消息，否则在收到其他消息的情况下，该节点都切换为 Follower 状态。

- 此时需要针对投票类型中带来的其他字段进行处理，同时满足**日志新旧的判断**和参与选举的条件。


只有在同时满足以上两个条件的情况下，才能同意该节点的选举，否则都会被拒绝。这种做法可以保证最后选出来的新 Leader 节点，其日志都是最新的





**日志复制**

![](https://s0.lgstatic.com/i/image6/M01/0F/0D/CioPOWA9ELSAZR1_AACDc7CHoj4319.png)

- 收到客户端请求之后，etcd Server 的 KVServer 模块会向 raft 模块提交一个类型为 MsgProp 的提案消息。

- Leader节点在本地添加一条日志，其对应的命令为put foo bar。此步骤只是添加一条日志，并没有提交，两个索引值还指向上一条日志。

- Leader 节点向集群中其他节点广播 AppendEntries 消息，带上 put 命令。

- committedIndex 存储最后一条提交日志的索引，而 appliedIndex 存储的是最后一条应用到状态机中的日志索引值。两个数值满足committedIndex 大于等于 appliedIndex，这是因为一条日志只有被提交了才能应用到状态机中

  ![](https://s0.lgstatic.com/i/image6/M00/0F/0E/CioPOWA9ENOAQLFKAAB3Zn9Qj4Q619.png)

- Follower 节点收到 AppendEntries 请求后，与 Leader 节点一样，在本地添加一条新的日志，此时日志也没有提交

- 添加成功日志后，Follower 节点向 Leader 节点应答 AppendEntries 消息。

- Leader 节点汇总 Follower 节点的应答。当Leader 节点收到半数以上节点的 AppendEntries 请求的应答消息时，表明 put foo bar 命令成功复制，可以进行日志提交。

- Leader 修改本地 committed 日志的索引，指向最新的存储put foo bar的日志，因为还没有应用该命令到状态机中，所以 appliedIndex 还是保持着上一次的值。

- 当这个命令提交完成之后，命令就可以提交给应用层了。

- 此时修改 appliedIndex的值，与 committedIndex 的值相等。

- Leader 节点在后续发送给 Follower 的 AppendEntries 请求中，总会带上最新的 committedIndex 索引值。

- Follower 收到AppendEntries 后会修改本地日志的 committedIndex 索引。

### MVCC

MVCC（Multi-Version Concurrency Control），即多版本并发控制，它是一种并发控制的方法，可以实现对数据库的并发访问。
数据库并发场景有三种，分别为读-读、读-写和写-写。第一种读-读没有问题，不需要并发控制；读-写和写-写都存在线程安全问题。读-写可能遇到脏读、幻读、不可重复读的问题；写-写可能会存在更新丢失问题。
并发控制机制用作对并发操作进行正确调度，保证事务的隔离性、数据库的一致性。可能你对并发控制并不陌生，它的主要技术包括悲观锁和乐观锁等。我们简单看一下这两种技术：

- 悲观锁是一种排它锁，事务在操作数据时把这部分数据锁定，直到操作完毕后再解锁，这种方式容易造成系统吞吐量和性能方面的损失；

- 乐观锁在提交操作时检查是否违反数据完整性，大多数基于版本（Version）机制实现，MVCC 就是一种乐观锁。

而在 MySQL 中，快照读实现了 MVCC 的非阻塞读功能。其为事务分配单向增长的时间戳，每次修改保存一个版本，版本与事务时间戳关联，读操作只读该事务开始前的数据库的快照。MVCC 在数据库中的实现主要是为了提高数据库并发性能，用更好的方式去处理读写冲突，做到即使有读写冲突时，也不用加锁，实现非阻塞并发读。同时还可以解决脏读、幻读、不可重复读等事务隔离问题，但它也存在一个缺点，就是**不能解决更新丢失问题**。



etcd中的MVCC

MVCC 模块主要由 **BoltDB** 和 **treeIndex** 两部分组成。

- MVCC 底层基于 **Backend 模块**实现键值对存储，Backend 在设计上支持多种存储的实现，目前的具体实现为 BoltDB，
- **BoltDB 是一个基于 B+ 树的 KV 存储数据库**；
- **treeIndex 模块基于内存版 BTree 实现键的索引管理**，它是基于 Google 开源项目 Btree 实现的一个索引模块，保存了每一个 key 与对应的版本号（Revision）的映射关系等信息。
- 与其他的 KV 存储组件使用存放数据的键作为 key 不同，etcd 存储以数据的 Revision 作为 key，键值、创建时的版本号、最后修改的版本号等作为 value 保存到数据库。etcd 对于每一个键值对都维护了一个全局的 Revision 版本号，键值对的每一次变化都会被记录。获取某一个 key 对应的值时，需要先获取该 key 对应的 Revision，再通过它找到对应的值。
  etcd 管理和存储一个 key 的多个版本与 treeIndex 模块中的结构体定义有关，下面我们具体来看。
  我们通过下面这样的一个操作过程，来理解 etcd MVCC 产生的作用：





**写过程**

![](https://s0.lgstatic.com/i/image6/M01/12/58/Cgp9HWBAvdGAUB34AAJwukqHZTo156.png)



上图为写请求的过程，写请求在底层统一调用 put 方法。treeIndex 中根据查询的 key 从 B-tree 查找得到的是一个 keyIndex 对象，里面包含了 Revision 等全局版本号信息。

```go
// 位于 mvcc/key_index.go:70
type keyIndex struct {
	key         []byte  // key 名称
	modified    revision // 最后一次修改的 etcd 版本号
	generations []generation // 保存了 key 多次修改的版本号信息
}

// 位于 mvcc/key_index.go:335
type generation struct {
	ver     int64		// 当前 generation 包含的修改次数
	created revision 	// generation 创建时的版本
	revs    []revision	// 存储所有的版本信息
}

// 位于 mvcc/revision.go:26
type revision struct {
	main int64		// 事务发生时自动生成的主版本号,全局递增,发生 put、txn、del 操作会递增,一个事务内唯一
	sub int64		// 事务内的子版本号,从 0 开始递增。
}
```



![](https://s0.lgstatic.com/i/image6/M00/12/55/CioPOWBAva-AC-L1AANi-MAgn_0530.png)

如，操作对应的版本号 revision ```{3,0}```，对应写入 BoltDB 的 key。写入的 value 对应 mvccpb.KeyValue 结构体，其由 key、value、create_revision、mod_revision、version、lease 等字段组成，定义如下所示：

```go
type KeyValue struct {
	// 键
	Key []byte `protobuf:"bytes,1,opt,name=key,proto3" json:"key,omitempty"`
	// 创建时的版本号
	CreateRevision int64 `protobuf:"varint,2,opt,name=create_revision,json=createRevision,proto3" json:"create_revision,omitempty"`
	// 最后一次修改的版本号
	ModRevision int64 `protobuf:"varint,3,opt,name=mod_revision,json=modRevision,proto3" json:"mod_revision,omitempty"`
	// 表示 key 的修改次数，删除 key 会重置为 0，key 的更新会导致 version 增加
	Version int64 `protobuf:"varint,4,opt,name=version,proto3" json:"version,omitempty"`
	// 值
	Value []byte `protobuf:"bytes,5,opt,name=value,proto3" json:"value,omitempty"`
	// 键值对绑定的租约 LeaseId，0 表示未绑定
	Lease int64 `protobuf:"varint,6,opt,name=lease,proto3" json:"lease,omitempty"`
}
```

构造好 key 和 value 之后，就可以写入 BoltDB 了。并同步更新 buffer。

| key   | value                                                        |
| ----- | ------------------------------------------------------------ |
| `{3,0}` | `{“key”:“base64编码后的值”,“create_revision”:3,“mod_revision”:3,“version”:1,“value”:“base64编码后的值”}` |

此外还需将本次修改的版本号与用户 key 的映射关系保存到 treeIndex 模块中，key hello 的 keyIndex。对照着上面介绍的 keyIndex、generation 和 Revision 结构体的定义，写入的 keyIndex 记录如下所示

```protobuf
key:     "hello"
modified: <3,0>
generations: [{ver:1,created:<3,0>,revs: [<3,0>]} ]
```

- modified 为最后一次修改的 etcd 版本号，这里是 <3,0>。
- generations 数组有一个元素，首次创建 ver 为 1，created 创建时的版本为 <3,0>，revs 数组中也只有一个元素，存储了所有的版本信息。

至此，put 事务基本结束，还差最后一步——写入的**数据持久化**到磁盘。数据持久化的操作由 Backend 的**协程**来完成，以此提高写的性能和吞吐量。协程通过事务批量提交，将 BoltDB 内存中的数据持久化存储磁盘中。

键值对的**删除**与更新一样，键值对的删除也是异步完成，每当一个 key 被删除时都会调用 tombstone 方法向当前的 generation 中**追加一个空的 generation 对象**，其实现如下所示：

```go
// 位于 mvcc/key_index.go:119
func (ki *keyIndex) tombstone(lg *zap.Logger, main int64, sub int64) error {
	if ki.isEmpty() {
		lg.Panic(
			"'tombstone' got an unexpected empty keyIndex",
			zap.String("key", string(ki.key)),
		)
	}
	if ki.generations[len(ki.generations)-1].isEmpty() {
		return ErrRevisionNotFound
	}
	ki.put(lg, main, sub)
	ki.generations = append(ki.generations, generation{})
	keysGauge.Dec()
	return nil
}
```

这个空的 generation 标识说明当前的 key 已经被删除了。除此之外，生成的 BoltDB **key 版本号中追加了 t（tombstone），如 <3,0,t>**，**用于标识删除**，而对应的 value 变成了只含 key 属性。
当查询键值对时，treeIndex 模块查找到 key 对应的 keyIndex，若查询的版本号大于等于被删除时的版本号，则会返回空。而**真正删除 treeIndex 中的索引对象以及 BoltDB 中的键值对，则由compactor 组件完成。**





**读过程**

读请求在底层统一调用的是 Range 方法，首先 treeIndex 根据查询的 key 从 BTree 查找对应 keyIndex 对象。从 keyIndex 结构体的定义可知，每一个 keyIndex 结构体中都包含当前键的值以及最后一次修改对应的 Revision 信息，其中还保存了一个 key 的多个 generation，每一个 generation 都会存储当前 key 的所有历史版本。


```go
// treeIndex 模块中提供了 Get 接口获取一个 key 对应 Revision 值：
// 位于 mvcc/index.go:68
func (ti *treeIndex) Get(key []byte, atRev int64) (modified, created revision, ver int64, err error) {
	keyi := &keyIndex{key: key}
	if keyi = ti.keyIndex(keyi); keyi == nil {
		return revision{}, revision{}, 0, ErrRevisionNotFound
	}
	return keyi.get(ti.lg, atRev)
}

// 从 treeIndex 成员 BTree 中查找 keyIndex,将结果转换成 keyIndex 类型后返回
// 位于 mvcc/index.go:78
func (ti *treeIndex) keyIndex(keyi *keyIndex) *keyIndex {
	if item := ti.tree.Get(keyi); item != nil {
		return item.(*keyIndex)
	}
	return nil
}

// 位于 mvcc/key_index.go:137
func (ki *keyIndex) get(lg *zap.Logger, atRev int64) (modified, created revision, ver int64, err error) {
	if ki.isEmpty() {
		lg.Panic(
			"'get' got an unexpected empty keyIndex",
			zap.String("key", string(ki.key)),
		)
	}
	g := ki.findGeneration(atRev)
	if g.isEmpty() {
		return revision{}, revision{}, 0, ErrRevisionNotFound
	}
    // 遍历 generations 数组来获取 generation，匹配到有效的 generation 后，返回 generation 的 revisions 数组中最后一个版本号，即 <3,0> 给读事务。
	n := g.walk(func(rev revision) bool { return rev.main > atRev })
	if n != -1 {
		return g.revs[n], g.created, g.ver - int64(len(g.revs)-n-1), nil
	}
	return revision{}, revision{}, 0, ErrRevisionNotFound
}
```


获取到 Revision 信息之后，读事务接口优先从 buffer 中查询，如果命中则直接返回，否则根据 revision <3,0> 作为 key 在 BoltDB 中查询。

在查询时如果没有指定版本号，默认读取最新的数据。

如果指定了版本号，在 treeIndex 模块获取 key 对应的 keyIndex 时，指定了读版本号为 3 的快照数据。keyIndex 会遍历 generation 内的历史版本号，返回小于等于 3 的最大历史版本号作为 BoltDB 的 key，从中查询对应的 value。
需要注意的是，并发读写事务不会阻塞在一个 buffer 资源锁上。并发读创建事务时，会全量拷贝当前未提交的 buffer 数据，以此实现并发读。

### 分布式事务

事务通常是指数据库事务。事务具有 ACID 特性，即原子性、一致性、隔离性和持久性。

- 原子性（Atomicity）：事务作为一个整体被执行，其包含的对数据库的操作要么全部被执行，要么都不执行。

- 一致性（Consistency）：事务应确保数据库的状态从一个一致状态转变为另一个一致状态。一致状态的含义是数据库中的数据应满足完整性约束。 

- 隔离性（Isolation）：多个事务并发执行时，一个事务的执行不应影响其他事务的执行。 

- 持久性（Durability）：一个事务一旦提交，它对数据库的修改应该永久保存在数据库中。

常见的关系型数据库如 **MySQL** ，其 InnoDB 事务的实现基于**锁**实现数据库事务。事务操作执行时，需要获取对应数据库记录的锁，才能进行操作；如果发生冲突，事务会阻塞，甚至会出现死锁。在整个事务执行的过程中，客户端与 MySQL 多次交互，MySQL 为客户端维护事务所需的资源，直至事务提交。

而 **etcd** 中的事务实现则是基于**CAS**（Compare and Swap，即比较并交换） 方式。etcd 使用了不到四百行的代码实现了迷你事务，其对应的语法为**If-Then-Else**。

etcd 允许用户在一次修改中批量执行多个操作，即这一组操作被绑定成一个原子操作，并共享同一个修订号。其写法类似 CAS，如下所示：

```go
Txn().If(cond1, cond2, ...).Then(op1, op2, ...,).Else(op1, op2)
```

根据上面的实现，其实很好理解事务实现的逻辑。如果 If 冲突判断语句为真，对应返回值为 true，Then 中的语句将会被执行，否则执行 Else 中的逻辑。

在 etcd 事务执行过程中，客户端与 etcd 服务端之间没有维护事务会话。冲突判断及其执行过程作为一个原子过程来执行，因此 etcd 事务不会发生阻塞，无论事务执行成功还是失败都会返回。当发生冲突导致执行失败时，需要应用进行重试，业务代码需要考虑这部分的重试逻辑。





**CAS**

etcd 的事务基于乐观锁检测冲突并重试，检测冲突时使用了ModRevision进行校验，该字段表示某个 key 上一次被更改时，全局的版本是多少

```go
func txnTransfer(etcd *v3.Client, sender, receiver string, amount uint) error {
	// 失败重试
	for {
		if ok, err := doTxn(etcd, sender, receiver, amount); err != nil {
			return err
		} else if ok {
			return nil
		}
	}
}
func doTxn(etcd *v3.Client, sender, receiver string, amount uint) (bool, error) {
	// 第一个事务，利用事务的原子性，同时获取发送和接收者的余额以及 ModRevision
	getresp, err := etcd.Txn(context.TODO()).Then(v3.OpGet(sender), v3.OpGet(receiver)).Commit()
	if err != nil {
		return false, err
	}
	senderKV := getresp.Responses[0].GetResponseRange().Kvs[0]
	receiverKV := getresp.Responses[1].GetResponseRange().Kvs[1]
	senderNum, receiverNum := toUInt64(senderKV.Value), toUInt64(receiverKV.Value)
	// 验证账户余额是否充足
	if senderNum < amount {
		return false, fmt.Errorf("资金不足")
	}
	// 发起转账事务，冲突判断 ModRevision 是否发生变化
	txn := etcd.Txn(context.TODO()).If(
		v3.Compare(v3.ModRevision(sender), "=", senderKV.ModRevision),
		v3.Compare(v3.ModRevision(receiver), "=", receiverKV.ModRevision))
	txn = txn.Then(
		v3.OpPut(sender, fromUint64(senderNum-amount)), // 更新发送者账户余额
		v3.OpPut(receiver, fromUint64(receiverNum-amount))) // 更新接收者账户余额
    resp, err := txn.Commit()         // 提交事务
	if err != nil {
		return false, err
	}
	return resp.Succeeded, nil
}
```

etcd 事务的实现基于乐观锁，涉及两次事务操作，第一次事务利用原子性同时获取发送方和接收方的当前账户金额。第二次事务发起转账操作，冲突检测 ModRevision 是否发生变化，如果没有变化则正常提交事务；若发生了冲突，则需要进行重试。
上述过程的实现较为烦琐，除了业务逻辑，还有大量的代码用来判断冲突以及重试。因此，etcd 社区基于事务特性，实现了一个简单的事务框架 STM， 构建了多种事务隔离级别，下面我们看看如何基于 STM 框架实现 etcd 事务。





**STM**

为了简化 etcd 事务实现的过程，etcd clientv3 提供了 STM（Software Transactional Memory，软件事务内存），帮助我们自动处理这些烦琐的过程。我们只需要关注转账逻辑的实现即可，事务相关的其他操作由 STM 完成，使用 STM 优化之后的转账业务代码如下：

```go
func txnStmTransfer(cli *v3.Client, from, to string, amount uint) error {
	// NewSTM 创建了一个原子事务的上下文，业务代码作为一个函数传进去
	_, err := concurrency.NewSTM(cli, func(stm concurrency.STM) error {
		// stm.Get 封装了事务的读操作
		senderNum := toUint64(stm.Get(from))
		receiverNum := toUint64(stm.Get(to))
		if senderNum < amount {
			return fmt.Errorf("余额不足")
		}
		// 事务的写操作
		stm.Put(to, fromUint64(receiverNum + amount))
		stm.Put(from, fromUint64(senderNum - amount))
		return nil
	})
	return err
}
```





concurrency.**STM** 是软件事务存储的**接口**，提供了对某个 key 的 CURD 操作，STM 的接口有两个**实现类：stm 和 stmSerializable**。具体选择哪一个，由我们指定的**隔离级别**决定

```go
// 位于 clientv3/concurrency/stm.go:25
type STM interface {
	// Get 返回键的值，并将该键插入 txn 的 read set 中。如果 Get 失败，它将以错误中止事务，没有返回
	Get(key ...string) string
	// Put 在 write set 中增加键值对
	Put(key, val string, opts ...v3.OpOption)
	// Rev 返回 read set 中某个键指定的版本号
	Rev(key string) int64
	// Del 删除某个键
	Del(key string)
	// commit 尝试提交事务到 etcd server
	commit() *v3.TxnResponse
	reset()
}
```


STM 对象在**内部构造 txn 事务**，**业务函数转换成If-Then**，自动提交事务以及处理失败重试等工作，直到事务执行成功。核心的NewSTM函数的实现如下所示：

```go
// 位于 clientv3/concurrency/stm.go:89
func NewSTM(c *v3.Client, apply func(STM) error, so ...stmOption) (*v3.TxnResponse, error) {
   opts := &stmOptions{ctx: c.Ctx()}
   for _, f := range so {
      f(opts)
   }
   if len(opts.prefetch) != 0 {
      f := apply
      apply = func(s STM) error {
         // 首先判断该事务是否存在预取的键值对，如果存在，会无条件地直接 apply 函数
         s.Get(opts.prefetch...)	
         return f(s)
      }
   }
   // 否则会创建一个 stm，并运行 stm 事务
   return runSTM(mkSTM(c, opts), apply)
}

// 位于 clientv3/concurrency/stm.go:140
func runSTM(s STM, apply func(STM) error) (*v3.TxnResponse, error) {
	outc := make(chan stmResponse, 1)
	go func() {
		defer func() {
			if r := recover(); r != nil {
				e, ok := r.(stmError)
				if !ok {
					// 执行异常
					panic(r)
				}
				outc <- stmResponse{nil, e.err}
			}
		}()
		var out stmResponse
		for {
            // 重置 stm，清空 STM 的读写缓存
			s.reset()
            // 执行事务操作，apply 函数
			if out.err = apply(s); out.err != nil {
				break
			}
            // 提交事务
			if out.resp = s.commit(); out.resp != nil {
				break
			}
		}
		outc <- out
	}()
	r := <-outc
	return r.resp, r.err
}

// 位于 clientv3/concurrency/stm.go:265
func (s *stm) commit() *v3.TxnResponse {
   // 包含了 etcd 事务语法。If中封装了冲突检测条件，提交事务则是etcd的Txn将wset中的数据写入并提交的过程
   txnresp, err := s.client.Txn(s.ctx).If(s.conflicts()...).Then(s.wset.puts()...).Commit()
   if err != nil {
      panic(stmError{err})
   }
   if txnresp.Succeeded {
      return txnresp
   }
   return nil
}
```



**etcd 事务隔离级别**
数据库一般有以下几种事务隔离级别。

- 未提交读（Read Uncommitted）：能够读取到其他事务中还未提交的数据，这可能会导致脏读的问题。

- 读已提交（Read Committed）：只能读取到已经提交的数据，即别的事务一提交，当前事务就能读取到被修改的数据，这可能导致不可重复读的问题。

- 可重复读（Repeated Read）：一个事务中，同一个读操作在事务的任意时刻都能得到同样的结果，其他事务的提交操作对本事务不会产生影响。

- 串行化（Serializable）：串行化执行事务，即一个事务的执行会阻塞其他事务。该隔离级别通过牺牲并发能力换取数据的安全，属于最高的隔离级别。

etcd 的事务可以看作是一种“**微事务**”，在它之上，可以构建出各种隔离级别的事务。

STM 的事务级别**通过 stmOption 指定**，分别为 SerializableSnapshot、Serializable、RepeatableReads 和 ReadCommitted。

```go
// clientv3/concurrency/stm.go 
func mkSTM(c *v3.Client, opts *stmOptions) STM {
   switch opts.iso {
   // 串行化快照
   case SerializableSnapshot:
      // 调用的是 STM 接口的stmSerializable实现
      s := &stmSerializable{
         stm:      stm{client: c, ctx: opts.ctx},
         prefetch: make(map[string]*v3.GetResponse),
      }
      s.conflicts = func() []v3.Cmp {		// 冲突检测条件
         return append(s.rset.cmps(), s.wset.cmps(s.rset.first()+1)...)
      }
      return s
   // 串行化
   case Serializable:
       // 调用的是 STM 接口的stmSerializable实现
      s := &stmSerializable{
         stm:      stm{client: c, ctx: opts.ctx},
         prefetch: make(map[string]*v3.GetResponse),
      }
      s.conflicts = func() []v3.Cmp { return s.rset.cmps() }	// 冲突检测条件
      return s
   // 可重复读   
   case RepeatableReads:
       // 调用的是 STM 接口的stm实现
      s := &stm{client: c, ctx: opts.ctx, getOpts: []v3.OpOption{v3.WithSerializable()}}
      s.conflicts = func() []v3.Cmp { return s.rset.cmps() }	// 冲突检测条件
      return s
   // 已提交读
   case ReadCommitted:
       // 调用的是 STM 接口的stm实现
      s := &stm{client: c, ctx: opts.ctx, getOpts: []v3.OpOption{v3.WithSerializable()}}
      s.conflicts = func() []v3.Cmp { return nil }		// 冲突检测条件
      return s
   default:
      panic("unsupported stm")
   }
}
```

对于不一样的隔离级别，我们主要关注的就是读操作和提交时的冲突检测条件。而对于写操作，会先写进本地缓存，直到事务提交时才真正写到 etcd 里

*ReadUncommitted未提交读*

etcd 隔离级别与一般的数据库隔离级别的差异是**没有未提交读**的隔离级别，这是因为 etcd 通过 **MVCC 机制实现读写不阻塞，并解决脏读的问题**



*ReadCommitted 已提交读*

```go
// 读操作调用的是 stm 的实现
func (s *stm) Get(keys ...string) string {
   if wv := s.wset.get(keys...); wv != nil {	// 从缓存中读
      return wv.val
   }
   return respToValue(s.fetch(keys...))		// 从etcd中读并缓存到事务
}
```

- 读操作 --- 从 etcd 读取 keys，就像普通的 kv 操作一样。第一次 Get 后，在事务中缓存，后续不再从 etcd 读取

- 冲突检测条件 -- 只需要确保自己读到的是别人已经提交的数据，由于 etcd 的 kv 操作都是原子操作，所以不可能读到未提交的修改

```go
s.conflicts = func() []v3.Cmp { return nil }
```



*RepeatableReads 可重复读*

- 读操作 --- 调用的也是 stm 的实现，读操作与 ReadCommitted 类似，只是用 readSet 缓存已经读过的数据，这样下次再读取相同数据的时候才能得到同样的结果，确保了可重复读 

- 冲突检测条件 --- 在事务提交时，确保事务中 Get 的 keys 没有被改动过。因此使用 readSet 数据的 **ModRevision** 做冲突检测，确保本事务读到的数据都是最新的

```go
s.conflicts = func() []v3.Cmp { return s.rset.cmps() }
```




*Serializable 串行读*

```go
// 读操作调用的实现类为 stmSerializable
func (s *stmSerializable) Get(keys ...string) string {
   if wv := s.wset.get(keys...); wv != nil {
      return wv.val
   }
   // 判断是否第一次读
   firstRead := len(s.rset) == 0
   for _, key := range keys {
      if resp, ok := s.prefetch[key]; ok {
         delete(s.prefetch, key)
         s.rset[key] = resp
      }
   }
   resp := s.stm.fetch(keys...)
   if firstRead {
      // 记录下第一次读的版本作为基准
      s.getOpts = []v3.OpOption{
         v3.WithRev(resp.Header.Revision),
         v3.WithSerializable(),
      }
   }
   return respToValue(resp)
}
```

- 读操作 --- 串行化调用的实现类为 stmSerializable，相当于在事务开始时，对 etcd 做了一个快照，这样它读取到的数据就不会受到其他事务的影响，从而达到事务串行化（Serializable）执行的效果
  - 事务中第一次读操作完成时，保存当前版本号 **Revision**；
  - 后续其他读请求会带上这个版本号，获取指定 Revision 版本的数据。这确保了该事务所有的读操作读到的都是同一时刻的内容

- 冲突检测条件 --- 和可重复读类似，在事务提交时，需要检查事务中 Get 的 keys 是否被改动过，而 etcd 串行化的约束还不够，它缺少了验证事务要修改的 keys 这一步。下面的 SerializableSnapshot 事务增加了这个约束

```go
s.conflicts = func() []v3.Cmp { return s.rset.cmps() }
```



*SerializableSnapshot串行化快照读*

etcd 默认采用这种隔离级别，串行化快照隔离是最严格的隔离级别，可以避免幻影读

- 读操作 --- 与 Serializable 串行化读类似。事务中的第一个 Get 操作发生时，保存服务器返回的当前 Revision；后续对其他 keys 的 Get 操作，指定获取 Revision 版本的 value。

- 冲突检测条件 --- 在事务提交时，检查事务中 Get 的 keys 以及要修改的 keys 是否被改动过

```go
s.conflicts = func() []v3.Cmp {
    return append(s.rset.cmps(), s.wset.cmps(s.rset.first()+1)...)
}
```


SerializableSnapshot 不仅确保了读取过的数据是最新的，同时也确保了要写入的数据同样没有被其他事务更改过，是隔离的最高级别

如果这些语义不能满足你的业务需求，通过扩展 etcd 的官方 Client SDK，写一个新 STM 事务类型即可

**etcd 的 STM 事务是 CAS 重试模式，在发生冲突时会多次重试，这就要保证业务代码是可重试的，因此不同于数据库事务的加锁模式**

### watch原理

etcd 的 MVCC 模块对外提供了两种访问键值对的实现方式，一种是键值存储 kvstore，另一种是 watchableStore，它们都实现了 KV 接口

clientv3 中很简洁地封装了 watch 客户端与服务端交互的细节，基于 watchableStore 即可实现 watch 功能，客户端使用的代码如下：

```go
func testWatch() {
    s := newWatchableStore()
    w := s.NewWatchStream()
    w.Watch(start_key: hello, end_key: nil)
    for {
        consume := <- w.Chan()
    }
}
```

在上述实现中，我们调用了 watchableStore。为了实现 watch 监测，我们创建了一个 watchStream，watchStream 监听的 key 为 hello，之后我们就可以消费w.Chan()返回的 channel。key 为 hello 的任何变化，都会通过这个 channel 发送给客户端。

**watchableStore 负责了注册、管理以及触发 Watcher 的功能**

```go
// 位于 mvcc/watchable_store.go:47
type watchableStore struct {
	*store
	// 同步读写锁
	mu sync.RWMutex
	// 被阻塞在 watch channel 中的 watcherBatch
	victims []watcherBatch
	victimc chan struct{}
	// 未同步的 watchers
	unsynced watcherGroup
	// 已同步的 watchers
	synced watcherGroup
	stopc chan struct{}
	wg    sync.WaitGroup
}
```

- watchableStore 组合了 store 结构体的字段和方法，还有两个 watcherGroup 类型的字段，
  - watcherGroup 管理多个 watcher，并能够根据 key 快速找到监听该 key 的一个或多个 watcher
  - unsynced 表示 watcher 监听的数据还未同步完成。当创建的 watcher 指定的版本号小于 etcd server 最新的版本号时，会将 watcher 保存到 unsynced watcherGroup。
  - synced 表示 watcher 监听的数据都已经同步完毕，在等待新的变更。如果创建的 watcher 未指定版本号或指定的版本号大于当前最新的版本号，它将会保存到 synced watcherGroup 中。

- **watchableStore** 收到了所有 key 的变更后，将这些 key 交给 synced（**watchGroup**）
- synced 使用了 **map 或 ADT**（红黑树），能够快速地从所有 key 中找到监听的 key，将这些 key 发送给对应的 **watcher**
  - 在查找监听 key 对应的事件时，如果只监听一个 key，则对应的存储为map[key]*watcher。这样可以根据 key 快速找到对应的 watcher
  - 如果监听一组范围的 key，如 hello1→hello3 之间的所有 key，这些 key 的数量不固定，比如：key=hello11 也处于监听范围。这种情况就无法再使用 map 了，因此 etcd 用 ADT 结构来存储一个范围内的 key

```go
watch(start_key: foo, end_key: nil)			// 存储为map[key]*watcher
watch(start_key: hello1, end_key: hello3)	// 存储为ADT(红黑树)
```

- watcherGroup 是由一系列范围 watcher 组织起来的 watchers。在找到对应的 watcher 后，调用 watcher 的 **send()** 方法，通过每个watcher对应的**chan**将变更的事件发送出去





**syncWatchers 同步监听**

![syncWatchers调用流程图](https://s0.lgstatic.com/i/image6/M01/19/17/CioPOWBJvXaAJROAAAAlohW0T4M993.png)

在初始化一个新的 watchableStore 时，etcd 会创建一个用于同步 watcherGroup 的 goroutine，会在 syncWatchersLoop 函数中每隔 100ms 调用一次 syncWatchers 方法，将所有未通知的事件通知给所有的监听者：

简化后的 syncWatchers 方法中有三个核心步骤

- 首先是根据当前的版本从未同步的 watcherGroup 中选出一些待处理的任务，
- 然后从 BoltDB 中获取当前版本范围内的数据变更，并将它们转换成事件，
- 事件和 watcherGroup 在打包之后会通过 send 方法发送到每一个 watcher 对应的 channel 中。

```go
// 位于 mvcc/watchable_store.go:334
func (s *watchableStore) syncWatchers() int {
  //...
	
    
	curRev := s.store.currentRev
	compactionRev := s.store.compactMainRev
    // 为了从 unsynced watchers 中找到未同步的键值对，我们需要查询最小的版本号，
    // 利用最小的版本号查询 backend 存储中的键值对
	wg, minRev := s.unsynced.choose(maxWatchersPerSync, curRev, compactionRev)
	minBytes, maxBytes := newRevBytes(), newRevBytes()
	
	tx := s.store.b.ReadTx()
	tx.RLock()
    // UnsafeRange 方法返回了键值对
    // 在 boltdb 中存储的 key 都是版本号，而 value 为在 backend 中存储的键值对
	revs, vs := tx.UnsafeRange(keyBucketName, minBytes, maxBytes, 0)
	var evs []mvccpb.Event
  	// 转换成事件
	evs = kvsToEvents(s.store.lg, wg, revs, vs)
	var victims watcherBatch
	wb := newWatcherBatch(wg, evs)
	for w := range wg.watchers {
		w.minRev = curRev + 1
    //...
		if eb.moreRev != 0 {
			w.minRev = eb.moreRev
		}
    // 通过 send 将事件和 watcherGroup 发送到每一个 watcher 对应的 channel 中
		if w.send(WatchResponse{WatchID: w.id, Events: eb.evs, Revision: curRev}) {
			pendingEventsGauge.Add(float64(len(eb.evs)))
		} else {
      // 异常情况处理
			if victims == nil {
				victims = make(watcherBatch)
			}
			w.victim = true
		}
    //...
		s.unsynced.delete(w)
	}
  //...
}
```





**客户端监听事件**

客户端监听键值对时，调用的正是Watch方法，Watch在 stream 中创建一个新的 watcher，并返回对应的 WatchID

- AutoWatchID 是 WatchStream 中传递的观察者 ID
- 当用户没有提供可用的 ID 时，如果又传递该值，etcd 将自动分配一个 ID
- 如果传递的 ID 已经存在，则会返回 ErrWatcherDuplicateID 错误

```go
// 位于 mvcc/watcher.go:108
func (ws *watchStream) Watch(id WatchID, key, end []byte, startRev int64, fcs ...FilterFunc) (WatchID, error) {
	// 防止出现 key >= end 的错误 range
	if len(end) != 0 && bytes.Compare(key, end) != -1 {
		return -1, ErrEmptyWatcherRange
	}
	ws.mu.Lock()
	defer ws.mu.Unlock()
	if ws.closed {
		return -1, ErrEmptyWatcherRange
	}
	if id == AutoWatchID {
		for ws.watchers[ws.nextID] != nil {
			ws.nextID++
		}
		id = ws.nextID
		ws.nextID++
	} else if _, ok := ws.watchers[id]; ok {
		return -1, ErrWatcherDuplicateID
	}
	w, c := ws.watchable.watch(key, end, startRev, id, ws.ch, fcs...)
	ws.cancels[id] = c
	ws.watchers[id] = w
	return id, nil
}
```

watchable_store.go 中的 watch 实现是监听的具体实现，实现代码如下：

```go
// 位于 mvcc/watchable_store.go:120
func (s *watchableStore) watch(key, end []byte, startRev int64, id WatchID, ch chan<- WatchResponse, fcs ...FilterFunc) (*watcher, cancelFunc) {
	// 构建 watcher
	wa := &watcher{
		key:    key,
		end:    end,
		minRev: startRev,
		id:     id,
		ch:     ch,
		fcs:    fcs,
	}
    // 对 watchableStore 进行操作之前，需要加锁
	s.mu.Lock()
	s.revMu.RLock()
    // 携带了 revision 参数，则比较请求的 revision 和 store 当前的 revision
	synced := startRev > s.store.currentRev || startRev == 0
	if synced {
		wa.minRev = s.store.currentRev + 1
		if startRev > wa.minRev {
			wa.minRev = startRev
		}
	}
    // 如果大于当前 revision，则放入 synced 组中,否则放入 unsynced 组
	if synced {
		s.synced.add(wa)
	} else {
		slowWatcherGauge.Inc()
		s.unsynced.add(wa)
	}
	s.revMu.RUnlock()
	s.mu.Unlock()
	// prometheus 的指标增加
	watcherGauge.Inc()
	return wa, func() { s.cancelWatcher(wa) }
}
```

**服务端处理监听**

当 etcd 服务启动时，会在服务端运行一个用于处理监听事件的 watchServer gRPC 服务，客户端的 watch 请求最终都会被转发到 Watch 函数处理：

- 如果出现了更新或者删除操作，相应的事件就会被发送到 watchStream 的通道中
- 客户端可以通过 Watch 功能监听某一个 Key 或者一个范围的变动，在每一次客户端调用服务端时都会创建两个 goroutine，当 gRPC 流已经结束或者出现错误时，当前的循环就会返回，两个 goroutine 也都会结束
  - 协程 sendLoop 负责向监听者发送数据变动的事件
    - sendLoop 会通过select 关键字来监听多个 channel 中的数据，
    - 将接收到的数据封装成 pb.WatchResponse 结构，并通过 gRPC 流发送给客户端
  - 协程 recvLoop 负责处理客户端发来的事件
    - recvLoop 方法调用了 MVCC 模块暴露出的watchStream.Watch 方法
    - 该方法会返回一个可以用于取消监听事件的 watchID

```go
// 位于 etcdserver/api/v3rpc/watch.go:140
func (ws *watchServer) Watch(stream pb.Watch_WatchServer) (err error) {
	sws := serverWatchStream{
    	// 构建 serverWatchStream
	}
	sws.wg.Add(1)
    
    // 负责向监听者发送数据变动的事件
	go func() {
		sws.sendLoop()
		sws.wg.Done()
	}()
	errc := make(chan error, 1)
    
    // 负责处理客户端发来的事件
  	// 理想情况下，recvLoop 将会使用 sws.wg 通知操作的完成，
    // 但是当  stream.Context().Done() 关闭时，由于使用了不同的 ctx，stream 的接口有可能一直阻塞，
    // 调用 sws.close() 会发生死锁
	go func() {
		if rerr := sws.recvLoop(); rerr != nil {
			if isClientCtxErr(stream.Context().Err(), rerr) {
        		// 错误处理
			}
			errc <- rerr
		}
	}()
	select {
	case err = <-errc:
		close(sws.ctrlStream)
	case <-stream.Context().Done():
		err = stream.Context().Err()
		if err == context.Canceled {
			err = rpctypes.ErrGRPCNoLeader
		}
	}
	sws.close()
	return err
}
```



**异常流程处理**

我们来考虑一下异常流程的处理。消息都是通过 channel 发送出去，但如果消费者消费速度慢，channel 中的消息形成堆积，但是空间有限，满了之后应该怎么办呢？带着这个问题，首先我们来看 channel 的默认容量：

```go
var (
	// chanBufLen 是发送 watch 事件的 buffered channel 长度
   	chanBufLen = 1024
	// maxWatchersPerSync 是每次 sync 时 watchers 的数量
	maxWatchersPerSync = 512
)
```

channel 一旦满了，etcd 并不会丢弃 watch 事件，而是会进行如下的操作：

- 此 watcher 将会从 synced watcherGroup 中删除，和事件列表保存到一个名为 victim 的 watcherBatch 结构中
- watcher 会记录当前的 Revision，并将自身标记为受损，变更操作也会被保存到 watchableStore 的 victims 中
- 接下来该 watcher 不会记录对 foo 的任何变更，在 etcd 启动的时候，WatchableKV 模块启动了 syncWatchersLoop  和  syncVictimsLoop 两个异步协程，这两个协程用于处理不同场景下发送事件
  - syncVictimsLoop 则负责堆积的事件推送，尝试清除堆积的 Event。
  - 它会不断尝试让 watcher 发送这个 Event，一旦队列不满，watcher 将这个 Event 发出后，该 watcher 就被划入了 unsycned 中，同时不再是 victim 状态。
  - 至此，syncWatchersLoop 协程就开始起作用。由于该 watcher 在 victim 状态已经落后了很多消息。
  - 为了保持同步，协程会根据 watcher 保存的 Revision，查出 victim 状态之后所有的消息，将关于 foo 的消息全部给到 watcher，
  - 当 watcher 将这些消息都发送出去后，watcher 就由 unsynced 变成 synced。

```go
// 位于 mvcc/watchable_store.go:438
func (s *watchableStore) notify(rev int64, evs []mvccpb.Event) {
	var victim watcherBatch
	for w, eb := range newWatcherBatch(&s.synced, evs) {
		if eb.revs != 1 {
      		// 异常
		}
		if w.send(WatchResponse{WatchID: w.id, Events: eb.evs, Revision: rev}) {
			pendingEventsGauge.Add(float64(len(eb.evs)))
		} else {
			// 将 slow watchers 移动到 victims
			w.minRev = rev + 1
			if victim == nil {
				victim = make(watcherBatch)
			}
			w.victim = true
			victim[w] = eb
			s.synced.delete(w)
			slowWatcherGauge.Inc()
		}
	}
	s.addVictim(victim)
}

// 位于 mvcc/watchable_store.go:246
// syncVictimsLoop 清除堆积的 Event
func (s *watchableStore) syncVictimsLoop() {
	defer s.wg.Done()
	for {
		for s.moveVictims() != 0 {
			//更新所有的 victim watchers
		}
		s.mu.RLock()
		isEmpty := len(s.victims) == 0
		s.mu.RUnlock()
		var tickc <-chan time.Time
		if !isEmpty {
			tickc = time.After(10 * time.Millisecond)
		}
		select {
		case <-tickc:
		case <-s.victimc:
		case <-s.stopc:
			return
		}
	}
}
```

### lease原理

每个 Lease 都设置了一个 TTL 时间，**具有相同 TTL 时间的 key 绑定到同一个 Lease**，实现了 Lease 的复用，并且基于 gRPC 协议的通信实现了连接的多路复用

```sh
$ etcdctl lease grant 1000
## lease 694d77aa9e38260f granted with ttl(1000s)
$ etcdctl lease timetolive 694d77aa9e38260f
## lease 694d77aa9e38260f granted with ttl(1000s), remaining(983s)
$ etcdctl put foo bar --lease 694d77aa9e38260f
OK
# 等待过期，再次查看租约信息
$ etcdctl lease timetolive 694d77aa9e38260f
## lease 694d77aa9e38260f already expired
```

Lease 模块对外提供了 Lessor 接口，其中定义了包括 Grant、Revoke、Attach 和 Renew 等常用的方法，lessor 结构体实现了 Lessor 接口

除此之外，lessor 还启动了两个异步 goroutine：RevokeExpiredLease 和 CheckpointScheduledLease，分别用于撤销过期的租约和更新 Lease 的剩余到期时间

- 当 etcd 服务端的 gRPC Server 接收到创建 Lease 的请求后，
- Raft 模块首先进行日志同步；
- 接着 MVCC 调用 Lease 模块的 Grant 接口，保存对应的日志条目到 ItemMap 结构中，
- 接着将租约信息存到 boltdb；最后将 LeaseID 返回给客户端，Lease 创建成功





**Lessor 接口**

Lessor 接口是 Lease 模块对外提供功能的核心接口，定义了包括创建、绑定和延长租约等常用方法：

```go
// 位于 lease/lessor.go:82
type Lessor interface {
    //...省略部分
    // 将 lessor 设置为 Primary，这个与 raft 会出现网络分区有关
    Promote(extend time.Duration)
	// Grant 创建了一个在指定时间过期的 Lease 对象
	Grant(id LeaseID, ttl int64) (*Lease, error)
	// Revoke 撤销指定 LeaseID，绑定到其上的键值对将会被移除，如果该 LeaseID 对应的 Lease 不存在，则会返回错误
	Revoke(id LeaseID) error
	// Attach 绑定给定的 LeaseItem 到 LeaseID，如果该租约不存在，将会返回错误
	Attach(id LeaseID, items []LeaseItem) error
	// GetLease 返回 LeaseItem 对应的 LeaseID
	GetLease(item LeaseItem) LeaseID
	// Detach 将 LeaseItem 从给定的 LeaseID 解绑。如果租约不存在，则会返回错误
	Detach(id LeaseID, items []LeaseItem) error
	// Renew 刷新指定 LeaseID，结果将会返回刷新后的 TTL
	Renew(id LeaseID) (int64, error)
	// Lookup 查找指定的 LeaseID，返回对应的 Lease
	Lookup(id LeaseID) *Lease
	// Leases 方法列出所有的 Leases
	Leases() []*Lease
	// ExpiredLeasesC 用于返回接收过期 Lease 的 channel
	ExpiredLeasesC() <-chan []*Lease
}
```




**Lease 与 lessor 结构体**

```go
// 位于 lease/lessor.go:800
type Lease struct {
	ID           LeaseID	// LeaseID 在获取 Lease 的时候生成
	ttl          int64 		// 存活时间，单位秒
	remainingttl int64 		// 剩余的存活时间，如果为 0，则被认为是未设置，这种情况下该值与 TTL 相等
	expiryMu sync.RWMutex	// expiry 的并发锁
	expiry time.Time		// expiry 是 Lease 过期的时间，当expiry.IsZero()为true时，则没有过期时间
	mu      sync.RWMutex	// ItemSet 并发锁
	itemSet map[LeaseItem]struct{}
	revokec chan struct{}
}
```


lessor 实现了 Lessor 接口，我们继续来看 lessor 结构体的定义。lessor 是对租约的封装，其中对外暴露出一系列操作租约的方法，比如创建、绑定和延长租约的方法：

```go
type lessor struct {
	mu sync.RWMutex
	demotec chan struct{}
	leaseMap             map[LeaseID]*Lease		// 用于根据 LeaseID 快速查询对应的 Lease
	leaseExpiredNotifier *LeaseExpiredNotifier	// 对 LeaseQueue 的一层封装，快要到期的保持在队头
	leaseCheckpointHeap  LeaseQueue				// 优先级队列，每次插入都会根据过期时间插入到合适的位置
	itemMap              map[LeaseItem]LeaseID	// 根据 LeaseItem 快速查找 LeaseID，找到对应Lease
	// 当 Lease 过期，lessor 将会通过 RangeDeleter 删除相应范围内的 keys
	rd RangeDeleter
	cp Checkpointer
	// backend 目前只会保存 LeaseID 和 expiry。LeaseItem 通过遍历 kv 中的所有键来恢复
	b backend.Backend
	// minLeasettl 是最小的 TTL 时间
	minLeasettl int64
	expiredC chan []*Lease
	// stopC 用来表示 lessor 应该被停止的 channel
	stopC chan struct{}
	// doneC 用来表示 lessor 已经停止的 channel
	doneC chan struct{}
	lg *zap.Logger
	checkpointInterval time.Duration
	expiredLeaseRetryInterval time.Duration
}
```

lessor 实现了 Lessor 接口，lessor 中维护了三个数据结构：LeaseMap、ItemMap 和 LeaseExpiredNotifier。

优先级队列，普遍都是用堆来实现

- etcd Lease 的实现基于最小堆，比较的依据是Lease 失效的时间。
- 我们每次从最小堆里判断堆顶元素是否失效，失效就 Pop 出来并保存到 expiredC 的 channel 中。
- etcd Server 会定期从 channel 读取过期的 LeaseID，之后发起 revoke 请求。
- 通过 Raft 日志将 revoke 请求发送给其他节点，
- 集群中的其他节点收到 revoke 请求后，首先获取 Lease 绑定的键值对，接着删除 boltdb 中的 key 和存储的 Lease 信息，以及 LeaseMap 中的 Lease 对象。





**核心方法解析**

Lessor 接口中有几个常用的核心方法，包括Grant 申请租约、Attach 绑定租约以及 Revoke 撤销租约等

*Grant 申请租约*

当 Grant 一个租约 Lease 时，Lease 被同时存放到 LeaseMap 和 LeaseExpiredNotifier 中

在队列头，有一个 goroutine  revokeExpiredLeases 定期检查队头的租约是否过期，如果过期就放入 expiredChan 中

只有当发起 revoke 操作之后，才会从队列中删除

```go
// 位于 lease/lessor.go:258
func (le *lessor) Grant(id LeaseID, ttl int64) (*Lease, error) {
  // TTL 不能大于 MaxLeasettl
	if ttl > MaxLeasettl {
		return nil, ErrLeasettlTooLarge
	}
	// 构建 Lease 对象
	l := &Lease{
		ID:      id,
		ttl:     ttl,
		itemSet: make(map[LeaseItem]struct{}),
		revokec: make(chan struct{}),
	}
	le.mu.Lock()
	defer le.mu.Unlock()
    // 查找内存 LeaseMap 中是否有 LeaseID 对应的 Lease
	if _, ok := le.leaseMap[id]; ok {
		return nil, ErrLeaseExists
	}
	if l.ttl < le.minLeasettl {
		l.ttl = le.minLeasettl
	}
	if le.isPrimary() {
		l.refresh(0)
	} else {
		l.forever()
	}
    // 将 l 存放到 LeaseMap
	le.leaseMap[id] = l
	item := &LeaseWithTime{id: l.ID, time: l.expiry.UnixNano()}
    // 将 l 存放到 LeaseExpiredNotifier
	le.leaseExpiredNotifier.RegisterOrUpdate(item)
	l.persistTo(le.b)
	leaseTotalttls.Observe(float64(l.ttl))
	leaseGranted.Inc()
	if le.isPrimary() {
		le.scheduleCheckpointIfNeeded(l)
	}
	return l, nil
}
```

*Attach 绑定租约*

Attach 用于绑定键值对与指定的 LeaseID。当租约过期，且没有续期的情况下，该 Lease 上绑定的键值对会被自动移除。

```go
// 位于 lease/lessor.go:518
func (le *lessor) Attach(id LeaseID, items []LeaseItem) error {
	le.mu.Lock()
	defer le.mu.Unlock()
  	// 从 LeaseMap 取出 LeaseID 对应的 lease
	l := le.leaseMap[id]
	if l == nil {
		return ErrLeaseNotFound
	}
    
    // 租约存在,将 Item 保存到对应的租约下,随后将 Item 和 LeaseID 保存在 ItemMap 中
	l.mu.Lock()
	for _, it := range items {
		l.itemSet[it] = struct{}{}
		le.itemMap[it] = id
	}
	l.mu.Unlock()
	return nil
}
```

*Revoke 撤销租约*

Revoke 方法用于撤销指定 LeaseID 的租约，同时绑定到该 Lease 上的键值都会被移除。

首先要根据 LeaseID 从 LeaseMap 中找到对应的 Lease 并从 LeaseMap 中删除，然后从 Lease 中找到绑定的 Key，并从 Backend 中将 KeyValue 删除

```go
// 位于 lease/lessor.go:311
func (le *lessor) Revoke(id LeaseID) error {
	le.mu.Lock()
	l := le.leaseMap[id]
	if l == nil {
		le.mu.Unlock()
		return ErrLeaseNotFound
	}
	defer close(l.revokec)
	// 释放锁
	le.mu.Unlock()
	if le.rd == nil {
		return nil
	}
	txn := le.rd()
	// 对键值进行排序，使得所有的成员保持删除键值对的顺序一致
	keys := l.Keys()
	sort.StringSlice(keys).Sort()
	for _, key := range keys {
		txn.DeleteRange([]byte(key), nil)
	}
	le.mu.Lock()
	defer le.mu.Unlock()
	delete(le.leaseMap, l.ID)
	// 键值删除操作需要在一个事务中进行
	le.b.BatchTx().UnsafeDelete(leaseBucketName, int64ToBytes(int64(l.ID)))
	txn.End()
	leaseRevoked.Inc()
	return nil
}
```



*调用 Lessor API*
上面我们介绍了 Lessor 接口中几个常用方法的实现。下面我们将基于上面三个接口，通过调用 Lessor API 创建 Lease 租约，将键值对绑定到租约上，到达 TTL 时间后主动将对应的键值对删除，实现代码如下：

```
func testLease() {
    le := newLessor()    // 创建一个 Lessor
    le.Promote(0)        
    Go func() {   // 开启一个协程，接收过期的 key，主动删除
        for {  
           expireLease := <-le.ExpiredLeasesC()  
           for _, v := range expireLease {  
              le.Revoke(v.ID)    // 通过租约 ID 删除租约，删除租约时会从 backend 中删除绑定的 key
           }  
        }
    }()
    ttl = 5         
    lease := le.Grant(id, ttl)   // 申请一个租约,ttl=5
    le.Attach(lease, "foo")      // 将租约绑定在"foo"上
    time.Sleep(10 * time.Second)
}
```


同时有一点需要你注意，我们这里直接调用了 Lessor 对外提供的接口，**Lessor 不会主动删除过期的租约，而是将过期的 Lease 通过一个 channel 发送出来，由使用者主动删除**。clientv3 包中定义好了 Lease 相关的实现，基于客户端 API 进行调用会更加简单

### 启动过程

etcd 服务端对 EtcdServer 结构进行了抽象，其包含了 raftNode 属性，代表 Raft 集群中的一个节点，启动入口在 etcdmain 包中的主函数。其主要的逻辑在startEtcdOrProxyV2函数中

- 解析参数
  - cfg := newConfig()用于初始化配置，
    - cfg.parse(os.Args[1:])，随后从第二个参数开始解析命令行输入参数，
    - setupLogging()初始化日志配置
  - identifyDataDirOrDie，判断 data 目录的类型，有 dirMember、dirProxy、dirEmpty，分别对应 etcd 目录、Proxy 目录和空目录。etcd 首先根据 data 目录的类型，判断启动 etcd 还是启动代理。如果是 dirEmpty，再根据命令行参数是否指定了 proxy 模式来判断
- 启动etcd：startEtcd，核心的方法，用于启动 etcd
- 注册信号：osutil.HandleInterrupts(lg) ，包括 SIGINT、SIGTERM，用来终止程序，并清理系统
- 监听对外连接：notifySystemd(lg)，初始化完成，监听对外的连接
- 异常捕获、等待退出：select()，监听 channel 上的数据流动，异常捕获与等待退出
- 退出：osutil.Exit()，接收到异常或退出的命令

```go
// 位于 etcdmain/etcd.go:52
func startEtcdOrProxyV2() {
	grpc.EnableTracing = false
	cfg := newConfig()		// 解析参数
	defaultInitialCluster := cfg.ec.InitialCluster
	// 异常日志处理
	defaultHost, dhErr := (&cfg.ec).UpdateDefaultClusterFromName(defaultInitialCluster)
	var stopped <-chan struct{}
	var errc <-chan error
    
	// identifyDataDirOrDie 返回 data 目录的类型
	which := identifyDataDirOrDie(cfg.ec.GetLogger(), cfg.ec.Dir)
	if which != dirEmpty {	 
		switch which {
        // 以何种模式启动 etcd （是否启动代理）
		case dirMember:	
			stopped, errc, err = startEtcd(&cfg.ec)	
		case dirProxy:
			err = startProxy(cfg)
		default:
			lg.Panic(..)
		}
	} else {
		shouldProxy := cfg.isProxy()
		if !shouldProxy {
			stopped, errc, err = startEtcd(&cfg.ec)
			if derr, ok := err.(*etcdserver.DiscoveryError); ok && derr.Err == v2discovery.ErrFullCluster {
				if cfg.shouldFallbackToProxy() {
					shouldProxy = true
				}
			}
		}
		if shouldProxy {
			err = startProxy(cfg)
		}
	}
	if err != nil {
		// ... 有省略
		// 异常日志记录
	}
	osutil.HandleInterrupts(lg)	// 注册信号
	notifySystemd(lg)			// 监听对外连接
	select {					// 异常捕获、等待退出
	case lerr := <-errc:
		lg.Fatal("listener failed", zap.Error(lerr))
	case <-stopped:
	}
	osutil.Exit(0)				// 退出
}
```





**startEtcd启动**

用于启动 etcd 服务器和 HTTP 处理程序，以进行客户端/服务器通信

```go
// 位于 embed/etcd.go:92
func StartEtcd(inCfg *Config) (e *Etcd, err error) {
	// 校验 etcd 配置
	if err = inCfg.Validate(); err != nil {
		return nil, err
	}
	serving := false
	// 根据合法的配置，创建 etcd 实例
	e = &Etcd{cfg: *inCfg, stopc: make(chan struct{})}
	cfg := &e.cfg
	// 为每个 peer 创建一个 peerListener(rafthttp.NewListener)，用于接收 peer 的消息
	if e.Peers, err = configurePeerListeners(cfg); err != nil {
		return e, err
	}
	// 创建 client 的 listener(transport.NewKeepAliveListener) contexts 的 map，用于服务端处理客户端的请求
	if e.sctxs, err = configureClientListeners(cfg); err != nil {
		return e, err
	}
	for _, sctx := range e.sctxs {
		e.Clients = append(e.Clients, sctx.l)
	}
	// 创建 etcdServer实例对象
	if e.Server, err = etcdserver.NewServer(srvcfg); err != nil {
		return e, err
	}
    // 启动 etcdServer
	e.Server.Start()
	// 在 rafthttp 启动之后，配置 peer Handler
	if err = e.servePeers(); err != nil {
		return e, err
	}
	// ...有删减
	return e, nil
}
```

**服务端初始化**

*NewServer*

NewServer 方法用于创建一个 etcdServer 实例，我们可以根据传递过来的配置创建一个新的 etcdServer，在 etcdServer 的生存期内，该配置被认为是静态的

```go
NewServer()                           
 |-v2store.New() 		// 创建 store，根据给定的命名空间来创建初始目录
 |-wal.Exist() 			// 判断 wal 文件是否存在
 |-fileutil.TouchDirAll // 创建文件夹
 |-openBackend 			// 使用当前的 etcd db 返回一个 backend
 |-restartNode()  		// 已有 WAL，直接根据 SnapShot 启动，最常见的场景
 |-startNode()       	// 在没有 WAL 的情况下，新建一个节点 
 |-tr.Start  			// 启动 rafthttp
 |-time.NewTicker()  	// 通过创建 &EtcdServer{} 结构体时新建 tick 时钟
```

需要注意的是，我们要在 kv 键值对重建之前恢复租期。当恢复 mvcc.KV 时，重新将 key 绑定到租约上。如果先恢复 mvcc.KV，它有可能在恢复之前将 key 绑定到错误的 lease

另外就是最后的清理逻辑，在没有先关闭 kv 的情况下关闭 backend，可能导致恢复的压缩失败，并出现 TX 错误



*启动 backend*

backend 是 etcd 的存储支撑，openBackend调用当前的 db 返回一个 backend

```go
// 位于 etcdserver/backend.go:68
func openBackend(cfg ServerConfig) backend.Backend {
	// db 存储的路径
	fn := cfg.backendPath()
    // 创建一个 backend.Backend 类型的 chan
	now, beOpened := time.Now(), make(chan backend.Backend)
	go func() {
		// 单独协程启动 backend,主要用来配置 backend 启动参数,具体的实现则在 backend 包中
		beOpened <- newBackend(cfg)
	}()
	// 阻塞，等待 backend 启动，或者 10s 超时
	select {
	case be := <-beOpened:
		return be
	case <-time.After(10 * time.Second):	// 设置启动的超时时间为 10s
    	// 超时，db 文件被占用
		)
	}
	return <-beOpened
}
```


etcd 底层的存储基于 boltdb，使用newBackend方法构建 boltdb 需要的参数，bolt.Open(bcfg.Path, 0600, bopts)在给定路径下创建并打开数据库，其中第二个参数为打开文件的权限。如果该文件不存在，将自动创建。传递 nil 参数将使 boltdb 使用默认选项打开数据库连接

**启动 Raft**

在NewServer的实现中，我们可以基于条件语句判断 Raft 的启动方式，具体实现如下：

- haveWAL变量对应的表达式为wal.Exist(cfg.WALDir())，用来判断是否存在 WAL
- cfg.NewCluster则对应 etcd 启动时的--initial-cluster-state，标识节点初始化方式，
  - 该配置默认为new，对应的变量 haveWAL 的值为 true。new 表示没有集群存在，所有成员以静态方式或 DNS 方式启动，创建新集群；
  - existing 表示集群存在，节点将尝试加入集群。

```go
switch {
  case !haveWAL && !cfg.NewCluster:		
    // startNode(cfg, cl, nil)
  case !haveWAL && cfg.NewCluster:		
    // startNode(cfg, cl, cl.MemberIDs())
  case haveWAL:			
    // restartAsStandaloneNode
  	// restartNode
  default:
  return nil, fmt.Errorf("unsupported Bootstrap config")
}
```


在三种不同的条件下，raft 对应三种启动的方式，分别是：startNode、restartAsStandaloneNode 和 restartNode

*starNode*

```go
// startNode 的定义
func startNode(cfg ServerConfig, cl *membership.RaftCluster, ids []types.ID) (id types.ID, n raft.Node, s *raft.MemoryStorage, w *wal.WAL) ;
```

```go
case !haveWAL && !cfg.NewCluster:
  // 加入现有集群时检查初始配置，如有问题则返回错误
  if err = cfg.VerifyJoinExisting(); err != nil {
  	return nil, err
  }
  // 使用提供的地址映射创建一个新 raft 集群
  cl, err = membership.NewClusterFromURLsMap(cfg.Logger, cfg.InitialClusterToken, cfg.InitialPeerURLsMap)
  if err != nil {
  	return nil, err
  }
  // GetClusterFromRemotePeers 采用一组表示 etcd peer 的 URL，并尝试通过访问其中一个 URL 上的成员端点来构造集群
  existingCluster, gerr := GetClusterFromRemotePeers(cfg.Logger, getRemotePeerURLs(cl, cfg.Name), prt)
  if gerr != nil {
  	return nil, fmt.Errorf("cannot fetch cluster info from peer urls: %v", gerr)
  }
  if err = membership.ValidateClusterAndAssignIDs(cfg.Logger, cl, existingCluster); err != nil {
  	return nil, fmt.Errorf("error validating peerURLs %s: %v", existingCluster, err)
  }
  // 校验兼容性
  if !isCompatibleWithCluster(cfg.Logger, cl, cl.MemberByName(cfg.Name).ID, prt) {
  	return nil, fmt.Errorf("incompatible with current running cluster")
  }

 remotes = existingCluster.Members()
  cl.SetID(types.ID(0), existingCluster.ID())
  cl.SetStore(st)
  cl.SetBackend(be)
  // 启动 raft Node
  id, n, s, w = startNode(cfg, cl, nil)
  cl.SetID(id, existingCluster.ID())
```


StartNode 基于给定的配置和 raft 成员列表，返回一个新的节点，

它将每个给定 peer 的 ConfChangeAddNode 条目附加到初始日志中。

peers 的长度不能为零，如果长度为零将调用 RestartNode 方法。

RestartNode 与 StartNode 类似，但不包含 peers 列表，集群的当前成员关系将从存储中恢复。

如果调用方存在状态机，则传入已应用到该状态机的最新一个日志索引值；否则直接使用零作为参数。



*重启 raft Node*

当已存在 WAL 文件时，raft Node 启动时首先需要检查响应文件夹的读写权限（当集群初始化之后，discovery token 将不会生效）；接着将会加载快照文件，并从 snapshot 恢复 backend 存储。

cfg.ForceNewCluster对应 etcd 配置中的--force-new-cluster，如果为 true，则会强制创建一个新的单成员集群；否则重新启动 raft Node

*restartAsStandaloneNode*

当--force-new-cluster配置为 true 时，则会调用 restartAsStandaloneNode，即强制创建一个新的单成员集群。

该节点将会提交配置更新，强制删除集群中的所有成员，并添加自身作为集群的一个节点，同时我们需要将其备份设置进行还原。

restartAsStandaloneNode 的实现中，

- 首先读取 WAL 文件，并且丢弃本地未提交的 entries。
- createConfigChangeEnts 创建一系列 Raft 条目（即 EntryConfChange），用于从集群中删除一组给定的 ID。
- 如果当前节点self出现在条目中，也不会被删除；如果self不在给定的 ID 内，它将创建一个 Raft 条目以添加给定的self默认成员，随后强制追加新提交的 entries 到现有的数据存储中。
- 最后就是设置一些状态，构造 raftNode 的配置，重启 raft Node

*restartNode*

在已有 WAL 数据的情况中，除了restartAsStandaloneNode场景，当--force-new-cluster为默认的 false 时，直接重启 raftNode。

这种操作相对来说比较简单，减少了丢弃本地未提交的 entries 以及强制追加新提交的 entries 的步骤。

接下来要做的就是直接重启 raftNode 还原之前集群节点的状态，读取 WAL 和快照数据，最后启动并更新 raftStatus



**rafthttp 启动**

分析完 raft Node 的启动，接下来我们看 rafthttp 的启动。

Transport 实现了 Transporter 接口，它提供了将 raft 消息发送到 peer 并从 peer 接收 raft 消息的功能。

我们需要调用 Handler 方法来获取处理程序，以处理从 peerURLs 接收到的请求。

用户需要先调用 Start 才能调用其他功能，并在停止使用 Transport 时调用 Stop。

rafthttp 的启动过程中首先要构建 Transport，并将 m.PeerURLs 分别赋值到 Transport 中的 Remote 和 Peer 中，之后将 srv.r.transport 指向构建好的 Transport 即可。

**启动 etcd 服务端**

接下来就是 etcd 的真正启动了，我们来看主要调用步骤：

- 首先e.Server.Start初始化 Server 启动的必要信息；
  - 在处理请求之前，Start方法初始化 Server 的必要信息，需要在Do和Process之前调用，且必须是非阻塞的，任何耗时的函数都必须在单独的协程中运行。
  - Start方法的实现中还启动了多个 goroutine，这些协程用于选举时钟设置以及注册自身信息到服务器等异步操作。
- 接着实现集群内部通讯；
  - 集群内部的通信主要由 Etcd.servePeers 实现，在 rafthttp.Transport 启动之后，配置集群成员的处理器。
  - 首先生成 http.Handler 来处理 etcd 集群成员的请求，并做一些配置校验。
  - goroutine 读取 gRPC 请求，然后调用 srv.Handler 处理这些请求。
  - srv.Serve总是返回非空的错误，当 Shutdown  或者 Close 时，返回的错误则是 ErrServerClosed。
  - 最后srv.Serve在独立协程启动对集群成员的监听
- 最后开始接收 peer 和客户端的请求，包括 range、put 等请求。
  - Etcd.serveClients主要用来处理客户端请求，比如我们常见的 range、put 等请求。
  - etcd 处理客户端的请求，每个客户端的请求对应一个 goroutine 协程，这也是 etcd 高性能的支撑，
  - etcd Server 为每个监听的地址启动一个客户端服务协程，根据 v2、v3 版本进行不同的处理。
  - 在serveClients中，还设置了 gRPC 的属性，包括 GRPCKeepAliveMinTime 、GRPCKeepAliveInterval 以及 GRPCKeepAliveTimeout 等。

```go
// 位于 embed/etcd.go:220
e.Server.Start()
// 接收 peer 消息
if err = e.servePeers(); err != nil {
return e, err
}
// 接收客户端请求
if err = e.serveClients(); err != nil {
return e, err
}
// 提供导出 metrics
if err = e.serveMetrics(); err != nil {
return e, err
}
serving = true
```



### 请求处理

我们先来回顾一下 etcd 的整体架构。客户端访问 etcd 服务端，按照分层的架构可以划分为客户端层、API 接口层、etcd Raft 层、业务逻辑层以及 etcd 存储。

- 客户端层如 clientv3 库和 etcdctl 等工具，用户通过 RESTful 方式进行调用，降低了 etcd 的使用复杂度；

- API 接口层提供了客户端访问服务端的通信协议和接口定义，以及服务端节点之间相互通信的协议。 etcd v3 使用 gRPC 作为消息传输协议；
- etcd Raft 层负责 Leader 选举和日志复制等功能，除了与本节点的 etcd server 通信之外，还与集群中的其他 etcd 节点进行交互，实现分布式一致性数据同步的关键工作；

- etcd 的业务逻辑层，包括鉴权、租约、KVServer、MVCC 和 Compactor 压缩等核心功能特性；
- etcd 存储实现了快照、预写式日志 WAL（Write Ahead Log）。etcd V3 版本中，使用 boltdb 来持久化存储集群元数据和用户写入的数据。

结合上述内容，我们来看 KV 请求所涉及的 etcd 各个模块之间的交互过程。 



**gRPC API**

我们先来看 etcd 服务端对外提供服务时 gRPC API 注册的过程。
服务端 gRPC 接口定义在 rpc.proto 文件中，这与 service KV 中的定义相对应。在 etcd 启动时，gRPC Server 也需要注册这些 KV 接口。具体启动的实现则定义在了 grpc 包下，代码如下所示：

Server方法主要用于启动各种服务。

- 首先构建所需要的参数以创建 gRPC Server；
- 然后在启动时将实现 KV 各个方法的对象注册到 gRPC Server，在其上注册对应的拦截器，包括 KVServer、WatchServer、LeaseServer、ClusterServer、AuthServer 和 MaintenanceServer 等

```go
// 位于 etcdserver/api/v3rpc/grpc.go:38
func Server(s *etcdserver.EtcdServer, tls *tls.Config, gopts ...grpc.ServerOption) *grpc.Server {
    // 首先构建所需要的参数
    var opts []grpc.ServerOption
    opts = append(opts, grpc.CustomCodec(&codec{}))
    // 创建 grpc Server
    grpcServer := grpc.NewServer(append(opts, gopts...)...)
    // 注册各种服务到 gRPC Server
    pb.RegisterKVServer(grpcServer, NewQuotaKVServer(s))
    pb.RegisterWatchServer(grpcServer, NewWatchServer(s))
    pb.RegisterLeaseServer(grpcServer, NewQuotaLeaseServer(s))
    pb.RegisterClusterServer(grpcServer, NewClusterServer(s))
    pb.RegisterAuthServer(grpcServer, NewAuthServer(s))
    pb.RegisterMaintenanceServer(grpcServer, NewMaintenanceServer(s))
    
    hsrv := health.NewServer()
    hsrv.SetServingStatus("", healthpb.HealthCheckResponse_SERVING)
    healthpb.RegisterHealthServer(grpcServer, hsrv)
    grpc_prometheus.Register(grpcServer)
    return grpcServer
}
```


下面我们以 KVServer 为例，具体分析 etcd 服务端提供键值对读写的流程

读请求

读请求是 etcd 中的高频操作。etcd 中读取单个 key 和批量 key 的方法所使用的都是 Range。因此对于读请求，我们围绕 Range 方法分析即可

Range 请求的主要部分在于调用RaftKV.Range()方法。这将会调用到 etcdserver 包中对 RaftKV 的实现：

```go
// 位于 etcdserver/api/v3rpc/key.go:41
func (s *kvServer) Range(ctx context.Context, r *pb.RangeRequest) (*pb.RangeResponse, error) {
    // 检验 Range 请求的参数
    if err := checkRangeRequest(r); err != nil {
    	return nil, err
	}
    resp, err := s.kv.Range(ctx, r) //调用 RaftKV.Range()
    if err != nil {
    	return nil, togRPCError(err)
    }
    // 使用 etcd Server 的信息填充 pb.ResponseHeader
    s.hdr.fill(resp.Header)
    return resp, nil
}


// 位于 etcdserver/v3_server.go:90
func (s *EtcdServer) Range(ctx context.Context, r *pb.RangeRequest) (*pb.RangeResponse, error) {
    ctx = context.WithValue(ctx, traceutil.TraceKey, trace)
    var resp *pb.RangeResponse
    var err error
    // 认证校验
    chk := func(ai *auth.AuthInfo) error {
    	return s.authStore.IsRangePermitted(ai, r.Key, r.RangeEnd)
    }
    // 查询结果
    get := func() { resp, err = s.applyV3Base.Range(ctx, nil, r) }
    if serr := s.doSerialize(ctx, chk, get); serr != nil {
    	err = serr
    	return nil, err
    }
    return resp, err
}
```

EtcdServer 实现的 Range 方法较为简单，主要是先进行认证校验，然后调用 applierV3 接口中定义的 Range 方法来查询结果，该方法的实现如下：

```go
// 位于 etcdserver/apply.go:280
func (a *applierV3backend) Range(ctx context.Context, txn mvcc.TxnRead, r *pb.RangeRequest) (*pb.RangeResponse, error) {
    trace := traceutil.Get(ctx)
    resp := &pb.RangeResponse{}
    resp.Header = &pb.ResponseHeader{}
    if txn == nil {
        txn = a.s.kv.Read(trace)
        defer txn.End()
    }
    // 首先准备分页的大小
    limit := r.Limit
    if r.SortOrder != pb.RangeRequest_NONE ||
        r.MinModRevision != 0 || r.MaxModRevision != 0 ||
        r.MinCreateRevision != 0 || r.MaxCreateRevision != 0 {
        limit = 0
    }
    if limit > 0 {
        // 多取一个，用于判断分页是否存在下一页
        limit = limit + 1
    }
    // 构造 Range 请求
    ro := mvcc.RangeOptions{
        Limit: limit,
        Rev:   r.Revision,
        Count: r.CountOnly,
    }
    // 调用 mvcc 包中的 Range 方法获取结果
    rr, err := txn.Range(r.Key, mkGteRange(r.RangeEnd), ro)
    if err != nil {
    	return nil, err
    }
    // 排序
    sortOrder := r.SortOrder
    if r.SortTarget != pb.RangeRequest_KEY && sortOrder == pb.RangeRequest_NONE {
    	sortOrder = pb.RangeRequest_ASCEND
    }
    
    // 分页取
    if r.Limit > 0 && len(rr.KVs) > int(r.Limit) {
        rr.KVs = rr.KVs[:r.Limit]
        resp.More = true
    }
    resp.Header.Revision = rr.Rev
    resp.Count = int64(rr.Count)
    resp.Kvs = make([]*mvccpb.KeyValue, len(rr.KVs))
    for i := range rr.KVs {
        if r.KeysOnly {
        	rr.KVs[i].Value = nil
        }
        resp.Kvs[i] = &rr.KVs[i]
    }
    // 组装响应
	return resp, nil
}
```

由于当前的 mvcc.Range 实现返回按字典序升序的结果，因此默认情况下仅当目标不是KEY时才进行升序排序



**读请求过程描述：**

- 客户端发起range请求之后，clientv3 首先会根据负载均衡算法选择一个合适的 etcd 节点，接着调用 KVServer 模块对应的 RPC 接口，发起 Range 请求的 gRPC 远程调用；

- gRPC Server 上注册的拦截器拦截到 Range 请求，实现 Metrics 统计、日志记录等功能；

- 然后进入读的主要过程，etcd 模式实现了线性读，使得任何客户端通过线性读都能及时访问到键值对的更新； 

- 线性读获取到 Leader 已提交日志索引构造的最新 ReadState 对象，实现本节点状态机的同步；

- 接着就是调用 MVCC 模块，根据 treeIndex 模块 B-tree 快速查找 key 对应的版本号；

- 通过获取的版本号作为 key，查询存储在 boltdb 中的键值对，我们在之前的存储部分讲解过此过程





**写请求**

相比于读请求，多了一步Quota 配额检查存储空间的情况，用来检查写入时是否有足够的空间。实际执行时只会针对 Put 和 Txn 操作，其他的请求如 Range 则会直接调用对应的 handler。

```go
// etcdserver/api/v3rpc/quota.go:59
func (s *quotaKVServer) Put(ctx context.Context, r *pb.PutRequest) (*pb.PutResponse, error) {
    if err := s.qa.check(ctx, r); err != nil {
        return nil, err
    }
    return s.KVServer.Put(ctx, r)
}
```

check方法将检查请求是否满足配额。如果空间不足，将会忽略请求并发出可用空间不足的警报。根据 put 方法的调用过程，我们可以列出如下的主要方法：

```
quotaKVServer.Put() api/v3rpc/quota.go 	首先检查是否满足需求
|-quotoAlarm.check() 					检查
|-KVServer.Put() api/v3rpc/key.go 		真正的处理请求
|-checkPutRequest() 					校验请求参数是否合法
|-RaftKV.Put() etcdserver/v3_server.go 	处理请求
|=EtcdServer.Put() 						实际调用的是该函数
| |-raftRequest()
|   |-raftRequestOnce()
|     |-processInternalRaftRequestOnce() 真正开始处理请求
|       |-context.WithTimeout() 		创建超时的上下文信息
|       |-raftNode.Propose() 			raft/node.go
|         |-raftNode.step() 			对于类型为 MsgProp 类型消息，向 propc 通道中传入数据
|-header.fill() etcdserver/api/v3rpc/header.go 		填充响应的头部信息
```

```go
// etcdserver/v3_server.go:130
func (s *EtcdServer) Put(ctx context.Context, r *pb.PutRequest) (*pb.PutResponse, error) {
    ctx = context.WithValue(ctx, traceutil.StartTimeKey, time.Now())
    resp, err := s.raftRequest(ctx, pb.InternalRaftRequest{Put: r})
    if err != nil {
    	return nil, err
    }
    return resp.(*pb.PutResponse), nil
}
```

将数据写入集群，涉及的内容比较复杂，还包括集群的通信。通过封装的 raftRequest，此时已经将添加记录的请求发送到了 Raft 协议的核心层处理。

**写请求过程描述：**

- 客户端发送写请求，通过**负载均衡**算法选取合适的 etcd 节点，发起 gRPC 调用。
- etcd server 的 gRPC Server 收到这个请求，经过 gRPC **拦截器**拦截，实现 Metrics 统计和日志记录等功能。
- **Quota 模块**配额检查 db 的大小，如果超过会报etcdserver: mvcc: database space exceeded的告警，通过 Raft 日志同步给集群中的节点 db 空间不足，同时告警也会持久化到 db 中。etcd 服务端拒绝写入，对外提供只读的功能。
- 配额检查通过，**KVServer 模块**经过限速、鉴权、包大小判断之后，生成唯一的编号，这时才会将写请求封装为**提案**消息，**提交给 Raft 模块**。
- 写请求的提案只能由 Leader 处理，获取到 Raft 模块的日志条目之后，Leader 会**广播提案内容**。
- **WAL 模块**完成 Raft 日志条目内容封装，当集群大多数节点完成日志条目的持久化，即将提案的状态变更为已提交，可以执行提案内容。
- **Apply 模块**用于执行提案，首先会判断该提案是否被执行过，如果已经执行，则直接返回结束；未执行过的情况下，将会进入 MVCC 模块执行持久化提案内容的操作。
- **MVCC 模块**中的 **treeIndex** 保存了 key 的历史版本号信息，treeIndex 使用 B-tree 结构维护了 key 对应的版本信息，包含了全局版本号、修改次数等属性。版本号代表着 etcd 中的逻辑时钟，启动时默认的版本号为 1。键值对的修改、写入和删除都会使得版本号全局单调递增。写事务在执行时，首先根据写入的 key 获取或者更新索引，如果不存在该 key，则会给予当前最大的 currentRevision 自增得到 revision；否则直接根据 key 获取 revision。
- 根据从 treeIndex 中获取到 revision 、修改次数等属性，以及 put 请求传递的 key-value 信息，作为写入到 **boltdb** 的 value，而将 revision 作为写入到 boltdb 的 key。同时为了读请求能够获取最新的数据，etcd 在写入 boltdb 时也会同步数据到 buffer。因此上文介绍 etcd 读请求的过程时，会优先从 buffer 中读取，读取不到的情况下才会从 boltdb 读取，以此来保证一致性和性能。为了提高吞吐量，此时提案数据并未提交保存到 db 文件，而是由 backend 异步 goroutine 定时将批量事务提交。
- Server 通过调用网络层接口返回结果给客户端。


总的来说，这个过程为客户端发起写请求，由 Leader 节点处理，经过拦截器、Quota 配额检查之后，KVServer 提交一个写请求的提案给 Raft 一致性模块，经过 RaftHTTP 网络转发，集群中的其他节点半数以上持久化成功日志条目，提案的状态将会变成已提交。接着 Apply 通过 MVCC 的 treeIndex、boltdb 执行提案内容，成功之后更新状态机

### 分布式锁

![etcd实现分布式锁](https://s0.lgstatic.com/i/image6/M00/26/8C/CioPOWBbEnyAfk67AABZkPIb5so774.png)

```go
func TestLock(t *testing.T) {
	// 客户端配置
	config = clientv3.Config{
		Endpoints:   []string{"localhost:2379"},
		DialTimeout: 5 * time.Second,
	}
	// 建立连接
	if client, err = clientv3.New(config); err != nil {
		fmt.Println(err)
		return
	}
	// 上锁并创建租约
    lease := clientv3.NewLease(client)
    if leaseGrantResp, err := lease.Grant(context.TODO(), 5); err != nil {
        panic(err)
    }
    leaseId :=  leaseGrantResp.ID
    // 创建一个可取消的租约，主要是为了退出的时候能够释放
    ctx, cancelFunc = context.WithCancel(context.TODO())
    // 释放租约
    defer cancelFunc()
	defer lease.Revoke(context.TODO(), leaseId)
    // 续约
    if keepRespChan, err = lease.KeepAlive(ctx, leaseId); err != nil {
        panic(err)
    }
    
    // 续约应答
    go func(){
        for{
            select{
            case keepResp = <-keepRespChan
                if keepRespChan == nil {
                    fmt.Println("租约已经失效了")
                    goto END
                } else{	// 每秒会续租一次, 所以就会收到一次应答
                    fmt.Println("收到自动续租应答:",keepResp.ID)
                }
            }
        }
        END
    }()
    // 在租约时间内去抢锁（etcd 里面的锁就是一个 key）
    kv = clientv3.NewKV(client)
    
    // 创建事务
    txn = kv.Txn(context.TODO())
    // If 不存在 key，Then 设置它，Else 抢锁失败
    txn.If(clientv3.Compare(clientv3.CreateRevision("lock"),"=",0)).
    	Then((clientv3.OpPut("lock","g", clientv3.WithLease(leaseId))).
		Else(clientv3.OpGet("lock"))
             
	// 提交事务
     if txnResp, err = txn.Commit(); err != nil {
         panic(err)
     }
	if !txnResp.Succeeded {
		fmt.Println("锁被占用:"string(txnResp.Responses[0].GetResponseRange().Kvs[0].Value))
        return
	}
	// 抢到锁后执行业务逻辑，没有抢到则退出    
	fmt.Println("处理任务")
	time.Sleep(5 * time.Second)
}
```

在我们上面的案例中，一旦抢锁失败，客户端就直接返回了。那么当该锁被释放之后，或者持有锁的客户端出现故障退出了，其他客户端如何快速获取锁呢？上述代码可以基于 watch 监测特性进行改进

发起事务请求锁，拿到锁就去租约干活，没有拿到锁就watch当前锁的key，持有者释放后会收到删除事件，马上再次去发起抢占即可

### 注册中心

- 管理当前注册到服务注册与发现中心的微服务实例元数据信息，包括服务实例的服务名、IP 地址、端口号、服务描述和服务状态等；

- 与注册到服务发现与注册中心的微服务实例维持心跳，定期检查注册表中的服务实例是否在线，并剔除无效服务实例信息；

- 提供服务发现能力，为服务调用方提供服务提供方的服务实例元数据。

基于 etcd 原生的 clientv3 API 实现服务的注册，对外提供服务。其他服务调用该服务时，则通过服务名发现对应的服务实例，随后发起调用。简单示例的服务架构图如下所示：

![etcd服务架构](https://s0.lgstatic.com/i/image6/M00/29/9B/Cgp9HWBhfSqAQMS2AABK8MyCUz8663.png)

Gateway 作为调用服务，user-service 作为被调用服务，所有的服务都注册到 etcd。Gateway 发起调用时，首先请求 etcd 获取其对应的服务器地址和端口，各个服务通过 lease 租约机制与 etcd 保持心跳，通过 watch 机制监测注册到 etcd 上的服务实例变化。

**user-service实现**

user-service 将实例信息注册到 etcd，包括 host、port 等信息。我们暂且注册 host 地址与 port，注册到 etcd 之后，user-service 定期续租服务实例信息，相当于保持心跳。续租的频率可以控制，因为频繁的续租请求会造成通信资源的占用

```go
package main
import ( 
	"context"
	"go.etcd.io/etcd/clientv3"
	"log"
	"time"
)
// 创建租约注册服务
type ServiceReg struct {
	client        *clientv3.Client
	lease         clientv3.Lease
	leaseResp     *clientv3.LeaseGrantResponse
	canclefunc    func()
	keepAliveChan <-chan *clientv3.LeaseKeepAliveResponse
	key           string
}
// 初始化etcd连接
func NewServiceReg(addr []string, timeNum int64) (*ServiceReg, error) {
	conf := clientv3.Config{
		Endpoints:   addr,
		DialTimeout: 5 * time.Second,
	}
	var (
		client *clientv3.Client
	)
	if clientTem, err := clientv3.New(conf); err == nil {
		client = clientTem
	} else {
		return nil, err
	}
	ser := &ServiceReg{
		client: client,
	}
    // 设置 Lease、续租
	if err := ser.setLease(timeNum); err != nil {
		return nil, err
	}
	go ser.ListenLeaseRespChan()	// 监听续租情况
	return ser, nil
}
func main() {
	ser, _ := NewServiceReg([]string{"localhost:2379"}, 5)
  defer ser.RevokeLease()
	if err := ser.PutService("/user", "http://localhost:8080"); err != nil {
		log.Panic(err)
	}
	// 阻塞，持续运行
	select {}
}
```



```go
// 设置租约
func (this *ServiceReg) setLease(timeNum int64) error {
	lease := clientv3.NewLease(this.client)						// 创建lease对象
	leaseResp, err := lease.Grant(context.TODO(), timeNum)		// 设置租约时间
	if err != nil {
		return err
	}
	
	ctx, cancelFunc := context.WithCancel(context.TODO())		// 撤销回调函数
	leaseRespChan, err := lease.KeepAlive(ctx, leaseResp.ID)	// 设置续租，保持心跳
	if err != nil {
		return err
	}
	this.lease = lease							// 绑定到serviceReg对象
	this.leaseResp = leaseResp
	this.canclefunc = cancelFunc
	this.keepAliveChan = leaseRespChan
	return nil
}
// 监听续租情况
func (this *ServiceReg) ListenLeaseRespChan() {
	for {
		select {
		case leaseKeepResp := <-this.keepAliveChan:
			if leaseKeepResp == nil {
				log.Println("已经关闭续租功能\n")
				return
			} else {
				log.Println("续租成功\n")
			}
		}
	}
}
// 通过租约注册服务
func (this *ServiceReg) PutService(key, val string) error {
	kv := clientv3.NewKV(this.client)
	log.Printf("register user server for %s\n", val)
	_, err := kv.Put(context.TODO(), key, val, clientv3.WithLease(this.leaseResp.ID))
	return err
}
// 当服务关闭，调用RevokeLease，释放租约
func (this *ServiceReg) RevokeLease() error {
	this.canclefunc()
	time.Sleep(2 * time.Second)
	_, err := this.lease.Revoke(context.TODO(), this.leaseResp.ID)
	return err
}
```

**客户端调用**

我们接着调用 user-service 的客户端，客户端将从 etcd 获取 user 服务的实例信息，并监听 etcd 中 user 服务实例的变更

```go
package main
import (
	"context"
	"github.com/coreos/etcd/mvcc/mvccpb"
	"go.etcd.io/etcd/clientv3"
	"log"
	"sync"
	"time"
)
// 客户端连接的结构体
type ClientInfo struct {
	client     *clientv3.Client
	serverList map[string]string
	lock       sync.Mutex
}
// 初始化 etcd 客户端连接
func NewClientInfo(addr []string) (*ClientInfo, error) {
	conf := clientv3.Config{
		Endpoints:   addr,
		DialTimeout: 5 * time.Second,
	}
	if client, err := clientv3.New(conf); err == nil {
		return &ClientInfo{
			client:     client,
			serverList: make(map[string]string),
		}, nil
	} else {
		return nil, err
	}
}
// 获取服务实例信息
func (this *ClientInfo) GetService(prefix string) ([]string, error) {
	if addrs, err := this.getServiceByName(prefix); err != nil {
		panic(err)
	} else {	// 匹配到所有相同前缀的 key，把值存到 serverList 的 map 结构中
		log.Println("get service ", prefix, " for instance list: ", addrs)
		go this.watcher(prefix)
		return addrs, nil
	}
}
// 监控指定键值对的变更
func (this *ClientInfo) watcher(prefix string) {
    // watch 该 key 对应的前缀，当有增加或删除的时候修改 map 中的数据，该 map 实际维护了实时的服务列表
	rch := this.client.Watch(context.Background(), prefix, clientv3.WithPrefix())
	for wresp := range rch {
		for _, ev := range wresp.Events {
			switch ev.Type {
			case mvccpb.PUT: // 写入的事件
				this.SetServiceList(string(ev.Kv.Key), string(ev.Kv.Value))
			case mvccpb.DELETE: // 删除的事件
				this.DelServiceList(string(ev.Kv.Key))
			}
		}
	}
}
func main() {
	cli, _ := NewClientInfo([]string{"localhost:2379"})	// 创建一个 client，与 etcd 建立连接；
	cli.GetService("/user")
  // select 阻塞，持续运行
	select {}
}
```

```go
// 根据服务名，获取服务实例信息
func (this *ClientInfo) getServiceByName(prefix string) ([]string, error) {
	resp, err := this.client.Get(context.Background(), prefix, clientv3.WithPrefix())
	if err != nil {
		return nil, err
	}
	addrs := this.extractAddrs(resp)
	return addrs, nil
}
// 根据 etcd 的响应，提取服务实例的数组
func (this *ClientInfo) extractAddrs(resp *clientv3.GetResponse) []string {
	addrs := make([]string, 0)
	if resp == nil || resp.Kvs == nil {
		return addrs
	}
	for i := range resp.Kvs {
		if v := resp.Kvs[i].Value; v != nil {
			this.SetServiceList(string(resp.Kvs[i].Key), string(resp.Kvs[i].Value))
			addrs = append(addrs, string(v))
		}
	}
	return addrs
}
// 设置 serverList
func (this *ClientInfo) SetServiceList(key, val string) {
	this.lock.Lock()
	defer this.lock.Unlock()
	this.serverList[key] = string(val)
	log.Println("set data key :", key, "val:", val)
}
// 删除本地缓存的服务实例信息
func (this *ClientInfo) DelServiceList(key string) {
	this.lock.Lock()
	defer this.lock.Unlock()
	delete(this.serverList, key)
	log.Println("del data key:", key)
	if newRes, err := this.getServiceByName(key); err != nil {
		log.Panic(err)
	} else {
		log.Println("get  key ", key, " current val is: ",newRes)
	}
}
// 工具方法，转换数组
func (this *ClientInfo) SerList2Array() []string {
	this.lock.Lock()
	defer this.lock.Unlock()
	addrs := make([]string, 0)
	for _, v := range this.serverList {
		addrs = append(addrs, v)
	}
	return addrs
}
```

客户端本地有保存服务实例的数组：serverList，获取到 user 的服务实例信息后，将数据保存到 serverList 中，客户端会监控 user 的服务实例变更事件，并相应调整自身保存的 serverList。

**运行结果**

我们依次运行 user 服务和调用的客户端，结果如下所示：

```
// 服务端控制台输出
2021-03-14 13:08:13.913059 I | register user server for http://localhost:8080
2021-03-14 13:08:13.932964 I | 续租成功
...
// client 控制台输出
2021-03-14 18:25:37.462231 I | set data key : /user val: http://localhost:8080
2021-03-14 18:25:37.462266 I | get service  /user  for instance list:  [http://localhost:8080]
```

可以看到，服务端控制台在持续输出续租的内容，客户端启动后监测到服务端的 put 事件，并成功获取到/user的服务实例信息：http://localhost:8080。user 服务关闭，控制台有如下的输出：

```
// user 服务关闭之后，client 控制台输出
2021-03-14 18:25:47.509583 I | del data key: /user
2021-03-14 18:25:47.522095 I | get  key  /user  current val is:  []
```

user 服务关闭后，服务实例信息从 etcd 删除。再次获取指定的服务名，返回空的信息，符合预期。

### go-micro集成

go-micro 是一个可插拔的 RPC 框架，用于分布式系统的开发，具有以下特性。

- 服务发现（Service Discovery）：自动服务注册与名称解析。

- 负载均衡（Load Balancing）：在服务发现之上构建了智能的负载均衡机制。 

- 同步通信（Synchronous Comms）：基于 RPC 的通信，支持双向流。

- 异步通信（Asynchronous Comms）：内置发布/订阅的事件驱动架构。

- 消息编码（Message Encoding）：基于 Content-Type 的动态编码，支持 ProtoBuf、JSON，开箱即用。

- 服务接口（Service Interface）：所有特性都被打包在简单且高级的接口中，方便开发微服务。 


go-micro 旨在利用接口使微服务架构抽象化，并且提供了一系列默认且完整的开箱即用的插件。

**定义消息格式**

go-micro 使用 ProtoBuf 定义消息格式。我们创建一个类型为 proto 的文件 hi.proto，其中定义了调用接口的参数以及返回的对象：

```protobuf
// 定义了 Greeter 的接口，Hello 方法的参数为 HelloRequest ，结果返回了 HelloResponse 对象
syntax = "proto3";
package hello;
service Greeter {
    rpc Hello(HelloRequest) returns (HelloResponse) {}
}
message HelloRequest {
    string from = 1;
    string to = 2;
    string msg = 3;
}
message HelloResponse {
    string from = 1;
    string to = 2;
    string msg = 3;
}
```

使用 protoc 来生成 protobuf 代码文件，以此生成对应的 Go 语言代码。包括如下的三个插件：protoc、protoc-gen-go、protoc-gen-micro。使用如下命令分别安装这几个插件：

```sh
go get github.com/golang/protobuf/{proto,protoc-gen-go}
go get github.com/micro/protoc-gen-micro
```

生成模板文件

```sh
protoc  --micro_out=. --go_out=. greeter.proto

tree .
## 生成如下文件
.
├── hello.pb.go			## 结构文件
├── hello.pb.micro.go	## go-micro rpc接口文件
└── hello.proto
```

**server服务端**

下面我们开始实现服务端，服务端需要注册 handlers 处理器，用以对外提供服务并接收请求

```go
package main
import (
	"context"
	hello "github.com/keets2012/etcd-book-code/ch10/micro/srv/proto"
	"log"
	"github.com/micro/go-micro"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-plugins/registry/etcdv3"
)
type Greet struct{}
func (s *Greet) Hello(ctx context.Context, req *hello.HelloRequest, rsp *hello.HelloResponse) error {
	log.Printf("received req %#v \n", req)
	rsp.From = "server"
	rsp.To = "client"
	rsp.Msg = "ok"
	return nil
}
func main() {
    // 配置etcd注册中心
	reg := etcdv3.NewRegistry(func(op *registry.Options) {
		op.Addrs = []string{"127.0.0.1:2379",
		}
	})
    // 初始化服务，然后返回一个 Service 接口的实例
	service := micro.NewService(
		micro.Name("hello.srv.say"),	// 服务名
		micro.Registry(reg),	// 使用 etcd 替换了默认的 Consul 作为服务注册与发现组件
	)
	service.Init()
  // 注册 GreeterHandler，传入服务和处理器
	hello.RegisterGreeterHandler(service.Server(), new(Greet))
  // 运行服务
	if err := service.Run(); err != nil {
		panic(err)
	}
}
```

处理器会与服务一起被注册，就像 HTTP 处理器一样，通过调用 server.Run 服务启动，同时绑定代码配置中的地址作为接收请求的地址。服务启动时向注册中心注册自身服务的相关信息，并在接收到关闭信号时注销。

**client 调用**

客户端应用发起到服务端的远程调用请求，实现客户端与服务端“打招呼”的功能，代码如下所示：

```go
package main
import (
	"context"
	hello "github.com/keets2012/etcd-book-code/ch10/micro/srv/proto"
	"log"
	"github.com/micro/go-micro"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-plugins/registry/etcdv3"
)
func main() {
	reg := etcdv3.NewRegistry(func(op *registry.Options) {
		op.Addrs = []string{
			"127.0.0.1:2379",
		}
	})
	//创建 service
	service := micro.NewService(
		micro.Registry(reg),
	)
	service.Init()
	 // 创建 greet 客户端，需要传入服务名与服务客户端方法构建的对象
	greetClient := hello.NewGreeterService("hello.srv.say", service.Client())
	param := &hello.HelloRequest{
		From: "client",
		To:   "server",
		Msg:  "hello aoho",
	}
	rsp, err := greetClient.Hello(context.Background(), param)
	if err != nil {
		panic(err)
	}
	log.Println(rsp)
}
```

proto 生成的 RPC 接口已经将调用方法的流程封装好。hello.NewGreeterService需要使用服务名与客户端对象来请求指定的接口，即hello.srv.say，然后调用 Hello 方法。

```go
func (c *sayService) Hello(ctx context.Context, in *SayParam, opts ...client.CallOption) (*SayResponse, error) {
    req := c.c.NewRequest(c.name, "Say.Hello", in)
    out := new(SayResponse)
    err := c.c.Call(ctx, req, out, opts...)
    if err != nil {
        return nil, err
    }
    return out, nil
}
```

主要的流程都在 c.c.Call 方法里。我们简单梳理一下整个流程，首先得到服务节点的地址，根据该地址查询连接池里是否有连接，如果有则取出来，如果没有则创建。然后进行数据传输，传输完成后把 client 连接放回到连接池内

**运行结果**

上述操作实现了客户端与服务端的“打招呼”功能，下面我们分别运行服务端和客户端的应用程序，注意执行的先后顺序，得到的结果如下所示：

```
// 服务端的控制台输出
2021-03-16 23:00:23.365137 I | Transport [http] Listening on [::]:65331
2021-03-16 23:00:23.365230 I | Broker [http] Connected to [::]:65332
2021-03-16 23:00:23.365474 I | Registry [etcd] Registering node: hello.srv.say-6407b896-66d4-4cb1-81fd-d743ff6a97ec
2021-03-16 23:01:16.946948 I | received req &hello.SayRequest{From:"client", To:"server", Msg:"hello aoho", XXX_NoUnkeyedLiteral:struct {}{}, XXX_unrecognized:[]uint8(nil), XXX_sizecache:0}
//客户端的控制台输出
2021-03-16 23:01:16.947531 I | from:"server" to:"client" msg:"ok"
```

### go-kit集成

Go-kit 提供了用于实现系统监控和弹性模式组件的库，例如日志记录、跟踪、限流和熔断等，这些库协助工程师提高微服务架构的性能和稳定性。Go-kit 框架分层如下图所示。

![框架分层](https://s0.lgstatic.com/i/image6/M00/2C/97/CioPOWBlXcKAU3tWAAC2wBgqaYw872.png)

除了用于构建微服务的工具包，Go-kit 还为工程师提供了良好的架构设计原则示范。Go-kit 提倡工程师使用 Alistair Cockburn 提出的 SOLID 设计原则、领域驱动设计（DDD）。所以 Go-kit 不仅仅是微服务工具包，它也非常适合构建优雅的整体结构。
Go-kit 提供了三层模型来解耦业务，这也是我们使用它的主要目的，模型由上到下分别是transport -> endpoint -> service。

- 传输层用于网络通信，服务通常使用 HTTP、gRPC 等网络传输方式，或使用 NATS 等发布订阅系统相互通信。除此之外，Go-kit 还支持使用 AMQP 和 Thrift 等多种网络通信模式。

- 接口层是服务器和客户端的基本构建模块。在 Go-kit 中，每个对外提供的服务接口方法都会定义为一个端点（Endpoint），以便在服务器和客户端之间进行网络通信。每个端点利用传输层通过使用 HTTP 或 gRPC 等具体通信模式对外提供服务。

- 服务层是具体的业务逻辑实现。服务层的业务逻辑包含核心业务逻辑，即你要实现的主要功能。它不会也不应该进行 HTTP 或 gRPC 等具体网络传输，或者请求和响应消息类型的编码和解码。

在 Go-kit 中集成 etcd 作为服务注册与发现组件，以及构建用户登录的场景、用户登录系统之后获取认证的令牌，接着实现 Go-kit 的 gRPC 调用

**定义消息格式**

Go-kit 的消息通信也是基于 protobuf 格式。这里我们定义了两个 proto，其中一个定义了登录的 RPC 请求和响应的结构体，另一个则定义了 RPC 请求的方法。分别如下：

```protobuf
// user.proto  定义了 Login 请求和 LoginAck 应答的结构体
syntax = "proto3";
package pb;
message Login {
    string Account = 1;
    string Password = 2;
}
message LoginAck {
    string Token = 1;
}

// service.proto
syntax = "proto3";
package pb;
import "user.proto";
service User {
	// 引用了 user.proto 中定义的结构体，定义了一个方法 RpcUserLogin，请求参数为 Login 对象，响应结果为 LoginAck
    rpc RpcUserLogin (Login) returns (LoginAck) {
    }
}
```




```sh
protoc --go_out=plugins=grpc:. *.proto		## 生成对应的 gRPC pb 文件

tree
.
├── make.sh
├── service.pb.go
├── service.proto
├── user.pb.go
└── user.proto
```

**user 服务**

由于 user 服务的实现代码比较多，这里我侧重讲解 Go-kit  集成使用 etcd 部分。先来看 user 服务的入口主函数

```go
var grpcAddr = flag.String("g", "127.0.0.1:8881", "grpcAddr")
var quitChan = make(chan error, 1)
func main() {
	flag.Parse()
	var (
		etcdAddrs = []string{"127.0.0.1:2379"}
		serName   = "svc.user.agent"
		grpcAddr  = *grpcAddr
		ttl       = 5 * time.Second
	)
	utils.NewLoggerServer()
	// 初始化 etcd 客户端
	options := etcdv3.ClientOptions{
		DialTimeout:   ttl,
		DialKeepAlive: ttl,
	}
	etcdClient, err := etcdv3.NewClient(context.Background(), etcdAddrs, options)
	if err != nil {
		utils.GetLogger().Error("[user_agent]  NewClient", zap.Error(err))
		return
	}
  // 基于 etcdClient 初始化 Registar
	Registar := etcdv3.NewRegistrar(etcdClient, etcdv3.Service{
		Key:   fmt.Sprintf("%s/%s", serName, grpcAddr),
		Value: grpcAddr,
	}, log.NewNopLogger())
	go func() {
		golangLimit := rate.NewLimiter(10, 1)
		server := src.NewService(utils.GetLogger())
		endpoints := src.NewEndPointServer(server, golangLimit)
        // 构造 EndPointServer
		grpcServer := src.NewGRPCServer(endpoints, utils.GetLogger())
        // 监听 tcp 地址和端口
		grpcListener, err := net.Listen("tcp", grpcAddr)
		if err != nil {
			utils.GetLogger().Warn("[user_agent] Listen", zap.Error(err))
			quitChan <- err
			return
		}
        // 注册 user 服务到 etcd，RegisterService 将服务及其实现注册到 gRPC 服务器，必须在调用服务之前调用 RegisterService
		Registar.Register()
		baseServer := grpc.NewServer(grpc.UnaryInterceptor(grpctransport.Interceptor))
		pb.RegisterUserServer(baseServer, grpcServer)
		if err = baseServer.Serve(grpcListener); err != nil {
			utils.GetLogger().Warn("[user_agent] Serve", zap.Error(err))
			quitChan <- err
			return
		}
	}()
	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
		quitChan <- fmt.Errorf("%s", <-c)
	}()
	utils.GetLogger().Info("[user_agent] run " + grpcAddr)
	err = <-quitChan
    // 注销连接
	Registar.Deregister()
	utils.GetLogger().Info("[user_agent] quit err", zap.Error(err))
}
```




**客户端调用**

在微服务架构中，用户登录的操作，一般由 user 服务校验其身份信息的合法性，如果合法则为该用法返回认证的令牌。我们的测试客户端就是模拟 auth 认证服务的实现。

```go
func TestNewUserAgentClient(t *testing.T) {
    // 首先读取配置，初始化 UserAgent，返回的是一个 UserAgent
    // 其实就是得到指定服务的一个 etcdv3 客户端实例。这里获取了 etcd 中键为svc.user.agent的值
	client, err := NewUserAgentClient([]string{"127.0.0.1:2379"}, logger)
	if err != nil {
		t.Error(err)
		return
	}
  // 循环调用，为了测试 user 多实例注册到 etcd，客户端调用的情况
	for i := 0; i < 6; i++ {
		time.Sleep(time.Second)
		userAgent, err := client.UserAgentClient()
		if err != nil {
			t.Error(err)
			return
		}
		ack, err := userAgent.Login(context.Background(), &pb.Login{
			Account:  "aoho",
			Password: "123456",
		})
		if err != nil {
			t.Error(err)
			return
		}
		t.Log(ack.Token)
	}
}


func NewUserAgentClient(addr []string, logger log.Logger) (*UserAgent, error) {
	var (
		etcdAddrs = addr
		serName   = "svc.user.agent"
		ttl       = 5 * time.Second
	)
	options := etcdv3.ClientOptions{
		DialTimeout:   ttl,
		DialKeepAlive: ttl,
	}
	etcdClient, err := etcdv3.NewClient(context.Background(), etcdAddrs, options)
	if err != nil {
		return nil, err
	}
	instancerm, err := etcdv3.NewInstancer(etcdClient, serName, logger)
	if err != nil {
		return nil, err
	}
	return &UserAgent{
		instancerm: instancerm,
		logger:     logger,
	}, err
}
```

在 NewUserAgentClient 的实现中，根据传入的 etcdAddrs 构建 etcdClient，并通过 etcdClient 和 serName 构建 instancerm，指向的类型为 Instancer。

```go
type Instancer struct {
	cache  *instance.Cache
	client Client
	prefix string
	logger log.Logger
	quitc  chan struct{}
}
```

Instancer 选出存储在 etcd 键空间中的实例。同时将 watch 该键空间中的任何事件类型的更改，这些更改将更新实例器的实例信息

**运行结果**

我们启动 3 个服务地址，分别为：127.0.0.1:8881、127.0.0.1:8882、127.0.0.1:8883。

```sh
$ ./user_agent -g 127.0.0.1:8881
2021-03-17 13:31:15     INFO    utils/log_util.go:89    [NewLogger] success
2021-03-17 13:31:15     INFO    user_agent/main.go:75   [user_agent] run 127.0.0.1:8881
$ ./user_agent -g 127.0.0.1:8882
2021-03-17 13:31:12     INFO    utils/log_util.go:89    [NewLogger] success
2021-03-17 13:31:12     INFO    user_agent/main.go:75   [user_agent] run 127.0.0.1:8882
$ ./user_agent -g 127.0.0.1:8883
2021-03-17 13:31:08     INFO    utils/log_util.go:89    [NewLogger] success
2021-03-17 13:31:08     INFO    user_agent/main.go:75   [user_agent] run 127.0.0.1:8883
```

依次运行服务端和测试函数，可以得到如下的结果：

```
=== RUN   TestNewUserAgentClient
ts=2021-03-17T05:31:22.605559Z caller=instancer.go:32 prefix=svc.user.agent instances=3
    TestNewUserAgentClient: user_agent_test.go:44: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOYW1lIjoiYW9obyIsIkRjSWQiOjEsImV4cCI6MTYwMDMyMDcxMywiaWF0IjoxNjAwMzIwNjgzLCJpc3MiOiJraXRfdjQiLCJuYmYiOjE2MDAzMjA2ODMsInN1YiI6ImxvZ2luIn0.Eo-uytDEuAJyPGooXB2mC6uga-C-krVdthEQSYkqG-k
    ...
--- PASS: TestNewUserAgentClient (6.11s)
PASS
```

根据测试函数的运行结果，svc.user.agent 有三个服务实例。客户端 6 次调用 user 服务的登录结果都是成功的，TestNewUserAgentClient 输出了获取到的 JWT Token。同时在启动的三个 user 服务端控制台输出了如下的日志信息：

```json
// 8883
2021-03-17 13:31:24     DEBUG   src/middleware_server.go:31     [9f4221fd-ec8c-53f2-b2ac-26e9cb4501ba]  {"调用 Login logMiddlewareServer": "Login", "req": "Account:\"aoho\"assword:\"123456\" ", "res": "Token:\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOYW1lIjoiYW9obyIsIkRjSWQiOjEsImV4cCI6MTYwMDMyMDcxNCwiaWF0IjoxNjAwMzIwNjg0LCJpc3MiOiJraXRfdjQiLCJuYmYiOjE2MDAzMjA2ODQsInN1YiI6ImxvZ2luIn0.atzewyzrwRtBVCCg_4eZo7iiJKXGV6nJs-_BA9JDSLQ\" ", "time": "188.861 µ s", "err": null}
// 8882
2021-03-17 13:31:26     DEBUG   src/middleware_server.go:31     [9ece68d5-9e56-515c-a417-77f371b04910]  {"调用 Login logMiddlewareServer": "Login", "req": "Account:\"aoho\"assword:\"123456\" ", "res": "Token:\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOYW1lIjoiYW9obyIsIkRjSWQiOjEsImV4cCI6MTYwMDMyMDcxNiwiaWF0IjoxNjAwMzIwNjg2LCJpc3MiOiJraXRfdjQiLCJuYmYiOjE2MDAzMjA2ODYsInN1YiI6ImxvZ2luIn0.KLjK_mf11C_ssO_X5sKyzr55ftUEh2D5mfxS5xTKbP4\" ", "time": "195.477 µ s", "err": null}
2021-03-17 13:31:27     DEBUG   src/middleware_server.go:31     [de1d3e65-d389-5232-9254-33e4cb6c9060]  {"调用 Login logMiddlewareServer": "Login", "req": "Account:\"aoho\"assword:\"123456\" ", "res": "Token:\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOYW1lIjoiYW9obyIsIkRjSWQiOjEsImV4cCI6MTYwMDMyMDcxNywiaWF0IjoxNjAwMzIwNjg3LCJpc3MiOiJraXRfdjQiLCJuYmYiOjE2MDAzMjA2ODcsInN1YiI6ImxvZ2luIn0.2jkryvYTJVnsrXuNWB_SyYqKxQB-l5dos7bGUP2aLyo\" ", "time": "104.817 µ s", "err": null}
// 8881
2021-03-17 13:31:23     DEBUG   src/middleware_server.go:31     [c521bfb2-5a48-58c8-aa74-fdf78adc443f]  {"调用 Login logMiddlewareServer": "Login", "req": "Account:\"aoho\"assword:\"123456\" ", "res": "Token:\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOYW1lIjoiYW9obyIsIkRjSWQiOjEsImV4cCI6MTYwMDMyMDcxMywiaWF0IjoxNjAwMzIwNjgzLCJpc3MiOiJraXRfdjQiLCJuYmYiOjE2MDAzMjA2ODMsInN1YiI6ImxvZ2luIn0.Eo-uytDEuAJyPGooXB2mC6uga-C-krVdthEQSYkqG-k\" ", "time": "173.146 µ s", "err": null}
2021-03-17 13:31:25     DEBUG   src/middleware_server.go:31     [9ffc9f63-d925-5999-9b9b-2bf544654010]  {"调用 Login logMiddlewareServer": "Login", "req": "Account:\"aoho\"assword:\"123456\" ", "res": "Token:\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOYW1lIjoiYW9obyIsIkRjSWQiOjEsImV4cCI6MTYwMDMyMDcxNSwiaWF0IjoxNjAwMzIwNjg1LCJpc3MiOiJraXRfdjQiLCJuYmYiOjE2MDAzMjA2ODUsInN1YiI6ImxvZ2luIn0.OwMi33WbWz4SuIIRsTO0uOzg2d7qx5CDyISetnsbiiE\" ", "time": "174.443 µ s", "err": null}
2021-03-17 13:31:28     DEBUG   src/middleware_server.go:31     [c5459a23-0999-5861-80d2-fea508815ac5]  {"调用 Login logMiddlewareServer": "Login", "req": "Account:\"aoho\"assword:\"123456\" ", "res": "Token:\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOYW1lIjoiYW9obyIsIkRjSWQiOjEsImV4cCI6MTYwMDMyMDcxOCwiaWF0IjoxNjAwMzIwNjg4LCJpc3MiOiJraXRfdjQiLCJuYmYiOjE2MDAzMjA2ODgsInN1YiI6ImxvZ2luIn0.TR6gcjlZ7rb2PXQg5XJz1AX0cGJc706UAuT9VyWR1Wg\" ", "time": "68.345 µ s", "err": null}
```

从上面的日志信息可以知道，客户端根据 etcd 中存储的实例信息发起调用，成功实现了负载均衡。如果我们关闭某一个实例，客户端会监测到服务实例的变更，本地的服务实例列表会踢掉该实例，这种机制使得 Go-kit 的负载均衡依然奏效。