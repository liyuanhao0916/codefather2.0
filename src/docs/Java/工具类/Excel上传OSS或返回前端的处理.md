## Excel上传OSS

```java
// 构造表格实体 XSSFWorkbook
XSSFWorkbook wb = exportAllExcel(sheetNames, titleName, headers, dataLists, pattern, isExportNullField);

// 创建输出流，方便使用 XSSFWorkbook 的 write(OutputStream os)方法，来拿到字节对象
ByteArrayOutputStream bos = new ByteArrayOutputStream();

// 写到一个输出流
wb.write(bos);

// 拿到输出流，即表格的字节数组
byte[] bytes = bos.toByteArray();

// 放到输入流
InputStream inputStream = new ByteArrayInputStream(bytes);
```

## Excel返回前端

```java
// 构造表格实体 XSSFWorkbook
XSSFWorkbook wb = exportAllExcel(sheetNames, titleName, headers, dataLists, pattern, isExportNullField);

// 设置响应的类型、编码和文件名称
try {
    response.reset();
    response.setContentType("application/msexcel");// 设置生成的文件类型
    response.setCharacterEncoding("UTF-8");// 设置文件头编码方式和文件名
    // 在浏览器中测试生效，postman中文件名为response,无法修改
    response.setHeader("Content-disposition", "attachment;filename="
            .concat(String.valueOf(URLEncoder.encode(replaceSpecStr(fileName) + ".xlsx", "UTF-8"))));
    // 此设置，可保证web端可以取到文件名
    response.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
} catch (Exception ex) {
    ex.printStackTrace();
}

ServletOutputStream out = null;
try {
    // 拿到 response 中的输出流
    out = response.getOutputStream();
    // 将实体写到输出流
    wb.write(out);
} catch (IOException e) {
    e.printStackTrace();
} finally {
    try {
        out.flush();
        out.close();
        wb.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

