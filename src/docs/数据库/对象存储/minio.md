# Minio

## 安装minio服务器

```sh
mkdir -p /usr/local/minio/{data,bin,logs,config}
cd /usr/local/minio/bin
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
```
## 配置启动脚本

```sh
mkdir -p /home/file/fnii
vim run.sh
chmod +x run.sh
```
run.sh
```sh
#!/bin/bash
export MINIO_ROOT_USER=admin
export MINIO_ROOT_PASSWORD=admin123

/usr/local/minio/bin/minio server \
--config-dir /usr/local/minio/config \
--console-address ":19001" \
--address ":19000" \
/home/file/fnii \
> /usr/local/minio/logs/minio.log 2>&1
```
- /home/file/fnii 为文件保存路径，需与run.sh中路径保持一致

## 创建守护进程

```sh
vim /usr/lib/systemd/system/minio.service
chmod +x /usr/lib/systemd/system/minio.service
systemctl daemon-reload
systemctl enable minio
systemctl start minio
systemctl status minio
```
minio.service
```inif
[unit]
Description=Minio service
Documentation=https://docs.minio.io/

[Service]
WorkingDirectory=/usr/local/minio/bin
ExecStart=/usr/local/minio/bin/run.sh

Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## java

配置文件

```yaml
minio:
  endpoint: http://192.168.16.60:9000
  accesskey: gzh4Alx3Zm5Eceh2
  secretKey: W19q1koRHPhTPWTjulY1Wyvr7b3qAwl7
  bucketName: siping
```

配置类

```java
package com.test.mybatistest.minio;
import io.minio.MinioClient;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
/**
 * minio配置信息
 */
@Data
@Component
@ConfigurationProperties(prefix = "minio")
public class MinioConfig {
    /**
     * 服务器地址
     */
    private String endpoint;
    /**
     * 账号
     */
    private String accessKey;
    /**
     * 密码
     */
    private String secretKey;
    /**
     * 储存桶名称
     */
    private String bucketName;
 
    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}
```

测试类

```java
package com.test.mybatistest.controller;
 
import com.baomidou.mybatisplus.core.toolkit.StringPool;
import com.github.pagehelper.util.StringUtil;
import com.test.mybatistest.minio.MinioConfig;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
 
import java.io.File;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
 
@Api(tags = "Minio")
@RestController
@Slf4j
@RequestMapping("/minio")
public class MinioController {
 
    @Autowired
    private MinioClient minioClient;
 
    @Autowired
    private MinioConfig minioConfig;
 
    @Value("${minio.bucketName}")
    private String bucketName;

    /**
     * 获取文件后缀
     * @param fullName
     * @return
     */
    public static String getFileExtension(String fullName) {
        if (StringUtil.isEmpty(fullName)) return StringPool.EMPTY;
        String fileName = new File(fullName).getName();
        int dotIndex = fileName.lastIndexOf(".");
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex + 1);
    }
 
    /**
     * 文件上传
     * @param file
     * @return
     */
    @ApiOperation("文件上传-批量")
    @PostMapping("/upload")
    public Object upload(@RequestParam(name = "file", required = false) MultipartFile[] file) {
        if (file == null || file.length == 0) {
            return "上传文件不能为空";
        }
        List<Map<String, Object>> orgfileNameList = new ArrayList<>(file.length);
        for (MultipartFile multipartFile : file) {
            //1.名称
            String orgfileName = multipartFile.getOriginalFilename();
            String fileName = fileName(orgfileName);
            String path = minioConfig.getEndpoint() + '/' + bucketName + '/' + fileName;
            //2.返回信息
            Map<String, Object> fileMap = new HashMap<>();
            fileMap.put("orgName", orgfileName);
            fileMap.put("fileName", fileName);
            fileMap.put("path", path);
            orgfileNameList.add(fileMap);
            //3.文件上传
            try {
                InputStream in = multipartFile.getInputStream();
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(fileName)
                                .stream(in, multipartFile.getSize(), -1)
                                .contentType("application/octet-stream")	// 当contentType设置为application/octet-stream时，访问文件默认为下载
                                .build());
                in.close();
            } catch (Exception e) {
                return "上传失败";
            }
        }
        //4.返回
        Map<String, Object> data = new HashMap<>();
        data.put("bucket", bucketName);
        data.put("fileList", orgfileNameList);
        return data;
    }
 
    /**
     * 生成图片名称
     *
     * @param originalFilename
     * @return
     */
    public String fileName(String originalFilename) {
        StringBuffer sb = new StringBuffer();
        String yyyyMMdd = new SimpleDateFormat("yyyyMMdd").format(new Date());
        ThreadLocalRandom random = ThreadLocalRandom.current();
        String uuid = new UUID(random.nextLong(), random.nextLong()).toString().replace(StringPool.DASH, StringPool.EMPTY);
        sb.append("upload").append("/")
                .append(yyyyMMdd).append("/")
                .append(uuid).append(".")
                .append(getFileExtension(originalFilename));
        return sb.toString();
    }
}
```

更加文件后缀获取contentType

```java
package com.test.mybatistest.minio; 
import com.github.pagehelper.util.StringUtil;

/**
 * 获取文件的contentType
 */
public enum ViewContentType {
    DEFAULT("default", "application/octet-stream"),
    JPG("jpg", "image/jpeg"),
    TIFF("tiff", "image/tiff"),
    GIF("gif", "image/gif"),
    JFIF("jfif", "image/jpeg"),
    PNG("png", "image/png"),
    TIF("tif", "image/tiff"),
    ICO("ico", "image/x-icon"),
    JPEG("jpeg", "image/jpeg"),
    WBMP("wbmp", "image/vnd.wap.wbmp"),
    FAX("fax", "image/fax"),
    NET("net", "image/pnetvue"),
    JPE("jpe", "image/jpeg"),
    RP("rp", "image/vnd.rn-realpix"),
    DOC("doc", "application/msord"),
    PDF("pdf", "application/pdf");
 
    private String prefix;
    private String type;
 
    ViewContentType(String prefix, String type) {
        this.prefix = prefix;
        this.type = type;
    }
 
    public static String getContentType(String prefix) {
        if (StringUtil.isEmpty(prefix)) {
            return DEFAULT.getType();
        }
        prefix = prefix.substring(prefix.lastIndexOf(".") + 1);
        for (ViewContentType value : ViewContentType.values()) {
            if (prefix.equalsIgnoreCase(value.getPrefix())) {
                return value.getType();
            }
        }
        return DEFAULT.getType(); 
    }

    public String getPrefix() {
        return prefix;
    }
    public String getType() {
        return type;
    }
}
```

## 图床

- [PicGo下载地址](https://github.com/Molunerfinn/PicGo/releases)
- 以管理员身份运行，不然可能装不了插件
- 插件搜索 minio，进行安装
- 生成accessKey和密钥，注意保存，只能看到一次
- 设置插件
  - `endPoint`: 192.168.10.123 【必选 - Minio服务API访问的ip或域名】
  - `port`: 19000 【run.sh 脚本中的 --address】
  - `useSSl`: no【可选 - 使用SSL时打开】
  - `accessKey`: 【必选 - Minio服务用户名】
  - `secretKey`: 【必选 - Minio服务密码】
  - `bucket`: blog-image【必选 - 自建的存储桶名称】
  - `同名文件`：跳过 【默认 - 当文件名重复时设置的策略】
  - `基础目录`：【可选 - 自定义子目录文件夹】
  - `自定义域名`：xxx.com 【可选 - 图片上传成功后，返回的链接为域名】
  - `自动归档`： no【默认 - 可选择开启，PicGo程序会自动帮你按照yyyy/MM/dd的格式归档】

