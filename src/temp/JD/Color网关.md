[TOC]

## 发布

### http接口

#### 表单说明

[API接入中台](http://color.jd.com/api/publish/list)

| 表单项       | 填写内容                                                | 说明                                                         |
| :----------- | :------------------------------------------------------ | ------------------------------------------------------------ |
| ZONE         | 网关入口地址，                                          | [网关调用环境](https://cf.jd.com/pages/viewpage.action?pageId=657840473)：预发布环境:beta-api.m.jd.com、线上环境:api.m.jd.com |
| API名称      | 申请的接口名称，同一ZONE下，API名称唯一（即functionId） |                                                              |
| 后端请求域名 | 所申请接口的后端请求域名                                | manage-xlyf.jd.com，和请求路径拼接在一起即请求的url          |
| 后端请求Path | 所申请接口的后端请求路径                                | /api/v1/sysUser/getCurrentUser                               |
| Http method  | 请求方式，选择自动适配时请求方式与调用方一致            |                                                              |
| 后端请求超时 | 超时时间，最大10,000ms                                  |                                                              |
| Mock         | 是否开启模拟的请求                                      | 用于后端接口未完成时的调试，开启时不会调后端，直接返回自定的内容，即Mock返回结果 |
| Mock返回结果 | 与Mock搭配使用                                          |                                                              |
| 参与人       | 可查看、编辑、调试、接受报警信息                        | [【接收报警设置】](https://cf.jd.com/pages/viewpage.action?pageId=801849538) |
| 描述         |                                                         |                                                              |
| 文档地址     | 接口文档的url                                           |                                                              |
| 数据安全等级 |                                                         |                                                              |
| 敏感标签     | 【反爬】对应的敏感数据的标签                            |                                                              |

#### 接口定义/改造

- 前端，将参数封装为body

- 后端，定义一个实体，解析body，拿到具体的参数内容

#### 请求头参数

| 参数名             | 描述                                                         | 备注                                                         |
| :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| X-WSM小号识别标识  | 【神盾】上海防刷小号接口返回的风险信息：X-WSM: level=1       | level：小号后端评估的风险级别，level>0时为风险流量<br>type：类型，例：1（网关黑名单） |
| X-WAAP反爬识别标识 | 【神盾】安全部waap 反爬接口返回的风险信息：比如：X-WAAP: level=1 | level：waap后端评估的风险级别，level>0时为风险流量<br>type：类型，例：1（网关黑名单） |
| X-TARGET-UNIT      | （仅在开启单元化的接口中下发）单元化标识                     |                                                              |
| X-RCS风控识别标识  | 【神盾】风控接口返回的风险信息：比如：X-RCS: level=1;type=0  | level：风控后端评估的风险级别，level>0时为风险流量type：类型，例：0（风控白名单），1（网关黑名单） |
| X-MLAAS-AT         | 客户端请求网关携带的全链路监控头部信息，API网关会直接透传至后端服务 |                                                              |
| X-API-Request-Id   | 用户请求唯一标识，由API网关生成                              |                                                              |
| X-API-Login-Passed | （仅在开启单元化的接口中下发）当前用户是否已登录             |                                                              |
| User-Agent         | 固定值为“api”，非前端传入网关的User-Agent。前端传入的User-Agent请通过http param参数中的agent获取 |                                                              |
| R-Forwarded-For    | 用户真实IP                                                   |                                                              |
| Origin             | 透传前端origin                                               |                                                              |
| h5sr               | 【神盾】接口加固验签结果（只有开启接口加固的应用调用API时才会生成，不要强依赖） | h5sr=200 表示验签通过，其他情况为风险流量                    |
| Cookie             | 透传前端cookie                                               |                                                              |
| Connection         | 网关与后端服务链接活跃状态                                   |                                                              |
| Accept-Encoding    | 标识压缩标识值为"gzip, br"或者"gzip"                         |                                                              |

#### 请求参数

[详细请求参数](https://cf.jd.com/pages/viewpage.action?pageId=656171940)

| 参数名    | 描述                                                     | 示例                                         |
| :-------- | :------------------------------------------------------- | :------------------------------------------- |
| **body**  | 透传，**这是一个名称为"body"的参数，业务逻辑都放这里面** | body={"username": "XXXX","password": "1234"} |
| client    | 透传，客户端类型                                         | H5、Native、微信小程序                       |
| `usid`    | 透传                                                     |                                              |
| `appName` | 透传                                                     |                                              |
| `t`       | 透传，请求时间戳                                         |                                              |
| pin       | 网关实时验证用户登录态，若通过则会产生pin                |                                              |

### jsf接口

#### 表单说明

[API接入中台](http://color.jd.com/api/publish/list)

| 表单项       | 填写内容                                                | 说明                                                         |
| :----------- | :------------------------------------------------------ | ------------------------------------------------------------ |
| ZONE         | 网关入口地址                                            | [网关调用环境](https://cf.jd.com/pages/viewpage.action?pageId=657840473)：预发布环境:beta-api.m.jd.com、线上环境:api.m.jd.com |
| API名称      | 申请的接口名称，同一ZONE下，API名称唯一（即functionId） |                                                              |
| 内容类型     | 响应头中的Content-Type，包含MIME和字符编码              | text/plain ：纯文本格式、<br>application/json：json格式、<br>application/xml ： XML格式、<br>application/octet-stream ： 二进制流文件<br>image/png：png图片格式<br>image/jpg ：jpg图片格式 |
| JSF接口名称  | JSF接口的全限定类名                                     | 定位：JSF接口名称+别名+方法名                                |
| JSF方法名称  | 对应方法名                                              |                                                              |
| JSF别名      | 唯一                                                    |                                                              |
| 后端请求超时 | 超时时间，最大10,000ms                                  |                                                              |
| Mock         | 是否开启模拟的请求                                      | 用于后端接口未完成时的调试，开启时不会调后端，直接返回自定的内容，即Mock返回结果 |
| Mock返回结果 | 与Mock搭配使用                                          |                                                              |
| 参与人       | 可查看、编辑、调试、接受报警信息                        | [【接收报警设置】](https://cf.jd.com/pages/viewpage.action?pageId=801849538) |
| 描述         |                                                         |                                                              |
| 文档地址     | 接口文档的url                                           |                                                              |
| 数据安全等级 |                                                         |                                                              |
| 敏感标签     | 【反爬】对应的敏感数据的标签                            |                                                              |

#### 接口定义/改造

- JSF别名只能有一个，不同机房使用的别名是同一个
- 方法入参只能有一个，类型为 Map<String, Object>，网关会把所有参数都放到该map中
- 返回类型不限

#### 调用流程

- 根据【JSF接口名称】和【JSF别名】在[JSF系统](http://taishan.jd.com/jsf/interfaceList)中查看服务提供方状态是否正常

- 网关将[调用API](https://cf.jd.com/pages/viewpage.action?pageId=655715296)中传的参数进行解析，解析后的参数和[http请求参数](#请求参数)大致相同，并将该参数放到map中，作为入参传入方法中
- JSF通过【JSF接口名称】和【JSF别名】和【JSF方法名称】定位到对应的方法执行

## 管理

### 未登录拦截

【API管理】--> 【更多操作】--> 【登录态】

拦截策略：针对引用的应用，设置拦截，返回结果由网关直接返回客户端，需要确保兼容配置的返回接口

### 神盾

功能入口：【Color网关】-【API管理】-【神盾配置】 http://color.jd.com/api/publish/list

#### 【接口加固】

- **接入SDK** --- 如果不接入SDK，加固无法生效

  | SDK类型    | SDK接入说明                                                  | 常见问题                                                     |
  | :--------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
  | H5、小程序 | [2、接口加签客户端（H5、小程序、PC）接入说明](https://cf.jd.com/pages/viewpage.action?pageId=591644560) | [1.2 Q&A](https://cf.jd.com/pages/viewpage.action?pageId=655720262) |
  | APP        | [3、JDGuard SDK接入指南](https://cf.jd.com/pages/viewpage.action?pageId=655718692) | [Q&A](https://cf.jd.com/pages/viewpage.action?pageId=985090082) |

- 开启接口加固：【Color网关】-【API管理】-【神盾配置】-【接口加固】

- 到waap([http://waap.jd.com](http://waap.jd.com/))申请验签ID 

  - 加固申请
    - 业务描述：业务场景、接口行为
    - 加固接口：color网关格式：1001_appid_functionid
    - 平台类型：H5、原生微信小程序
  - 在【加固列表】页面查看businessId
  - 正常情况下，创建和编辑加固接口时，**会自动同步到预发环境。如果出现自动同步失败消息，请将 5 位 businessId 发给 weiheli 进行人工同步**

- [前端集成组件](https://cf.jd.com/pages/viewpage.action?pageId=591644560) ---- 接入步骤 3

- 业务接口增加h5st字段

  > h5st字段为’密钥及接口签名‘字段，前端业务请求需要将h5st字段添加到前端请求中，h5st为一级参数，不要嵌套在其他参数里，带有h5st的业务请求发送到color网关验签

-  Color网关风险判定

  >  **验签结果h5sr字段**，color网关对业务请求进行验签，然后会在原请求中新增h5sr字段。h5sr字段值为int类型的枚举值，h5sr=200 则表示验签成功。其他均为异常

- 若接入了【天网--风控】组件

  - 业务后端将h5sr透传到风控
    1. color网关只做风险判定，判定结果会通过h5sr字段下发到业务后端。
    2. 业务后端接入风控的"RCS风险识别服务"，将h5sr字段透传到风控。**接入RCS前请联系李雯（liwen453）、马思佳（masijia1）**。请参考[RCS风险识别服务-接口文档](https://cf.jd.com/pages/viewpage.action?pageId=552652069)中extendMap字段。
    3. 业务后端不要只根据h5sr字段进行处置，否则将增大与黑产的对抗强度，接入风控可以有灵活的处置策略和更多维度的风险信息来对抗黑产

- **业务自测（必须）：**

  > 业务**严格按照文档**对接完毕后请参考[1.5 前端研发自测用例](https://cf.jd.com/pages/viewpage.action?pageId=744290187)完成自测。一定要认真完成，否则上线后造成的误判后果会很严重

- **生产环境开关开启（必须）：**

  请业务方完成以上步骤以及接口上线后，联系zhuyi17校验线上数据情况，**如无问题才会打开线上识别开关，开启正常识别！**

- **接口加固参数要求：[神盾接入-参数规范说明](https://cf.jd.com/pages/viewpage.action?pageId=979838883)**

  > - H5、小程序的接口需必传h5st字段，APP的接口需必传jdgs字段，不传则会被网关进行拦截处理（熔断、排队、Mock）
  >
  > - 可针对请求header中h5sr字段进行校验，返回200表示验签通过，其他皆未通过验签识别

#### 【神盾防刷】

神盾防刷主要包含三个组件：【WAAP--反爬】、【天神--小号】、【天网--风控】

接入流程如下：

- **【神盾开关配置】**

  如果是接入反爬，需要额外进行

  - 业务接口需要到waap([http://waap.jd.com](http://waap.jd.com/))"接口管理→接口列表"进行接口登记

  - “反爬业务->反爬列表”进行反爬申请，申请字段填写说明：
    - businessID需填写1001_API名称，举例说明：在申请时，若接口API名称为：housekeeping_receiveCoupons；则登记时 【businessid】须填【1001_housekeeping_receiveCoupons】
    - url填写：https://api.m.jd.com/api?functionId=xxx ；xxx换成API名

  - 当Color控制台WAAP进入【预接入】模型预热环节时，请及时确认WAAP T+1 识别报告是否生成，生成并确认报告后才可完成申请并生效

- **【风险流量处置配置】**-【基础拦截配置】**（必须）**
  - 拦截策略：**按等级不稳定，选按比例**
  - 拦截手段
    - 熔断：直接进行熔断处理，不再向下传输；返回http状态码:403
    - 排队：首先客户端必须支持 "code": "601"错误码；Color网关会返回状态码200，当Color网关返回排队后，客户端会弹窗提示文案，倒计时结束后会重新发起请求
    - Mock：当选择Mock后，实际流量不会被传到服务端，在Color网关侧会被直接拦截并返回Mock结果；您可以自定义编辑Mock的前端界面返回结果，支持json格式输入
  - 黑名单：用于测试，直接按拦截手段拦截，不会下传到【反爬】、【小号】、【风控】等安全系统，当三个系统的黑名单有同一个pin时，随机选择一种拦截手段返回

- **【风险流量处置配置】**-【自定义路由】（**可选**）

- **【其他高级配置】**-【风险流量单元化路由】**（可选）**
  - 风险流量会根据不同的单元直接路由，如：勾选了广州单元，即广州的风险流量将直接路由至广州单元；各单元的地址前缀会进行拼接

  - **前置条件**：接口必须在Color【发布方】-【编辑】-【单元化】功能中开启单元化，且暂不支持JSF接口

- [参数说明](https://cf.jd.com/pages/viewpage.action?pageId=979838883)

### 行为验证码

- 轻验证：不阻断业务流程，用户直接点跳过也可以继续下一步，适用于风险较低的业务
- 强验证会阻断业务数据，要求用户必须校验通过，才能进行下一步操作

- 前提：接入了反爬、小号、风控三方中至少一方

- 神盾能力的优先级：风控白名单 > 神盾拦截 > 验证码加验 > 放过

> 如果多个API都触发验证码，如何避免APP同时弹出多个验证码弹框？
>
> 1）**轻验证**：在APP网络库进行接入时，需要做频次限制，保证同一时间只弹1次弹框。网关返回Header中X_Verify_Add=1代表触发验证码，同时X_Verify_Expire的值代表服务器当前时间戳。APP网络层需要记下本次X_Verify_Expire时间戳V1，并且自配置过期时长（比如30分钟）。当后续请求网关再次返回触发验证码，也会返回新的X_Verify_Expire服务器时间戳V2，网络层需要判断：如果V2 > V1+过期时长，才可以弹窗，否则APP网络层不弹窗（如果不弹窗，在下次网关时，需要带上lmt字段：1代表被APP频次限制，2代表没限制）。
>
> 2）**强验证**：强验证由业务方客户端开发直接接入验证码SDK，强验证SDK中会保证同时间只允许弹1个验证码弹窗。

#### 强验证

- 验证码业务申请：前往jcp平台申请申请AppID和AppSecret，AppSecret用于生成后台调用接口的签名参数：http://jcp.jd.com/admin

- 接入SDK

  | 客户端类型 | 接入文档                                                     |
  | :--------- | :----------------------------------------------------------- |
  | H5页/M页   | **[验证码M端接入文档](https://cf.jd.com/pages/viewpage.action?pageId=589894564&src=contextnavpagetreemode)** |
  | 微信小程序 | [小程序接入小程序验证码插件](https://cf.jd.com/pages/viewpage.action?pageId=589894561&src=contextnavpagetreemode) [小程序接入验证码源码](https://cf.jd.com/pages/viewpage.action?pageId=589894562&src=contextnavpagetreemode) |
  | 安卓       | [Android接入原生验证码sdk](https://cf.jd.com/pages/viewpage.action?pageId=589894547) |
  | iOS        | [iOS接入原生验证码sdk](https://cf.jd.com/pages/viewpage.action?pageId=589894552) |
  | PC         | [验证码PC接入文档](https://cf.jd.com/pages/viewpage.action?pageId=589894567&src=contextnavpagetreemode) |

- 服务端接入：[强验证服务端接入文档](https://cf.jd.com/pages/viewpage.action?pageId=656163177)

  （其中主要关注 「3.3 藏经阁申请接口」、「3.4.后台部署验证」、「4.接口接入说明」）

- 开启网关后台开关：进入[color.jd.com](http://color.jd.com/)打开验证码功能开关

- 申请打开灰度范围开关：提交工单：http://xbp.jd.com/22/apply/8411

- 开启模型策略

  告知神盾侧运营已接入验证码（masijia1），由运营侧与模型侧沟通打开验证码策略。（如果模型侧不开启，无法触发验证码逻辑）

- 完成以上步骤，并且APP发版后，验证码功能生效

#### 轻验证

- APP网络库统一接入SDK --- 如果APP网络库中已接入过轻验证SDK，可绕过此步骤

  - [Android接入验证码SDK（神盾-轻验证）](https://cf.jd.com/pages/viewpage.action?pageId=655709091)

  - [iOS接入验证码SDK（神盾-轻验证）](https://cf.jd.com/pages/viewpage.action?pageId=655709381)

- 开启网关后台开关：进入[color.jd.com](http://color.jd.com/)打开验证码功能开关

- 申请打开灰度范围开关：提交工单：http://xbp.jd.com/22/apply/8411

- 开启模型策略

  告知神盾侧运营已接入验证码（masijia1），由运营侧与模型侧沟通打开验证码策略。（如果模型侧不开启，无法触发验证码逻辑）

- 完成以上步骤，并且APP发版后，验证码功能生效

#### 强验证后端接入

- 藏经阁申请接口接入：业务（http://cjg.jd.com/）申请接口（com.jd.jcap.export.JCaptchaService），按实际情况填写QPS等参数，申请后联系产品 张志芳（zhangzhifang1）或 卞景帅（bianjingshuai）审核

- 后台部署验证：业务后台需要接入getSessionId和verifyToken两个接口，具体调用哪一接口依赖网关透传到业务服务端的参数

  > 验证token(verify_token)随表单提交到业务后台后，业务后台需要将验证数据发送到验证码系统后台做二次校验，以确保该次验证是有效且是最近完成的

  ```java
  /**
   * @param extVerify 需要客户端需要弹出验证码标识,needCaptcha存在时，需要请求验证码系统申请sessionid,1：加验 0：不加验
   * @param vt 验证码系统下发token，需要请求验证码系统进行token校验
   * @param vsid 验证码sessionid
   * 当sessionId及verifyToken 均存在时需要请求验证码系统校验token，如果token有效，正常流程，无效阻断当前流程
   * 以上参数均有网关透传,当vf存在且值为1时，业务方需要实现getsessionid的请求，并将sessionid值返回客户端，用于渲染图形验证码
   * 当vt及vsid存在时，业务需要实现校验verifytoken的逻辑，根据token校验结果，判断业务是否正常进行
   * @return 返回值
   */
  public Object cartRemove(String extVerify,String vt,String vsid)
  {
      if (extVerify.equals("1"))
      {
          //申请sessionid
          getsessionid();
          return  sid;
      }
      if (!vt.isEmpty() && !vsid.isEmpty())
      {
          //verifyToken 校验token
          verifyToken();
          if(verifyToken校验失败)
          {
              return 校验失败;
          }
      }
      //购物车删除正常流程
      cartRemove();
      return 结果;
  }
  ```

- 接口说明

  - 依赖

    ```xml
    <dependency>
       <groupId>com.jd.jcap</groupId>
       <artifactId>jcap-rpc-export</artifactId>
       <version>0.0.1-SNAPSHOT</version>
    </dependency>
    ```

  - 预发环境jsf配置：

    ```xml
    <jsf:consumer id="jCaptchaService" interfacecom.jd.jcap.export.JCaptchaService" protocol="jsf" alias="pre" timeout="5000">
      <!-- 藏经阁生成token -->
      <jsf:parameter key="authToken" value="token值" hide="true" />
      <!-- 客户端应用英文名（需与申请中的一致） -->
      <jsf:parameter key="clientName" value="应用名" hide="true" />
      <!--JSF分组名 -->
      <jsf:parameter key="alias" value="别名" hide="true" />
    </jsf:consumer>
    ```

  - 业务后台申请sessionid接口、业务后台校验verifytoken接口

  - > **注意：**
    >
    > - **降级：业务方在接入时，应添加验证码服务降级开关，以防止验证码服务出现故障时，对业务系统造成影响**
    >
    > - **sessionid：sessionid一次一用，再会话时，应该重新申请sessionid，sessionid存在一定的有效期，复用sessionid可能造成sessionid状态不一致，从而导致校验出现错误**

     请求参数说明

    | 字段         | 类型                | 必填 | 说明           | 备注   |
    | :----------- | :------------------ | :--- | :------------- | :----- |
    | captchaParam | CaptchaParam        | Y    | 验证码参数     |        |
    | clientInfo   | ClientInfo          | Y    | 客户端数据参数 |        |
    | extend       | Map<String, String> | Y    | 扩展字段       | 可为空 |

    1）captchaParam参数说明

    | 参数      | 类型       | 必填  | 备注                                                         |
    | :-------- | :--------- | :---- | :----------------------------------------------------------- |
    | appid     | Long       | Y     | 业务id                                                       |
    | ts        | Long       | Y     | 当前时间戳（毫秒）                                           |
    | sign      | String     | Y     | 签名，由appid=xxx&secret=xxx&ts=xxx再拼接上md5_salt串之后进行md5（32位，不区分大小写） |
    | version   | String     | Y     | 版本，固定值，填2                                            |
    | uid       | String     | Y     | 用户pin                                                      |
    | client    | String     | Y     | 验证码系统接入时客户端类型 ios android m wxapp pc jdminapp，其中jdminapp为京东小程序，m为移动端h5页面 |
    | phone     | String     | N     | 用户手机号                                                   |
    | email     | String     | N     | 用户邮箱                                                     |
    | **token** | **String** | **N** | **提交后台校验的token，getsessionid接口token为空**           |
    | **sid**   | **String** | **N** | **验证码会话id，getsessionid接口sid为空**                    |

    > 其中md5_salt=dzHdg!axOg537gYr3zf&dSrvm@t4a+8F
    >
    > sign计算方法示例：
    >
    > 如果appid=20000,secret=abcdefg,ts=1530754360409，那么sign=md5(appid=20000&secret=abcdefg&ts=1530754360409dzHdg!axOg537gYr3zf&dSrvm@t4a+8F)

    2) clientInfo参数说明

    参考网关参数

    | 参数名        | 类型   | 必填 | 描述                                                         |
    | :------------ | :----- | :--- | :----------------------------------------------------------- |
    | client        | String | Y    | 客户端类型                                                   |
    | clientVersion | String | Y    | 客户端版本                                                   |
    | build         | String | Y    | 客户端小版本号                                               |
    | uuid          | String | Y    | 客户端设备号                                                 |
    | osVersion     | String | Y    | 客户端操作系统版本                                           |
    | screen        | String | Y    | 客户端屏幕尺寸                                               |
    | networkType   | String | Y    | 请求网络类型                                                 |
    | partner       | String | Y    | 合作伙伴                                                     |
    | forcebot      | String | Y    | 全链路测试标识，压测时使用                                   |
    | pin           | String | Y    | 网关实时验证用户登录态，若通过则会产生pin                    |
    | ip            | String | Y    | 用户源IP地址                                                 |
    | port          | String | Y    | 用户源端口号                                                 |
    | location      | String | Y    | 根据用户ip计算出的附加信息（不一定能获取到，有降级可能，不要强依赖），格式为"国家_省份_城市_运营商"，示例：中国_湖南_长沙_电信 |
    | umg           | String | Y    | 用户会员级别（不一定能获取到，有降级可能，不要强依赖）       |
    | urg           | String | Y    | 用户风险级别（不一定能获取到，有降级可能，不要强依赖）       |
    | upg           | String | Y    | plus级别（不一定能获取到，有降级可能，不要强依赖）           |
    | d_brand       | String | Y    | 设备品牌                                                     |
    | d_model       | String | Y    | 设备型号                                                     |
    | lang          | String | Y    | 语言 中：zh_CN 英：en_US 泰：th_TH                           |
    | loginType     | String | Y    | 登录态类型                                                   |
    | wqDefault     | String | Y    | 微信手Q用户标识， true是默认用户， false为非默认             |
    | wifiBssid     | String | Y    | WIFI bssid                                                   |
    | referer       | String | Y    | 前端请求携带的HTTP Referer                                   |
    | agent         | String | Y    | 前端请求携带的User-Agent                                     |
    | scope         | String | Y    | vpn/代理,00:vpn关闭,01:vpn开启,10:网络代理关闭,11:网络代理开启 |
    | joycious      | String | Y    | 京享值                                                       |
    | eid           | String | Y    | 设备指纹ID，设备指纹生成的唯一标识                           |
    | rfs           | String | Y    | 精细化降级结果                                               |
    | aid           | String | Y    | Android ID，Android系统提供的设备标识符                      |
    | oaid          | String | Y    | 移动安全联盟SDK提供的开放匿名设备标识符                      |
    | sdkVersion    | String | Y    | SDK版本号                                                    |
    | uts           | String | Y    | 用户标签加密串                                               |
    | h5st          | String | Y    | H5应用验签结果（只有H5类型且开启接口加固的应用调用API时才会生成，不要强依赖） |

    > 降级结果说明：
    >
    > Result(data=null, code=16800, s_code=10000, message=服务已降级, success=false)
    >
    > 当s_code = 1000 且code = 16800时，服务端已降级

  - > **注意：**
    >
    > - **降级：业务方在接入时，应添加验证码服务降级开关，以防止验证码服务出现故障时，对业务系统造成影响**
    >
    > - **sessionid：sessionid一次一用，再会话时，应该重新申请sessionid，sessionid存在一定的有效期，复用sessionid可能造成sessionid状态不一致，从而导致校验出现错误**

  -  请求参数说明

  - | 字段         | 类型                | 必填 | 说明           | 备注   |
    | :----------- | :------------------ | :--- | :------------- | :----- |
    | captchaParam | CaptchaParam        | Y    | 验证码参数     |        |
    | clientInfo   | ClientInfo          | Y    | 客户端数据参数 |        |
    | extend       | Map<String, String> | Y    | 扩展字段       | 可为空 |

  - 1）captchaParam参数说明

  - | 参数      | 类型       | 必填  | 备注                                                         |
    | :-------- | :--------- | :---- | :----------------------------------------------------------- |
    | appid     | Long       | Y     | 业务id                                                       |
    | ts        | Long       | Y     | 当前时间戳（毫秒）                                           |
    | sign      | String     | Y     | 签名，由appid=xxx&secret=xxx&ts=xxx再拼接上md5_salt串之后进行md5（32位，不区分大小写） |
    | version   | String     | Y     | 版本，固定值，填2                                            |
    | uid       | String     | Y     | 用户pin                                                      |
    | client    | String     | Y     | 验证码系统接入时客户端类型 ios android m wxapp pc jdminapp，其中jdminapp为京东小程序，m为移动端h5页面 |
    | phone     | String     | N     | 用户手机号                                                   |
    | email     | String     | N     | 用户邮箱                                                     |
    | **token** | **String** | **N** | **提交后台校验的token，getsessionid接口token为空**           |
    | **sid**   | **String** | **N** | **验证码会话id，getsessionid接口sid为空**                    |

  - > 其中md5_salt=dzHdg!axOg537gYr3zf&dSrvm@t4a+8F
    >
    > sign计算方法示例：
    >
    > 如果appid=20000,secret=abcdefg,ts=1530754360409，那么sign=md5(appid=20000&secret=abcdefg&ts=1530754360409dzHdg!axOg537gYr3zf&dSrvm@t4a+8F)

  - 2) clientInfo参数说明

  - 参考网关参数

  - | 参数名        | 类型   | 必填 | 描述                                                         |
    | :------------ | :----- | :--- | :----------------------------------------------------------- |
    | client        | String | Y    | 客户端类型                                                   |
    | clientVersion | String | Y    | 客户端版本                                                   |
    | build         | String | Y    | 客户端小版本号                                               |
    | uuid          | String | Y    | 客户端设备号                                                 |
    | osVersion     | String | Y    | 客户端操作系统版本                                           |
    | screen        | String | Y    | 客户端屏幕尺寸                                               |
    | networkType   | String | Y    | 请求网络类型                                                 |
    | partner       | String | Y    | 合作伙伴                                                     |
    | forcebot      | String | Y    | 全链路测试标识，压测时使用                                   |
    | pin           | String | Y    | 网关实时验证用户登录态，若通过则会产生pin                    |
    | ip            | String | Y    | 用户源IP地址                                                 |
    | port          | String | Y    | 用户源端口号                                                 |
    | location      | String | Y    | 根据用户ip计算出的附加信息（不一定能获取到，有降级可能，不要强依赖），格式为"国家_省份_城市_运营商"，示例：中国_湖南_长沙_电信 |
    | umg           | String | Y    | 用户会员级别（不一定能获取到，有降级可能，不要强依赖）       |
    | urg           | String | Y    | 用户风险级别（不一定能获取到，有降级可能，不要强依赖）       |
    | upg           | String | Y    | plus级别（不一定能获取到，有降级可能，不要强依赖）           |
    | d_brand       | String | Y    | 设备品牌                                                     |
    | d_model       | String | Y    | 设备型号                                                     |
    | lang          | String | Y    | 语言 中：zh_CN 英：en_US 泰：th_TH                           |
    | loginType     | String | Y    | 登录态类型                                                   |
    | wqDefault     | String | Y    | 微信手Q用户标识， true是默认用户， false为非默认             |
    | wifiBssid     | String | Y    | WIFI bssid                                                   |
    | referer       | String | Y    | 前端请求携带的HTTP Referer                                   |
    | agent         | String | Y    | 前端请求携带的User-Agent                                     |
    | scope         | String | Y    | vpn/代理,00:vpn关闭,01:vpn开启,10:网络代理关闭,11:网络代理开启 |
    | joycious      | String | Y    | 京享值                                                       |
    | eid           | String | Y    | 设备指纹ID，设备指纹生成的唯一标识                           |
    | rfs           | String | Y    | 精细化降级结果                                               |
    | aid           | String | Y    | Android ID，Android系统提供的设备标识符                      |
    | oaid          | String | Y    | 移动安全联盟SDK提供的开放匿名设备标识符                      |
    | sdkVersion    | String | Y    | SDK版本号                                                    |
    | uts           | String | Y    | 用户标签加密串                                               |
    | h5st          | String | Y    | H5应用验签结果（只有H5类型且开启接口加固的应用调用API时才会生成，不要强依赖） |

  - > 降级结果说明：
    >
    > Result(data=null, code=16800, s_code=10000, message=服务已降级, success=false)
    >
    > 当s_code = 1000 且code = 16800时，服务端已降级

### 路由

#### API单元化

- 了解单元化[架构方案](https://cf.jd.com/pages/viewpage.action?pageId=350713748)
- HTTP接口：提前准好四个单元的子域名，并保证可正常服务。申请方式参考：[申请单元化子域名方式](https://cf.jd.com/pages/viewpage.action?pageId=445925475)
- JSF接口：请前往JSF平台开启单元化配置：[JSF单元化用户使用手册](https://cf.jd.com/pages/viewpage.action?pageId=356345733)，在泰山平台进行单元化配置：[Origin设置JSF单元化用户手册](https://cf.jd.com/pages/viewpage.action?pageId=463082435)（备注：下述配置说明等皆为http接口相关内容）

- 开通：[API管理](http://color.jd.com/api/publish/list) --- 编辑 --- 开启单元化

  > 单元化切量逻辑为单元化架构委员会决策并统一调度，如果在网关开启单元化开关后，会直接生效。请务必提前在预发布测试并保证线上单元化子集群能正常服务

#### 灰度

- [【API管理】](http://color.jd.com/api/publish/list)--- 更多操作 --- 灰度
- 定点测试：指定设备/指定pin的请求路由到指定的url
- 流量切分：指定百分比的流量路由到指定的url

#### AB实验

- [试金石](http://ab.jd.com/)中创建实验，**在实验管理->基本信息→高级配置中开启绑定其他产品线，关联到"Color网关管理业务实验"上**

- [【API管理】](http://color.jd.com/api/publish/list)--- 更多操作 --- AB实现，新增一条实验，一个API最大支持增加10条实验

  | 功能     | 说明                                                         |
  | -------- | ------------------------------------------------------------ |
  | 切流逻辑 | 基础切流：网关会默认按照**该实验在试金石平台**配置的分流逻辑做切流 |
  | 实验ID   | 该字段用于绑定实验，需输入在试金石平台所创建的实验ID         |
  | 实验信息 | 当输入正确有效的实验ID后，网关会通过实验ID**展示**试金石平台所配置的实验信息 |
  | 实验路由 | 网关会将实验所分流的流量，按照实验路由地址来路由             |

- 实验路由仅可生效一个实验，**不支持多个实验都同时开启路由开关**

- 基于实验的流量网关会进行**打标**来对流量进行区分

  参数为expInfo，json结构，key是实验id，value是实验结果，就是版本值，如

  ```json
  "expInfo":"{\"ColorAB_3692\":\"base\",\"ColorAB_3602\":\"B\"}"
  ```

#### 规则配置

- 先在[规则管理](http://color.jd.com/webapi/rule/ruleManager/#/rule/list)中添加规则
- 可用于**路由、AB实验、限流**
- client=H5透传，客户端类型
- clientVersion透传，客户端版本
- scval透传，场景定制参数，业务扩展字段，可配合客户端自定义
-  appid透传，本次请求的调用方id

#### 路由配置

- 选择规则
- 路由到的域名+路径
- 路由优先级：点击【配置路由优先级】，弹窗会展示共5层路由顺序
  - 神盾风险路由，顺序不可变
  - 灰度路由，可进行拖拽调整顺序
  - AB实验路由，可进行拖拽调整顺序
  - 场景路由，可进行拖拽调整顺序
  - 接口默认路由，顺序不可变

### 限流

#### 频控

- 申请：需提申请给到网关侧进行评估（申请方式：[XBP工单](http://xbp.jd.com/22/apply/4066)），评估完成后会由网关同学进行配置
- 【API管理】-【API详情】-【限流配置】-【用户频控】查看配置信息

#### 限流

- 过滤层级：**网关入口 --> 参数校验 --> 签名校验 --> 神盾防刷层 --> 用户频控 --> 当前限流层**

- [【API管理】](http://color.jd.com/api/publish/list)--- 限流配置

- 限流类型 --- 基础/规则限流 二者**支持同时生效**
  - 基础限流：按照API总量进行**统一秒级流量控制**，仅支持添加**1条**限流配置
    - 限流策略：按总量、按单元（前提是开启了单元化）
    - 配置阈值、处理策略（熔断、排队、Mock）
  - 规则限流：先进行规则配置，对API流量进行过滤，过滤后的请求再进行**秒级流量控制**，最大支持添加**3条**限流配置，若3个规则限流同时生效，则按从上至下顺序进行流量过滤

## 调用

### 创建应用

创建后会分配appid，appid为应用唯一标识

- H5：移动设备的H5页面，PC的WEB页面等**网页页面**类型的应用，选择H5

  > 请求来源：公网域名，用于跨域验证，**调用时需在请求头部添加 Origin 字段，配置请求来源**

- Native：移动设备APP、PC桌面应用等原生**应用**类型，选择Native

  > 调用时需传递签名**sign**和时间戳**t**，签名生成规则[链接](https://cf.jd.com/pages/viewpage.action?pageId=656171784)，调用详情见[调用API](https://cf.jd.com/pages/viewpage.action?pageId=655715296)
  >
  > 签名控制的是网关对请求内的签名按照有效期时长进行判断
  >
  > native应用还会分配到secretkey，用于生成签名信息（secretkey需要妥善保管，不可泄露）

- 微信小程序

  > 请求来源为微信分配的小程序appid。当开启请求来源校验时，调用需在请求头添加referer字段。详见[调用API](https://cf.jd.com/pages/viewpage.action?pageId=655715296)

### 申请授权

在【[发现API](http://color.jd.com/api/authorize/list)】中申请授权，选择要授权的应用

### 调用API

- 请求地址：[【网关调用环境】](https://cf.jd.com/pages/viewpage.action?pageId=657840473)

  如：https://api.m.jd.com/api

- 请求方式：GET或POST

  具体要看API的HTTP Method是什么

- [请求头参数](https://cf.jd.com/pages/viewpage.action?pageId=655715296)

  | 参数名          | 必填 | 描述                         | 备注说明                                                     |
  | :-------------- | :--- | :--------------------------- | :----------------------------------------------------------- |
  | Referer         | 是   | 请求来源                     | 格式要求：字符串前要带协议类型，比如“http://”。小程序类型应用默认必填，用于跨域判断（[jd.com](http://jd.com/)默认可访问） |
  | Accept-Encoding | 是   | 解码方式                     |                                                              |
  | Host            | 是   | 请求网关集群名               |                                                              |
  | `User-Agent`    | 是   | 用于网关做一些安全能力的校验 | 透传给后端是放在agent字段                                    |

- 请求参数 --- 公共参数列表

  > 自定义的非公共参数不会向下透传，自定义的业务参数建议放在ext或者body中

  | 参数名     | 必填 | 描述                                                         |
  | :--------- | :--- | :----------------------------------------------------------- |
  | appid      | 是   | 应用唯一标识                                                 |
  | functionId | 是   | 接口标识                                                     |
  | sign       | 是   | 签名值，签名有效期默认10分钟，签名生成方式查看[【签名规则-签名算法】](http://color.jd.com/help/fastCall/safe) |
  | t          | 是   | 当前时间毫秒数，每次请求都要实时生成                         |
  | body       |      | 这是一个名称为"body"的参数，业务逻辑都放这里面               |

  | 参数名        | 必填     | 描述                                                         | 备注说明                                                     |
  | ------------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | appid         | 是       | 应用唯一标识                                                 | 透传                                                         |
  | functionId    | 是       | 接口标识                                                     | 向下透传参数名改为gfid                                       |
  | t             | 是       | 当前时间毫秒数，每次请求都要实时生成                         | 透传                                                         |
  | client        | 路由     | 客户端类型                                                   | 透传                                                         |
  | clientVersion | 加固     | 客户端版本（native加固必填）                                 | 透传                                                         |
  | loginType     | 登录态   | 登录态类型,取值请参考[【pin相关】](https://cf.jd.com/pages/viewpage.action?pageId=657840945) | 通过网关解析pin，必传。透传                                  |
  | sign          | 应用程序 | 签名值，native应用必填，签名有效期默认10分钟，签名生成方式查看[【签名规则-签名算法】](https://cf.jd.com/pages/viewpage.action?pageId=656171784) | 不透传。网关支持2种签名：1：京东主app签名：[client=apple，iOS签名组件](https://cf.jd.com/pages/viewpage.action?pageId=656171811)、 [client=android，Android签名组件](https://cf.jd.com/pages/viewpage.action?pageId=656171836)2：其他app签名：[默认native类应用签名规则](https://cf.jd.com/pages/viewpage.action?pageId=656171784) |
  | body          | 业务参数 | 这是一个名称为"body"的参数，业务参数都放这里面               | 透传                                                         |
  | ext           | 扩展参数 | 扩展参数，建议json格式。非通用字段的业务类参数，使用ext字段透传，网关不做解析 | 透传                                                         |

- 返回状态码

  - 如果请求返回httpcode = 403，有可能是被限流、频控或跨域拦截等，可以用header的X-API-Request-Id通过网关日志查询平台查询详细日志情况，日志中code字段为本条日志的处理结果（参考code释义）
  - 其他httpcode非200的情况，可联系网关小妹(api-gateway)

- 返回body体

  - 如果返回结果为json体且包含"code"、"echo"，（如：{"code": "-1","echo": "SocketTimeoutException"}，则为网关返回值。参考网关侧返回错误码情况：异常码表
  - 如果不是上述所示返回码，且httpcode=200，则为业务后端返回，请联系对应接口后端研发

- 微信小程序 --- 微信小程序增加了额外的设置

  - 应用类型为“微信小程序”，且开启请求来源校验，网络请求的referer header不可设置
    其格式固定为https://servicewechat.com/{appid}/{version}/page-frame.html
    - {appid} 为微信开放平台分配给小程序的 appid
    - {version} 为小程序的版本号，版本号为 0 表示为开发版、体验版以及审核版本，版本号为 devtools 表示为开发者工具，其余为正式版本（与微信小程序网络请求的 referer header 一样即可）

### Native签名

- 调用api中的请求参数**bef、ep、ef为加密专用字段，生成签名时将被排除**
- 应用类型为Native的应用需要签名，签名值存在有效期，默认10分钟，每次请求需要实时生成签名
- [签名校验工具](http://color.jd.com/help/fastCall/createSign)

- 签名流程

  - 假设传送的参数如下：

    ```
    appid : testKey
    functionId : testMock
    body : {"content":"hello"}
    t : 1511418329195 （当前时间毫秒数）
    ```

  1. 按照**参数名**ASCII字典序，对**参数值**按照（value1&value2&value3…）的格式，拼接成字符串：

     ```
     testKey&{"content":"hello"}&testMock&1511418329195
     ```

  2. 根据密钥（secretkey）生成签名值signValue（secretkey需要妥善保管，不可泄露）

     ```java
     String signValue = hmac_sha256("value1&value2&value3…", secretkey)
     ```

  3. 将"&sign=signValue"值拼装到链接的最后，得到最终请求链接：

     ```http
     https://api.m.jd.com/api?appid=test&functionId=testMock&body={"content":"hello"}&t=1511418329195&sign=b0007361c2841383cd23fd8a576e1721dccb1ffede302b1cf007429b249fc0e3
     ```

- [client=android，Android签名组件](https://cf.jd.com/pages/viewpage.action?pageId=656171836)

- [client=apple，iOS签名组件](https://cf.jd.com/pages/viewpage.action?pageId=656171811)

- 签名算法

  ```java
  import javax.crypto.Mac;
  import javax.crypto.spec.SecretKeySpec;
   
  public class SignMaker {
   
      /**
       *
       * @param map   请求全部参数（request的所有Parameter键值对）
       * @param secretKey  签名key
       * @return
       */
      public String generateSign(Map<String, String> map, String secretKey) {
   
   		// sign对应的value是签名后的值，如果有，就移除
          map.remove("sign");
          List<String> paramNameList = new ArrayList<>();
          map.forEach((key, value) -> {
              // ----加密开关部分不参与签名，如果没有ep、ef、bef这3个参数，可以忽略此判断----
              if (StringUtils.equals(key, "ep") || StringUtils.equals(key, "ef") || StringUtils.equals(key, "bef")) {
                  return;
              }
              // -----end-------
   			// 非空的value放入集合
              if (StringUtils.isNotBlank(value)) {
                  paramNameList.add(key);
              }
          });
          Collections.sort(paramNameList);	// 按ASCII字典排序
   
   		// 拼接
          StringBuilder builder = new StringBuilder();
          boolean first = true;
          for (String paramName : paramNameList) {
              if (first) {
                  builder.append(map.get(paramName));
                  first = false;
              } else {
                  builder.append("&").append(map.get(paramName));
              }
          }
          // -----end-----
          // 加密
          String freshSign = HMACSHA256(builder.toString(), secretKey);
          return freshSign;
   
   
      }
   
      // HMACSHA256加密
      public static String HMACSHA256(String message, String key) {
          try {
              SecretKeySpec signingKey = new SecretKeySpec(key.getBytes(CustomAttributes.UTF_8), "HmacSHA256");
              Mac mac = Mac.getInstance("HmacSHA256");
              mac.init(signingKey);
              byte[] digest = mac.doFinal(message.getBytes(CustomAttributes.UTF_8));
              return bytesToHex(digest);
          } catch (Exception e) {
              return null;
          }
      }
   
   	// 转16进制
      public static String bytesToHex(byte[] bytes) {
          StringBuilder builder = new StringBuilder();
          int digital;
          for (int i = 0; i < bytes.length; i++) {
              digital = bytes[i];
   
              if (digital < 0) {
                  digital += 256;
              }
              if (digital < 16) {
                  builder.append("0");
              }
              builder.append(Integer.toHexString(digital));
          }
          return builder.toString();
      }
  }
  ```

## 老接口改造

- 问题
  -  需要新增承接color参数的color接口v2，假设原有服务有100个接口，那么需要新增100个color请求接口 
  - 新增接口对应的参数校验以及参数转换为bean的工作，原有框架所提供的校验和转换能力无法复用，代码将十分冗余
  - 原有对接口的防频以及降级，报警等配置，需要针对新接口一一添加控制
  - 新增接口意味着需要完整走测试流程。也就意味着接入网关将是一个长期的工作

**老接口适配**

- 前端接口改造不可避免，约定

  - GET 请求中body的内容需要进行url编码

    ```
    GET 请求
    原接口调用: http://rsp.jd.com/resource/lifePrivilege/receive/v1?uniqueId=111111&a=b
    //对参数进行转换 body={"uniqueId":"111111","a":"b"},再进行url编码
    新传参：http://rsp.jd.local/resource/lifePrivilege/receive/v1?body=%7B%22uniqueId%22%3A%22111111%22%2C%22a%22%3A%22b%22%7D
    ```

  - POST 中body的透传，POST中body的内容不需要进行URL编码 ；要严格按照原x-www-form-urlencoded提交json参数。前端在传body参数的时候要注意json的转换。注意看json的key和之前提交参数的key和val是保持一致的

    ```
    POST请求
    原接口调用：
    curl --location --request POST 'http://rsp.jd.com/gift/submitPlusGiftOrder' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'skuToken=1111' \
    --data-urlencode 'invoiceTitle=40' \
    --data-urlencode 'couponIds=11,12,13' \
    --data-urlencode 'user.title=title'
    
    新传参：
    curl --location --request POST 'http://rsp.jd.local/gift/submitPlusGiftOrder' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'body={
    	"skuToken": "1111",
    	"invoiceTitle": "40",
       "user.title":"title",
       "couponIds":"11,12,13"
    }'
    ```

### 方式1：过滤器

> - 直接拦截请求参数，添加自定义的参数转换逻辑
>
> - 原接口接收的是json，用@RequestBody解析json
> - 现前端以表单传参，需要解析body中的json格式的业务参数，添加到所有参数表单对应的Map中
> - 在控制层，接收到的参数以表单解析
>   - 此时，实体属性，必须与参数名对应，会自动将参数值封装到实体对象中
>   - 若参数名不对应，只能用@RequestParam("")注解，对属性进行一一对应
>   - 缺点：若包含很多body以外的参数，需要@RequestParam("")注解，对属性进行一一对应

#### Filter过滤器

```java
public class ColorFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest req = null ;
        if(servletRequest instanceof  HttpServletRequest){
            req = (HttpServletRequest)servletRequest;
        }
        // X_API_REQUEST_ID 是由Color网关生成
        String requestId = req.getHeader("X_API_REQUEST_ID");
        // 不为空说明经过了网关，需要进行参数处理
        if(StringUtils.isNotBlank(requestId)){
            ColorRequestWrapper changeRequestWrapper = new ColorRequestWrapper(req);
            req = changeRequestWrapper ;
        }
        // 放行
        filterChain.doFilter(req, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
```

#### Request请求改造

```java
public class ColorRequestWrapper extends HttpServletRequestWrapper {

    /**
     * parameterMap 所有参数的Map集合
     */
    private Map<String, Object> parameterMap;


    public ColorRequestWrapper(HttpServletRequest request) {
        super(request);
        // 获取参数集合
        Map parameters = request.getParameterMap();
        parameterMap = new HashMap();
        parameterMap.putAll(parameters);

        // 获取body参数对应的值
        String bodyParam = request.getParameter("body");
        if (StringUtils.isNotBlank(bodyParam)) {
            try {
                // body参数解析为Map
                Map map = JSON.parseObject(bodyParam, Map.class);

                Set<String> keySet = map.keySet();
                for (String key : keySet) {
                    // 检测重复
                    if (parameterMap.containsKey(key)) {
//                        System.out.println("重复字段");
                    }
                    
                    // 从body对应的Map中获取，添加到所有参数Map中
                    Object val = map.get(key);
                    parameterMap.put(key, val == null ? null : val.toString());
                }

            } catch (Exception e) {
//                System.out.println(e);
            }
        }

    }
    // 重写几个HttpServletRequestWrapper中的方法

    /**
     * 获取所有参数名
     *
     * @return 返回所有参数名
     */
    @Override
    public Enumeration getParameterNames() {
        Vector vector = new Vector<>(parameterMap.keySet());
        return vector.elements();
    }

    /**
     * 获取指定参数名的值，如果有重复的参数名，则返回第一个的值 接收一般变量 ，如text类型
     *
     * @param name 指定参数名
     * @return 指定参数名的值
     */
    @Override
    public String getParameter(String name) {
        if (parameterMap.containsKey(name)) {
            String results = parameterMap.get(name).toString();
            return results;
        }
        return null;
    }

    /**
     * 获取指定参数名的所有值的数组，如：checkbox的所有数据
     * 接收数组变量 ，如checkbox类型
     *
     * @return
     */
    @Override
    public String[] getParameterValues(String name) {
        String s = parameterMap.get(name).toString();
        return new String[]{s};
    }

    @Override
    public Map getParameterMap() {
        return parameterMap;
    }

}
```

- 加报警

```java
@Slf4j
public class ColorRequestWrapper extends HttpServletRequestWrapper {

	/**
	 * BODY --color需要透传的业务参数
	 */
	public static final String BODY = "body";
	/**
	 * COLOR_REQUEST_PARAM_REPEAT
	 */
	public static final String COLOR_REQUEST_PARAM_REPEAT = "plus.color.request.param.repeat";
	/**
	 * parameterMap 所有参数的Map集合
	 */
	private Map parameterMap ;

	/**
	 * alarmMsg报警信息
	 */
	String alarmMsg = "【color参数请求覆盖报警】接口:{0},参数:{1},old:{2},new:{3}";

	public ColorRequestWrapper(HttpServletRequest request) {
		super(request);
        // 获取参数集合
		parameterMap = Maps.newHashMap(request.getParameterMap()) ;
        // 获取body参数对应的值
		String bodyParam = request.getParameter(BODY);
		if (StringUtil.isNotBlank(bodyParam)) {
			try {
				Map map = JsonUtil.jsonToMap(bodyParam, Map.class, String.class, Object.class);
				Set keySet = map.keySet();
				for (String key : keySet) {
					if(parameterMap.containsKey(key)){
						String format = MessageFormat.format(alarmMsg, request.getRequestURI(), key, getParameter(key), map.get(key));
						ProfilerUtil.alarm(COLOR_REQUEST_PARAM_REPEAT,format);
						log.warn(format);
					}
					Object val = map.get(key);
					parameterMap.put(key, new String[]{val==null?null:val.toString()});
				}

			} catch (Exception e) {
				log.error("转换异常", e);
			}
		}
		// 不可进行数据修改
		parameterMap = Collections.unmodifiableMap(parameterMap);
	}

	// 重写几个HttpServletRequestWrapper中的方法

	/**
	 * 获取所有参数名
	 *
	 * @return 返回所有参数名
	 */
	@Override
	public Enumeration getParameterNames() {
		Vector vector = new Vector<>(parameterMap.keySet());
		return vector.elements();
	}

	/**
	 * 获取指定参数名的值，如果有重复的参数名，则返回第一个的值 接收一般变量 ，如text类型
	 *
	 * @param name 指定参数名
	 * @return 指定参数名的值
	 */
	@Override
	public String getParameter(String name) {
		if (parameterMap.containsKey(name)) {
			String[] results = parameterMap.get(name);
			return results[0];
		}
		return null;
	}
	/**
	 * 获取指定参数名的所有值的数组，如：checkbox的所有数据
	 * 接收数组变量 ，如checkbox类型
	 */
	@Override
	public String[] getParameterValues(String name) {
		return parameterMap.get(name);
	}

	@Override
	public Map getParameterMap() {
		return parameterMap;
	}

	public void setParameterMap(Map parameterMap) {
		this.parameterMap = parameterMap;
	}
}
```

#### 配置

```xml
<filter>
    <filter-name>ColorFilter</filter-name>
    <filter-class>com.jd.test.filter.ColorFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>ColorFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```



#### application/json接口兼容性

上面我们解决了原后台服务POST提交是application/x-www-form-urlencoded方式的接口，也有很多接口服务是通过application/json这种方式进行提交

- 方式1

  > **新增v2接口，v2复制v1接口，请求参数中去掉@RequestBody注解**，即改为x-www-form-urlencoded方式。 v2中直接调用v1

- 方式2

  > 如果post接口中全部都是 application/json这种请求方式 ； 参考第三章的改造逻辑，修改request的header属性，将content-type修改为application/json，并且将body参数从param中取出后，再放置到request.setBody()中

### 方式2注解+参数解析器

> - 方式1中的问题就是，当初body外还有很多其他参数，对每个参数一一对应很麻烦
> - 定义一个
> - 通过自定义的参数解析器，捕获参数，符合特定条件，进行自定义的解析（此处以注解的形式）
> - 拿到形参类型

#### 定义注解

```java
@Target({ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ColorParam {
}
```

#### 定义解析器

```java
public class ColorParamResolver implements HandlerMethodArgumentResolver {

    // Controller方法参数是否满足条件：加了@ColorParam这个注解
    @Override
    public boolean supportsParameter(MethodParameter methodParameter) {
        // 获取注解
        ColorParam ann = methodParameter.getParameterAnnotation(ColorParam.class);
        // 不为null返回true，执行resolveArgument方法
        return Objects.nonNull(ann);
    }

    /**
     * @param methodParameter       Controller上的方法
     * @param modelAndViewContainer modelAndView容器
     * @param request               请求信息
     * @param webDataBinderFactory  web数据绑定工厂
     * @return
     * @throws Exception
     */
    @Nullable
    @Override
    public Object resolveArgument(MethodParameter methodParameter,
                                  @Nullable ModelAndViewContainer modelAndViewContainer,
                                  NativeWebRequest request,
                                  @Nullable WebDataBinderFactory webDataBinderFactory) throws Exception {
        // 1、实例化方法参数，即封装的BaseParam对象
        Object baseParam = BeanUtils.instantiateClass(methodParameter.getParameterType());
        // 通过PropertyAccessorFactory属性访问工厂拿到baseParam对应的beanWrapper
        BeanWrapper beanWrapper = PropertyAccessorFactory.forBeanPropertyAccess(baseParam);

        // 2、从request中获取请求参数集合，解析前端传来的所有参数
        Map<String, String[]> parameterMap = request.getParameterMap();
        // 遍历Controller方法形参中的属性
        Field[] fields = methodParameter.getParameterType().getDeclaredFields();
        for (Field field : fields) {
            // 获取BaseParam中每个属性对应的参数名
            String[] values = parameterMap.get(field.getName());
            // 参数为空，则跳过
            if (Objects.isNull(values) || values.length == 0) {
                continue;
            }
            // 不为空，则为通过beanWrapper给BaseParam赋值
            beanWrapper.setPropertyValue(field.getName(), values);
        }

        // 3、处理body，从request中获取body参数对应的值
        String body = request.getParameter("body");
        // 没有body参数直接返回baseParam
        if (StringUtils.isBlank(body)) {
            return baseParam;
        }
        // 获取参数泛型的类型
        Type baseParamGenericType = methodParameter.getGenericParameterType();
        if (baseParamGenericType instanceof ParameterizedType) {
            // 属于参数类型，进行强转
            ParameterizedType parameterizedType = (ParameterizedType) baseParamGenericType;
            Type bodyBeanType = parameterizedType.getActualTypeArguments()[0];
            // 解析json
            Object bodyBean = JSON.parseObject(body, bodyBeanType);
            // 通过beanWrapper给BaseParam的bodyBean属性赋值
            beanWrapper.setPropertyValue("bodyBean", bodyBean);
        }
        return baseParam;
    }
}
```

#### 切面配置

- 方式一：xml

  ```xml
  <!-- 方式一：spring配置 -->
  <mvc:annotation-driven>
      <mvc:argument-resolvers>
          <bean class="xx.xxx.xxx.ColorParamResolver"/>
      </mvc:argument-resolvers>
  </mvc:annotation-driven>
  ```

- 方式二：配置类

  ```java
  <!-- 方式二：spring boot配置 -->
  @Configuration
  public class ApplicationConfigurer extends WebMvcConfigurerAdapter {
      @Override
      public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
          super.addArgumentResolvers(argumentResolvers);
          argumentResolvers.add(new TestArgumentResolver());
      }
  }
  ```

#### Bean

- 入参基本参数

  ```java
  @Data
  @ApiModel(description = "基本参数")
  public class BaseParam<Body> {
  
      @ApiModelProperty(value = "业务参数body", required = true)
      private String body;
  
      @ApiModelProperty(hidden = true, value = "客户端名称")
      private String client;
  
      @ApiModelProperty(hidden = true, value = "客户端版本号")
      private String clientVersion;
  
      @ApiModelProperty(hidden = true, value = "客户端小版本号")
      private String build;
  
      @ApiModelProperty(hidden = true, value = "客户端设备号")
      private String uuid;
  
      @ApiModelProperty(hidden = true, value = "客户端操作系统版本")
      private String osVersion;
  
      @ApiModelProperty(hidden = true, value = "客户端屏幕尺寸")
      private String screen;
  
      @ApiModelProperty(hidden = true, value = "请求网络类型")
      private String networkType;
  
      @ApiModelProperty(hidden = true, value = "合作伙伴")
      private String partner;
  
      @ApiModelProperty(hidden = true, value = "全链路测试标识，压测时使用")
      private String forcebot;
  
      @ApiModelProperty(value = "用户的京东pin")
      private String pin;
  
      @ApiModelProperty(value = "用户ip")
      //@NotEmpty(message = "用户ip不能为空")
      private String ip;
  
      @ApiModelProperty(hidden = true, value = "访问京东时用户IP的原始端口")
      private String port;
  
      @ApiModelProperty(hidden = true, value = "根据用户ip计算出的附加信息")
      private String location;
  
      @ApiModelProperty(hidden = true, value = "用户会员级别")
      private String umg;
  
      @ApiModelProperty(hidden = true, value = "用户风险级别")
      private String urg;
  
      @ApiModelProperty(hidden = true, value = "plus级别")
      private String upg;
  
      @ApiModelProperty(hidden = true, value = "设备品牌")
      private String d_brand;
  
      @ApiModelProperty(hidden = true, value = "设备型号")
      private String d_model;
  
      @ApiModelProperty(hidden = true, value = "语言 中：zh_CN 英：en_US 泰：th_TH")
      private String lang;
  
      @ApiModelProperty(hidden = true, value = "微信手Q用户标识， true是默认用户， false为非默认")
      private String wqDefault;
  
      @ApiModelProperty(hidden = true, value = "WIFI bssid")
      private String wifiBssid;
  
      @ApiModelProperty(hidden = true, value = "前端请求携带的HTTP Referer")
      private String referer;
  
      @ApiModelProperty(hidden = true, value = "前端请求携带的User-Agent")
      private String agent;
  
      @ApiModelProperty(value = "业务参数body实体类型, body 需要在请求 Controller 之前转换成 bodyBean")
      private Body bodyBean;
  }
  ```

- 返回结果

  ```java
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public class ResponseResult<T> implements Serializable {
  
  
      private static final long serialVersionUID = 3925001664759656507L;
  
      /**
       * 请求状态
       */
      private boolean success;
      /**
       * 返回状态码
       */
      private Integer code;
  
      /**
       * 返回状态码
       */
      private String errCode;
  
      /**
       * 返回状态描述
       */
      private String errMsg;
  
      /**
       * 结果集
       */
      private T data;
  
      /**
       * 对象 Builder：success
       */
      public ResponseResult<T> success() {
          this.success = true;
          this.code = 0;
          return this;
      }
  
      /**
       * 对象 Builder：success
       */
      public ResponseResult<T> success(String message,String errCode) {
          this.success = true;
          this.code = 0;
          this.errMsg = message;
          this.errCode = errCode;
          return this;
      }
      public ResponseResult<T> success(String message,Integer errCode) {
          this.success = true;
          this.code = 0;
          this.errMsg = message;
          this.errCode = String.valueOf(errCode);
          return this;
      }
  
      /**
       * 对象 Builder：success
       */
      public ResponseResult<T> failed() {
          this.success = true;
          this.code = 0;
          return this;
      }
  
  
      /**
       * 对象 Builder：errorCode
       */
      public ResponseResult errorCode(String errCode) {
          this.errCode = errCode;
          return this;
      }
  
      /**
       * 对象 Builder：errMsg
       */
      public ResponseResult errMsg(String errMsg) {
          this.errMsg = errMsg;
          return this;
      }
  
      /**
       * 对象 Builder：data
       */
      public ResponseResult data(T data) {
          this.data = data;
          return this;
      }
  
      public ResponseResult code(Integer code) {
          this.code = code;
          return this;
      }
  
      public void setSuccess(String errCode, String errMsg) {
          this.success = true;
          this.errCode = errCode;
          this.errMsg = errMsg;
          this.code = 0;
      }
  
      public ResponseResult<T> buildSuccess(HandCodeEnum result) {
          this.success = true;
          this.errCode = String.valueOf(result.getKey());
          this.errMsg = result.getDesc();
          this.code = 0;
          return this;
      }
  
      public void setFailure(String errCode, String errMsg) {
          this.success = true;
          this.errCode = errCode;
          this.errMsg = errMsg;
          this.code = 0;
      }
  
      public void setFailure(Integer errCode, String errMsg) {
          this.success = true;
          this.errCode = String.valueOf(errCode);
          this.errMsg = errMsg;
          this.code = 0;
      }
  
      public ResponseResult<T> buildFailure(HandCodeEnum result) {
          this.success = true;
          this.errCode = String.valueOf(result.getKey());
          this.errMsg = result.getDesc();
          this.code = 0;
          return this;
      }
  }
  ```

- 异常码枚举

  ```java
  public enum HandCodeEnum {
  
      SUCCESS(0, "系统信息", "成功"),
      NO_SESSION(401001, "系统信息", "未登录"),
      EMPTY(1000, "系统信息", "结果为空");
  
  
      /******************************【校验异常】 1000 ~ 1999***************************************/
  
  
      /******************************【业务异常】 2000 ~ 4999 **************************************/
  
  
      /******************************【系统异常】 5000 ~ 5999 ***************************************/
  
  
      /******************************【其它业务异常】 6000 ~ 9999 ***********************************/
  
  
      private Integer key;
      private String type;
      private String desc;
      //默认类型
      private static final String defaultType = "";
  
      HandCodeEnum(Integer key, String desc) {
          this(key, defaultType, desc);
      }
  
      HandCodeEnum(Integer key, String type, String desc) {
          this.key = key;
          this.type = type;
          this.desc = desc;
      }
  
      public Integer getKey() {
          return key;
      }
  
      public void setKey(Integer key) {
          this.key = key;
      }
  
      public String getType() {
          return type;
      }
  
      public void setType(String type) {
          this.type = type;
      }
  
      public String getDesc() {
          return desc;
      }
  
      public void setDesc(String desc) {
          this.desc = desc;
      }
  
  }
  ```

## 文档

### http

#### 评论

- 地址
  - 预发环境：https://beta-api.m.jd.com/api
  - 正式环境：https://api.m.jd.com/api
- url：

- 后端域名：openapiclient-xl-v2yf.jd.local

- 后端路径：/out/wxprogC/sku/comments

- api名称：jpxd_comments

- 请求方式：Post

- headers参数：

- body入参：

- 出参：

#### sku详情

- 地址
  - 预发环境：https://beta-api.m.jd.com/api
  - 正式环境：https://api.m.jd.com/api
- url：

- 后端域名：openapiclient-xl-v2yf.jd.local

- 后端路径：/out/wxprogC/sku/detail

- api名称：jpxd_detail

- 请求方式：Post

- headers参数：

- body入参：

- 出参：

### JSF

**公共入参：统一参考color规范：http://color.jd.com/help/fastPublish/jsfCall** 

#### 领取优惠券 receiveOnmiCoupon

地址

- 预发环境：beta-api.m.jd.com
- 正式环境：api.m.jd.com

**JSF接口    com.jd.jw.store.color.CouponColorProvider**

**方法       execute**

**别名 预发   CCP_JW_ST**

**Color接口  CouponColorProvider**

**body入参** 

| 序号 | 参数               | 参数说明                                                     | 类型   | 是否必填 |
| :--- | :----------------- | :----------------------------------------------------------- | :----- | :------- |
| 1    | funcName           | 固定参数 ”receiveOnmiCoupon”                                 | String | Y        |
| 2    | couponPlatformType | 领券平台类型（1 jpass，2 积理，3、小时购 ）必填              | String | Y        |
| 3    | batchId            | 券id （用于根据券id和couponPlatformType，查询是门店券还是平台券）必填 | String | Y        |
| 4    | storeId            | 门店id （注意：指jpass门店id或积理门店id，非外部门店id） 必填 | String | Y        |
| 5    | activityId         | 活动id，必须是数字 积理必填，jpass券非必填                   | String |          |
| 6    | activityType       | 活动类型 积理必填，jpass券非必填                             | String |          |
| 7    | eid                | 设备id 拉新渠道必填、风控渠道非必填                          | String |          |
| 8    | tenantId           | 租户id 积理必填，jpass非必填                                 | String |          |
| 9    | ip                 |                                                              |        |          |
| 10   | pin                |                                                              |        |          |
| 11   | h5sr               |                                                              |        |          |
| 12   | `encryptedKey`     | `加密key 小时购必填`                                         | String |          |
| 13   | `reqId`            | `加密key和roleId的盐值 小时购必填`                           | String |          |
| 14   | `roleId`           | `活动ID 传递给前台加密后的roleId 小时购必填`                 | String |          |

**出参** ColorResponse

| 序号 | 参数      | 参数说明     | 类型    |
| :--- | :-------- | :----------- | :------ |
| 序号 | 参数      | 参数说明     | 类型    |
| 1    | success   | 操作是否成功 | boolean |
| 2    | data      | 结果         | boolean |
| 3    | `code`    | 错误码       | Integer |
| 4    | `message` | 错误描述     | String  |

**入参示例**

```json
{
    "pin": "jd_aQsEnZsecshA",
    "ip": "240e:47c:4ea1:69c:1701:590:71ab:3de7",
    "body": {
        "funcName": "receiveOnmiCoupon",   
         "batchName": "H计划优惠券-折扣券",
                 "endDate": 1659283199000,
                "receiveStatus": 0,
                "batchId": 100293802,
                "storeId": 50020941,
                "couponPlatformType": 2,
                "activityId": "18560357",
                "couponAmount": "0",
                "validityType": 2,
                "couponType": 2,
                "quota": "20",
                "tenantId": 10010,
                "limitCategory": 1,
                "activityType": 21,
                "startDate": 1658073600000  
	}
}
```

**出参示例**

```json
{
    "code": 0,
    "data": true,
    "success": true
}
```

## 参考

### [神盾三方接入的前置条件](https://cf.jd.com/pages/viewpage.action?pageId=544045118)
