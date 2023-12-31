---
isOriginal: true
category: 
  - 运维
  - Maven
tag: 
  - 插件
---

# Maven 插件

## 打包插件-Assembly

### 官方（不推荐）

**pom**

```xml
<plugin>  
    <artifactId>maven-assembly-plugin</artifactId>  
    <configuration>  
    	<!-- 使用 descriptorRefs 来引用(官方提供的定制化打包方式)【不建議使用】 -->
        <descriptorRefs>  
            <descriptorRef>jar-with-dependencies</descriptorRef>  
        </descriptorRefs>  
    </configuration>  
</plugin>
```

**引用的配置源码**

```xml
<assembly xmlns="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0 http://maven.apache.org/xsd/assembly-1.1.0.xsd">
    <id>bin</id>
    <formats>
        <format>tar.gz</format>
        <format>tar.bz2</format>
        <format>zip</format>
    </formats>
    <fileSets>
        <fileSet>
            <directory>${project.basedir}</directory>
            <outputDirectory>/</outputDirectory>
            <includes>
                <include>README*</include>
                <include>LICENSE*</include>
                <include>NOTICE*</include>
            </includes>
        </fileSet>
        <fileSet>
            <directory>${project.build.directory}</directory>
            <outputDirectory>/</outputDirectory>
            <includes>
                <include>*.jar</include>
            </includes>
        </fileSet>
        <fileSet>
            <directory>${project.build.directory}/site</directory>
            <outputDirectory>docs</outputDirectory>
        </fileSet>
    </fileSets>
</assembly>
```



### 自定义

**pom**

```xml
<!-- 指定项目的打包插件信息 -->
<plugin>
    <artifactId>maven-assembly-plugin</artifactId>
    <version>2.4</version>
    <configuration>
        <!-- 打包的文件名前缀 -->
        <finalName>${project.artifactId}</finalName>
        <!-- 指定打包描述文件的位置：相对项目（模板）根目录的路径 -->
        <!-- assembly打包的描述文件 -->
        <descriptors>
            <descriptor>src/main/assembly/assembly.xml</descriptor>
        </descriptors>
         <!--入口文件-->
  <!--      <archive>
            <manifest>
                <addClasspath>true</addClasspath>
                <mainClass>org.mybatis.generator.api.ShellRunner</mainClass>
            </manifest> -->
        </archive>
    </configuration>
    <executions>	<!-- 配置执行器 -->
        <execution>
            <id>make-assembly</id>
            <phase>package</phase>	<!-- 绑定生命周期 -->
            <goals>
                <goal>single</goal>	<!-- 只运行一次 -->
            </goals>
        </execution>
    </executions>
</plugin>
```

**配置文件**：assembly.xml

```xml
<?xml version='1.0' encoding='UTF-8'?>
<assembly xmlns="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0  
                    http://maven.apache.org/xsd/assembly-1.1.0.xsd">
    <!-- 打包的文件名后缀，‘-’拼接 -->
    <id>demo</id>
    <!-- 指定打包类型：zip、tar、tar.gz (or tgz)、tar.bz2 (or tbz2)、jar、dir、war -->
    <formats>
        <format>jar</format>
        <format>dir</format>
        <format>tar.gz</format>
    </formats>
    <!-- 指定是否包含目录:false则放在包的根目录下 -->
    <includeBaseDirectory>false</includeBaseDirectory>
 	<!-- 在tar.gz压缩包中是否包含根文件夹，该根文件夹名称和tar.gz去掉id后缀一致 -->
    <includeBaseDirectory>true</includeBaseDirectory>
    <!-- 定制打包方式 -->
    <dependencySets>
		<dependencySet>
            <!-- 指定包依赖目录，相对于根目录 -->
			<outputDirectory>/lib</outputDirectory>
            <!-- 使用项目依赖 -->
			<useProjectArtifact>true</useProjectArtifact>
			<unpack>false</unpack>
			<scope>runtime</scope>
		</dependencySet>
        <dependencySet>
            <outputDirectory>/lib</outputDirectory>
            <!-- 排除依赖 -->
            <excludes>
                <exclude>${project.groupId}:${project.artifactId}</exclude>
            </excludes>
        </dependencySet>
        <dependencySet>
            <outputDirectory>/</outputDirectory>
            <!-- 包含依赖 -->
            <includes>
                <include>${project.groupId}:${project.artifactId}</include>
            </includes>
        </dependencySet>
	</dependencySets>
    
    <!-- 包含的文件集 -->
    <fileSets>
        <fileSet>
        	<!-- 指定包含的目录 -->
            <directory>${project.build.directory}/classes</directory>
            <!-- 指定要包含目录的目的地 -->
            <outputDirectory>/</outputDirectory>
            
        </fileSet>
    </fileSets>
</assembly>
```

### 示例1：打包dubbo

[参考](https://www.jianshu.com/p/d657c506aaa6)

**pom**

```xml
<!-- 指定项目的打包插件信息 -->
<plugin>
    <artifactId>maven-assembly-plugin</artifactId>
    <configuration>
        <!-- 指定打包描述文件的位置：相对项目根目录的路径 -->
        <!-- assembly打包的描述文件 -->
        <descriptor>assembly/assembly.xml</descriptor>
    </configuration>
    <executions>
        <execution>
            <id>make-assembly</id>
            <phase>package</phase>
            <goals>
                <goal>single</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

**配置文件**：assembly.xml

```xml
<?xml version='1.0' encoding='UTF-8'?>
<assembly
    xmlns="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.3"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.3 http://maven.apache.org/xsd/assembly-1.1.3.xsd">
    <!-- 该字符会添加到最终tar.gz包的名称后面，作为后缀 -->
    <id>assembly</id>
    <!-- 指定打包的格式为tar.gz，该类型压缩包在linux中比较常见 -->
    <formats>
        <format>tar.gz</format>
    </formats>
    <!-- 在tar.gz压缩包中是否包含根文件夹，该根文件夹名称和tar.gz去掉id后缀一致 -->
    <includeBaseDirectory>true</includeBaseDirectory>
    <fileSets>
        <!-- 将项目根路径下assembly/bin路径中的内容打包到压缩包中的根目录下的bin目录中 -->
        <fileSet>
            <!-- 相对项目根路径的相对路径 -->
            <directory>assembly/bin</directory>
            <outputDirectory>bin</outputDirectory>
            <!-- 设置最终tar.gz中该文件夹下的权限，跟linux权限写法一致 -->
            <fileMode>0755</fileMode>
        </fileSet>
        <!-- 将项目根路径下assembly/conf路径中的内容打包到压缩包中的根目录下的conf目录中 -->
        <fileSet>
            <directory>assembly/conf</directory>
            <outputDirectory>conf</outputDirectory>
            <!-- 设置其linux权限 -->
            <fileMode>0644</fileMode>
        </fileSet>
    </fileSets>
    <!-- 将所有依赖的jar包打包到压缩包中的根目录下的lib目录中 -->
    <!-- 此lib目录中包含自己开发的项目jar包以及demo_service.jar，还有第三方的jar包 -->
    <dependencySets>
        <dependencySet>
            <outputDirectory>lib</outputDirectory>
        </dependencySet>
    </dependencySets>
</assembly>
```

### 示例2：项目打包

**pom**

```xml
<plugin>
    <artifactId>maven-assembly-plugin</artifactId>
    <version>${assembly.plugin.version}</version>
    <configuration>
        <finalName>${project.artifactId}</finalName>
        <descriptors>
            <descriptor>src/main/assembly/assembly.xml</descriptor>
        </descriptors>
    </configuration>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>assembly</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

**配置文件**：assembly.xml

```xml
<assembly
	xmlns="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.0 http://maven.apache.org/xsd/assembly-1.1.0.xsd">
	<id>all</id>
	<formats>
		<format>dir</format>
		<format>zip</format>
	</formats>
	<includeBaseDirectory>false</includeBaseDirectory>
	<dependencySets>
		<dependencySet>
			<outputDirectory>/lib</outputDirectory>
			<useProjectArtifact>true</useProjectArtifact>
			<unpack>false</unpack>
			<scope>runtime</scope>
		</dependencySet>
	</dependencySets>
	<fileSets>
		<fileSet>
			<directory>src/main/scripts</directory>
			<outputDirectory>/bin</outputDirectory>
		</fileSet>
		<!-- 只拷贝 spring 配置文件 -->
		<fileSet>
			<directory>src/main/resources/spring-ota</directory>
			<outputDirectory>/config/spring-ota</outputDirectory>
			<filtered>true</filtered>
		</fileSet>
	</fileSets>
</assembly>
```

