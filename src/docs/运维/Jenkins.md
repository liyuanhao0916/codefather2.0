# Jenkins

## 安装
### ubuntu
安装jdk11，否则启动会报错
```sh
sudo apt update
sudo apt install openjdk-11-jdk
java -version
```
安装
```sh
## 导入 Jenkins 软件源的 GPG keys
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
## 添加软件源到apt
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'

sudo apt update
sudo apt install jenkins
```
报错
```txt
Error: W: GPG error: https://pkg.jenkins.io/debian-stable binary/ Release: The following signatures couldn’t be verified because the public key is not available: NO_PUBKEY 9B7D32F2D50582E6"

```
导入 key:
```bash
## 后面那一串key需要和报错提示的key一致，改成自己的
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 9B7D32F2D50582E6
```
安装完成后会自启动，而且会一直尝试启动，如果是java8，可能一直起不来，换java11
```sh
systemctl status jenkins
```
修改端口号(没生效)

```sh
sudo vim  /etc/default/jenkins
systemctl restart jenkins
```
```ini
HTTP_PORT=8899

```


## 插件

进入 Manage Jenkins -》 Manage Plugin -> Advanced 最下面有 Update Site 设置为：
https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json

主目录下的/updates/default.json文件，将其中的 `updates.jenkins-ci.org/download`替换为`mirrors.tuna.tsinghua.edu.cn/jenkins` ，然后把`www.google.com` 修改为 `www.baidu.com`

Locale 切换中文
下载重启，配置如下
1. 点击【Manage Jenkins】->【Configure System】选项。
2. 找到【Locale】选项，输入【zh_CN】,勾选下面的选项，最后点击【应用】即可。


Publish Over SSH 远程推送
nodejs 部署vue项目
- 安装一个nodejs

配置gitee用户名密码来拉代码
Dashboard-Manage Jenkins-Credentials-System-Global credentials (unrestricted)
拉代码时选择这个凭证即可

## 配置

Dashboard-Manage Jenkins-Tools

### maven-setting
```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
 
  <localRepository>${user.home}/.m2/repository</localRepository>
  
  <pluginGroups>
  
    <pluginGroup>org.mortbay.jetty</pluginGroup>
  </pluginGroups>

  <proxies>
  
  </proxies>

  <servers>
   
    <server>
        <id>releases</id>
        <username>ali</username>
        <password>ali</password>
      </server>
      <server>
        <id>Snapshots</id>
        <username>ali</username>
        <password>ali</password>
      </server>
  </servers>

  
  <mirrors>
  
    <mirror>
      <!--This sends everything else to /public -->
      <id>nexus</id>
      <mirrorOf>*</mirrorOf> 
      <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
    </mirror>
    <mirror>
      <!--This is used to direct the public snapshots repo in the 
          profile below over to a different nexus group -->
      <id>nexus-public-snapshots</id>
      <mirrorOf>public-snapshots</mirrorOf> 
      <url>http://maven.aliyun.com/nexus/content/repositories/snapshots/</url>
    </mirror>
    <mirror>
      <!--This is used to direct the public snapshots repo in the 
          profile below over to a different nexus group -->
      <id>nexus-public-snapshots1</id>
      <mirrorOf>public-snapshots1</mirrorOf> 
      <url>https://artifacts.alfresco.com/nexus/content/repositories/public/</url>
    </mirror>
  </mirrors>

   <profiles> 
    <profile>
      <id>development</id>
      <repositories>
        <repository>
          <id>central</id>
          <url>http://central</url>
          <releases><enabled>true</enabled><updatePolicy>always</updatePolicy></releases>
          <snapshots><enabled>true</enabled><updatePolicy>always</updatePolicy></snapshots>
        </repository>
      </repositories>
     <pluginRepositories>
        <pluginRepository>
          <id>central</id>
          <url>http://central</url>
          <releases><enabled>true</enabled><updatePolicy>always</updatePolicy></releases>
          <snapshots><enabled>true</enabled><updatePolicy>always</updatePolicy></snapshots>
        </pluginRepository>
      </pluginRepositories>
    </profile>
    <profile>
      <!--this profile will allow snapshots to be searched when activated-->
      <id>public-snapshots</id>
      <repositories>
        <repository>
          <id>public-snapshots</id>
          <url>http://public-snapshots</url>
          <releases><enabled>false</enabled></releases>
          <snapshots><enabled>true</enabled><updatePolicy>always</updatePolicy></snapshots>
        </repository>
      </repositories>
     <pluginRepositories>
        <pluginRepository>
          <id>public-snapshots</id>
          <url>http://public-snapshots</url>
          <releases><enabled>false</enabled></releases>
          <snapshots><enabled>true</enabled><updatePolicy>always</updatePolicy></snapshots>
        </pluginRepository>
      </pluginRepositories>
    </profile>
  </profiles>
 
   <activeProfiles>
    <activeProfile>development</activeProfile>
    <activeProfile>public-snapshots</activeProfile>
   </activeProfiles>

</settings>
```
## 部署应用

### Vue项目


添加一个项目


### java项目

https://www.it235.com/%E5%AE%9E%E7%94%A8%E5%B7%A5%E5%85%B7/%E6%8C%81%E7%BB%AD%E9%9B%86%E6%88%90/jenkins.html#springboot%E9%A1%B9%E7%9B%AE%E5%8F%91%E5%B8%83