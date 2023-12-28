# Postman

## 统一添加请求头
- 在 `folder(文件夹)`或 `collection(集合)` 中添加 Pre-request Script
    - 一个一个添加
    ```js
    pm.request.headers.add(
        {
            disabled: false,
            key: "Cookie",
            value: pm.globals.get('Cookie')
        }
    )
    ```
    - 批量添加
    ```js
    const headers = [
        {
            key: "loginMode",
            value: 0
        }, {
            key: "Cookie",
            value: pm.globals.get('Cookie')
        },{
            key: "siteId",
            value: 22
        }
    ]

    headers.forEach(h=>{
        pm.request.headers.add(h)
    })
    ```