# VS Code

## 插件
### background 
- Mac 报错`read-only file system, access`
    - 终端运行
    ```sh
    sudo /Applications/Visual\ Studio\ Code.app/Contents/MacOS/Electron
    ```
- Ubuntu 报错
    - 终端运行 加权限
    ```sh
    sudo chmode -R 777 /usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.css
    ```