# HttpUtil

## 依赖
```xml
 <dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
    <version>4.5.13</version>
</dependency>
<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpmime</artifactId>
    <version>4.5.13</version>
</dependency>
```

## 工具类
```java
package com.jd.starlink.util;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.config.ConnectionConfig;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import javax.net.ssl.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * HttpClientUtil
 * http请求工具类
 *
 * @author sunbin
 * @date 2019/7/9
 */
@Slf4j
public class HttpClientUtil {
    /**
     * httpClient
     */
    private static final HttpClient HTTP_CLIENT;

    /**
     * 默认连接超时时间
     */
    private static final int DEFAULT_CONN_TIME_OUT = 15000;
    /**
     * 默认socket超时时间
     */
    private static final int DEFAULT_SOCKET_TIME_OUT = 30000;
    /**
     * 默认请求超时时间
     */
    private static final int DEFAULT_REQ_TIME_OUT = 15000;
    
    public enum HttpMethodEnum {
        GET, POST, DELETE, HEAD, OPTIONS, PUT, TRACE;
    }
    static {
        ConnectionConfig connectionConfig = ConnectionConfig.custom().setCharset(StandardCharsets.UTF_8).build();
        HttpClientBuilder builder = HttpClientBuilder.create();
        builder.setConnectionTimeToLive(30 * 1000, TimeUnit.MILLISECONDS);
        builder.setDefaultConnectionConfig(connectionConfig);
        builder.setMaxConnPerRoute(1000);
        builder.setMaxConnTotal(1000);
        HTTP_CLIENT = builder.build();
    }

    /**
     * Description 发送post请求
     *
     * @author ZhangChaoFu(zhangchaofu @ jd.com)
     * Date 2019/3/14 10:27
     */
    private static String doPost(HttpPost httpPost) {
        try {
            HttpResponse response = HTTP_CLIENT.execute(httpPost);
//            RequestConfig requestConfig = RequestConfig.custom().setConnectTimeout(15 * 1000)
//                    .setSocketTimeout(30 * 1000).setConnectionRequestTimeout(15 * 1000).build();
//            httpPost.setConfig(requestConfig);

            HttpEntity httpEntity = response.getEntity();
            if (httpEntity == null) {
                log.error("HttpClientUtil.doPost--httpEntity--null");
                return null;
            }
            String responseString = EntityUtils.toString(httpEntity, StandardCharsets.UTF_8);
            EntityUtils.consume(httpEntity);
            return responseString;
        } catch (Exception e) {
            log.error("HttpClientUtil.doPost--exception", e);
            return null;
        }

    }

    /**
     * Description http post请求
     *
     * @param entity 请求实体
     * @return java.lang.String
     * @author ZhangChaoFu(zhangchaofu @ jd.com)
     * @date 2019-11-06
     */
    public static String doPost(RequestEntity entity) {
        HttpPost post = null;
        try {
            if (entity == null) {
                return null;
            }
            if (StringUtils.isBlank(entity.getUrl())) {
                return null;
            }
            post = new HttpPost(entity.getUrl());
            RequestConfig requestConfig = RequestConfig.custom().setConnectTimeout(entity.getConnectionTimeout())
                    .setSocketTimeout(entity.getSocketTimeout())
                    .setConnectionRequestTimeout(entity.getConnectionRequestTimeout()).build();
            post.setConfig(requestConfig);
            if (entity.getParams() != null && !entity.getParams().isEmpty()) {
                List<NameValuePair> list = new ArrayList<>(entity.getParams().size());
                entity.getParams().forEach((key, value) ->
                        list.add(new BasicNameValuePair(key, value))
                );
                post.setEntity(new UrlEncodedFormEntity(list, StandardCharsets.UTF_8));
            }
            if (entity.getHeader() != null && !entity.getHeader().isEmpty()) {
                for (Map.Entry<String, String> en : entity.getHeader().entrySet()) {
                    post.addHeader(en.getKey(), en.getValue());
                }
            }

            return doPost(post);
        } catch (Exception e) {
            log.error("HttpClientUtil.doPost--exception", e);
            return null;
        } finally {
            if (post != null) {
                post.releaseConnection();
            }
        }
    }

    /**
     * Description http post请求
     *
     * @param url    请求地址
     * @param params 请求参数
     * @return java.lang.String
     * @author ZhangChaoFu(zhangchaofu @ jd.com)
     * @date 2019-11-06
     */
    public static String doPost(String url, Map<String, String> params, Map<String, String> header) {
        RequestEntity entity = new RequestEntity();
        entity.setUrl(url);
        entity.setParams(params);
        entity.setHeader(header);
        entity.setConnectionTimeout(DEFAULT_CONN_TIME_OUT);
        entity.setSocketTimeout(DEFAULT_SOCKET_TIME_OUT);
        entity.setConnectionRequestTimeout(DEFAULT_REQ_TIME_OUT);
        return doPost(entity);
    }

    /**
     * 上传文件流 add by yezhenyue
     * @param  name 文件接收server端指定的参数名比如 file
      * @param inputStream 文件流
     * @param fileName 文件名
     * @param url server地址
     * @param params 附加key-value参数
     * @return
     */
    public static String postInputStream(String name,InputStream inputStream,String fileName, String url, Map<String, String> params, Map<String, String> headers) {
        HttpPost httpPost = new HttpPost(url);
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(5 * 1000)//链接超时时间
                .setSocketTimeout(120 * 1000)//socket读超时时间，文件上传需要设置长一点
                .setConnectionRequestTimeout(5 * 1000).build();//从链接池获取链接超时时间
        httpPost.setConfig(requestConfig);
        if (headers!=null){
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                httpPost.addHeader(entry.getKey(),entry.getValue());
            }
        }
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        builder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
        builder.setCharset(StandardCharsets.UTF_8);
        builder.addBinaryBody(name, inputStream, ContentType.MULTIPART_FORM_DATA, fileName);
        if (params != null) {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                builder.addTextBody(entry.getKey(), entry.getValue());
            }
        }

        httpPost.setEntity(builder.build());
        return doPost(httpPost);
    }
    /**
     * Description 已输入流的方式（InputStream）发送文件和其他参数
     *
     * @author ZhangChaoFu(zhangchaofu @ jd.com)
     * Date 2019/3/14 10:27
     */
    public static String postUploadFileByInputStream(InputStream is, String fileName, String url, Map<String, String> params) {
        Map<String, byte[]> images = null;
        try {
            if (is != null) {
                byte[] buffer = new byte[1024];
                int i;
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                while ((i = is.read(buffer, 0, buffer.length)) != -1) {
                    bos.write(buffer, 0, i);
                }
                byte[] bytes = bos.toByteArray();
                images = new HashMap<>(params.size() + 2);
                images.put(fileName, bytes);
            }

            return postUploadFileByByte(images, url, params);
        } catch (Exception e) {
            log.error("HttpClientUtil.postUploadFileByInputStream--exception", e);
            return null;
        }
    }

    /**
     * Description 字节流方式上传文件
     *
     * @author ZhangChaoFu(zhangchaofu @ jd.com)
     * Date 2019/3/21 11:24
     */
    public static String postUploadFileByByte(Map<String, byte[]> images, String url, Map<String, String> params) {
        try {
            HttpPost httpPost = new HttpPost(url);
            RequestConfig requestConfig = RequestConfig.custom().setConnectTimeout(5 * 1000)
                    .setSocketTimeout(5 * 1000).setConnectionRequestTimeout(5 * 1000).build();
            httpPost.setConfig(requestConfig);

            MultipartEntityBuilder multipartEntityBuilder = MultipartEntityBuilder.create();
            //这个mode参数设置很重要否则调不通算法新接口
            multipartEntityBuilder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);

            if (images != null) {
                for (Map.Entry<String, byte[]> entry : images.entrySet()) {
                    multipartEntityBuilder.addBinaryBody(entry.getKey(), entry.getValue(),
                            ContentType.MULTIPART_FORM_DATA, entry.getKey());
                }
            }

            if (params != null) {
                for (Map.Entry<String, String> entry : params.entrySet()) {
                    multipartEntityBuilder.addTextBody(entry.getKey(), entry.getValue());
                }
            }

            httpPost.setEntity(multipartEntityBuilder.build());
            return doPost(httpPost);
        } catch (Exception e) {
            log.error("HttpClientUtil.postUploadFileByByte--exception", e);
            return null;
        }
    }

    /**
     * 以application/octet-stream类型上传图片
     *
     * @param images 图片
     * @param url    上传地址
     * @param params 其他参数
     * @return java.lang.String
     */
    public static String postUploadFileByByteAndOctet(Map<String, byte[]> images, String url, Map<String, String> params) {
        try {
            HttpPost httpPost = new HttpPost(url);
            RequestConfig requestConfig = RequestConfig.custom().setConnectTimeout(5 * 1000)
                    .setSocketTimeout(5 * 1000).setConnectionRequestTimeout(5 * 1000).build();
            httpPost.setConfig(requestConfig);

            MultipartEntityBuilder multipartEntityBuilder = MultipartEntityBuilder.create();

            multipartEntityBuilder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
            if (images != null) {
                for (Map.Entry<String, byte[]> entry : images.entrySet()) {
                    multipartEntityBuilder.addBinaryBody(entry.getKey(), entry.getValue(),
                            ContentType.APPLICATION_OCTET_STREAM, entry.getKey());
                }
            }

            if (params != null) {
                for (Map.Entry<String, String> entry : params.entrySet()) {
                    multipartEntityBuilder.addTextBody(entry.getKey(), entry.getValue());
                }
            }

            httpPost.setEntity(multipartEntityBuilder.build());
            return doPost(httpPost);
        } catch (Exception e) {
            log.error("HttpClientUtil.postUploadFileByByte--exception", e);
            return null;
        }
    }

    /**
     * json参数方式POST提交
     *
     * @param url
     * @param jsonString
     * @return
     */
    public static String doPost(String url, String jsonString) {
        String strResult = "";
        HttpPost httpPost = new HttpPost(url);
        httpPost.addHeader("Content-Type", "application/json;charset=utf-8"); //添加请求头
        try {
            httpPost.setEntity(new StringEntity(jsonString, "utf-8"));
            HttpResponse resp = HTTP_CLIENT.execute(httpPost);
            HttpEntity respEntity = resp.getEntity();
            strResult = EntityUtils.toString(respEntity, "UTF-8");
            int statusCode = resp.getStatusLine().getStatusCode();
            if (statusCode != HttpsURLConnection.HTTP_OK){
                log.error("http post error url:{},params:{},result:{}",url,jsonString,strResult);
                return null;
            }
        } catch (IOException e) {
            log.error(e.getMessage(), e);
        } finally {
            httpPost.releaseConnection();
        }
        return strResult;
    }
    /**
     * json参数方式POST提交
     *
     * @param url
     * @param jsonString
     * @return
     */
    public static HttpResponse doPostRaw(String url, String jsonString) throws IOException {
        HttpPost httpPost = new HttpPost(url);
        httpPost.addHeader("Content-Type", "application/json;charset=utf-8"); //添加请求头
        try {
            httpPost.setEntity(new StringEntity(jsonString, "utf-8"));
            return HTTP_CLIENT.execute(httpPost);
        } finally {
            httpPost.releaseConnection();
        }
    }
    /**
     * 请求post,包括头信息
     * @param url
     * @param jsonString
     * @param header
     * @return
     */
    public static String doPost(String url, String jsonString,Map<String,Object> header) {
        String strResult = "";
        HttpPost httpPost = new HttpPost(url);
        httpPost.addHeader("Content-Type", "application/json;charset=utf-8"); //添加请求头
        if(header !=null){
            Iterator<Map.Entry<String,Object>> iterator = header.entrySet().iterator();
            while(iterator.hasNext()){
                Map.Entry<String,Object> entry = iterator.next();
                httpPost.addHeader(entry.getKey(),String.valueOf(entry.getValue()));
            }
        }
        try {
            httpPost.setEntity(new StringEntity(jsonString, "utf-8"));
            HttpResponse resp = HTTP_CLIENT.execute(httpPost);
            HttpEntity respEntity = resp.getEntity();
            strResult = EntityUtils.toString(respEntity, "UTF-8");
            int statusCode = resp.getStatusLine().getStatusCode();
            if (statusCode != HttpsURLConnection.HTTP_OK){
                log.error("http post error url:{},params:{},result:{}",url,jsonString,strResult);
                return null;
            }
        } catch (IOException e) {
            log.error(e.getMessage(), e);
        } finally {
            httpPost.releaseConnection();
        }
        return strResult;
    }

    /**
     * Description 输入流转为字节数组
     *
     * @param inStream 输入流
     * @return byte[]
     * @author ZhangChaoFu(zhangchaofu @ jd.com)
     * @date 2019-11-06
     */
    public static byte[] inputStream2byte(InputStream inStream)
            throws IOException {
        ByteArrayOutputStream swapStream = new ByteArrayOutputStream();
        byte[] buff = new byte[1024];
        int rc = 0;
        int len = 100;
        while ((rc = inStream.read(buff, 0, len)) > 0) {
            swapStream.write(buff, 0, rc);
        }
        return swapStream.toByteArray();
    }

    /**
     * Description 获取图片文件
     *
     * @param imgUrl 图片地址
     * @return byte[]
     * @author ZhangChaoFu(zhangchaofu @ jd.com)
     * @date 2019-11-06
     */
    public static byte[] getHttpGetImg(String imgUrl) throws Exception {
        byte[] imageBytes = null;
        URL url = new URL(imgUrl);
        URLConnection urlConnection = url.openConnection();
        if (urlConnection instanceof HttpURLConnection) {
            HttpURLConnection conn = (HttpURLConnection) urlConnection;

            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5 * 1000 * 20);
            InputStream inputStream = conn.getInputStream();
            //通过输入流获取图片数据
            imageBytes = inputStream2byte(inputStream);
        }
        return imageBytes;
    }

    /**
     * RequestEntity
     * Http请求参数太多，封装一下
     *
     * @author sunbin
     * @date 2019/7/9
     */
    @Data
    private static class RequestEntity {
        /**
         * 请求地址
         */
        private String url;
        /**
         * 请求参数
         */
        private Map<String, String> params;
        /**
         * 请求头
         */
        private Map<String, String> header;
        /**
         * 连接超时时间
         */
        private Integer connectionTimeout;
        /**
         * socket超时时间
         */
        private Integer socketTimeout;
        /**
         * 链接请求超时时间
         */
        private Integer connectionRequestTimeout;
    }
    /**
     * 验证外网URL有效性
     * @param url
     * @param methodEnum
     * @return
     */
    public static boolean validateUrl(String url,HttpMethodEnum methodEnum){
        return true;
//        try {
//
//            // 定义请求协议白名单列表
//            String[] allowProtocols = new String[]{"http", "https"};
//            boolean  protocolCheck = false;
//            URL urlObj = null;
//            try {
//                urlObj = new URL(url);
//            } catch (Exception e) {// 拒绝处理//
//                log.error(e.getMessage(),e);
//                return false;
//            }
//            // 首先进行协议校验
//            String protocol = urlObj.getProtocol();
//            for (String item : allowProtocols) {
//                if (protocol.equals(item)) {
//                    protocolCheck = true;
//                    break;
//                }
//            }
//            if (!protocolCheck){
//                log.error("URL协议错误！url={}",url);
//                return false;
//            }
//            if (protocol.equals("https")){
//                detourHttps();
//            }
//            // 设置此类是否应该自动执行 HTTP重定向（响应代码为 3xx 的请求）。
//            HttpURLConnection.setFollowRedirects(true);
//            // 到URL所引用的远程对象的连接
//            HttpURLConnection conn = null;
//            URLConnection urlConnection = urlObj.openConnection();
//            if (urlConnection instanceof HttpURLConnection) {
//                conn = (HttpURLConnection) urlConnection;
//            } else {
//                log.error("URLConnection open false url:"+url);
//                return false;
//            }
//            // 设置URL请求的方法，GET POST HEAD OPTIONS PUT DELETE TRACE
//            // 以上方法之一是合法的，具体取决于协议的限制。
//            conn.setRequestMethod(methodEnum.name());
//            // 从HTTP响应消息获取状态码
//            if (conn.getResponseCode() == HttpURLConnection.HTTP_OK || conn.getResponseCode() == HttpURLConnection.HTTP_MOVED_TEMP){
//                return true;
//            }else {
//                log.error("conn.getResponseCode() is not 200 ResponseCode:{},url:{}",conn.getResponseCode(),url);
//                return false;
//            }
//        } catch (Exception e) {
//            log.error(e.getMessage(),e);
//            return false;
//        }
    }


    /**
     * 验证外网URL有效性(更宽泛的校验 放过2XX 3XX)
     * @param url
     * @param methodEnum
     * @return
     */
    public static boolean validateUrlWidth(String url,HttpMethodEnum methodEnum){
        try {

            // 定义请求协议白名单列表
            String[] allowProtocols = new String[]{"http", "https"};
            boolean  protocolCheck = false;
            URL urlObj = null;
            try {
                urlObj = new URL(url);
            } catch (Exception e) {// 拒绝处理//
                log.error(e.getMessage(),e);
                return false;
            }
            // 首先进行协议校验
            String protocol = urlObj.getProtocol();
            for (String item : allowProtocols) {
                if (protocol.equals(item)) {
                    protocolCheck = true;
                    break;
                }
            }
            if (!protocolCheck){
                log.error("URL协议错误！url={}",url);
                return false;
            }
            if (protocol.equals("https")){
                detourHttps();
            }
            // 设置此类是否应该自动执行 HTTP重定向（响应代码为 3xx 的请求）。
            HttpURLConnection.setFollowRedirects(true);
            // 到URL所引用的远程对象的连接
            HttpURLConnection conn = null;
            URLConnection urlConnection = urlObj.openConnection();
            if (urlConnection instanceof HttpURLConnection) {
                conn = (HttpURLConnection) urlConnection;
            } else {
                log.error("URLConnection open false url:"+url);
                return false;
            }
            // 设置URL请求的方法，GET POST HEAD OPTIONS PUT DELETE TRACE
            // 以上方法之一是合法的，具体取决于协议的限制。
            conn.setRequestMethod(methodEnum.name());
            // 从HTTP响应消息获取状态码
            if (conn.getResponseCode()>= HttpURLConnection.HTTP_OK && conn.getResponseCode()<HttpURLConnection.HTTP_BAD_REQUEST){
                return true;
            }else {
                log.error("conn.getResponseCode() is not 200 ResponseCode:{},url:{}",conn.getResponseCode(),url);
                return false;
            }
        } catch (Exception e) {
            log.error(e.getMessage(),e);
            return false;
        }
    }

    /**
     * 由于引入了安全部加密SDK TDEClient，该类初始化时会加载自己的证书，影响系统证书读取，在发起https请求之前需要修正系统SSL配置
     */
    public static void detourHttps(){

        TrustManager[] trustAllCerts;

        try {

            trustAllCerts = new TrustManager[]{new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[]{};
                }

                public void checkClientTrusted(X509Certificate[] chain, String authType)
                        throws CertificateException {
                }

                public void checkServerTrusted(X509Certificate[] chain, String authType)
                        throws CertificateException {
                }
            }};
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

            // Create all-trusting host name verifier
            HostnameVerifier allHostsValid = new HostnameVerifier() {
                public boolean verify(String hostname, SSLSession session) {
                    return true;
                }
            };

            // Install the all-trusting host verifier
            HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```